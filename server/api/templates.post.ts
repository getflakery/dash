import { useDB } from "../utils/db"
import { useValidatedBody, z, } from 'h3-zod'
import { templates, files as schemaFiles, templateFiles, privateBinaryCache } from '~/server/database/schema'
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm'



import petname from 'node-petname'
import { ChangeResourceRecordSetsCommand } from "@aws-sdk/client-route-53";
import { AWSDeployment } from "~/mod/deployment";
import { useTurso } from "../utils/turso";



function toSubDomain(text: string) {
  if (text.length === 0) {
    text = petname(2, "-")
  }
  return text
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9- ]/g, '') // Remove invalid characters
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single one
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 63); // Ensure the length does not exceed 63 characters
}

async function createCNAMERecord(domainName, targetDNS, hostedZoneId, route53Client) {
  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: "UPSERT",
          ResourceRecordSet: {
            Name: domainName,
            Type: "CNAME",
            TTL: 300,
            ResourceRecords: [
              {
                Value: targetDNS
              }
            ]
          }
        }
      ]
    },
    HostedZoneId: hostedZoneId
  };

  try {
    const command = new ChangeResourceRecordSetsCommand(params);
    const response = await route53Client.send(command);
    console.log("CNAME record created:", response);
  } catch (error) {
    console.error("Error creating CNAME record:", error);
    throw new Error(`CNAMERecordCreationFailed: ${error}`);
  }
}



export default eventHandler(async (event) => {
  let {
    name,
    flakeURL,
    awsInstanceType,
    files,
  } = await useValidatedBody(event, {
    name: z.string().optional(),
    flakeURL: z.string(),
    awsInstanceType: z.string().optional(),
    files: z.array(z.object({
      id: z.string(),
      path: z.string(),
      content: z.string(),
    })).optional(),
  })
  const session = await requireUserSession(event)
  const userID = session.user.id

  const db = useDB()

  const id = uuidv4()
  let first6OfID = id.substring(0, 6)


  const host = `${toSubDomain(name || "")}-${first6OfID}`
  const template = await db.insert(templates).values({
    name,
    flakeURL,
    awsInstanceType,
    userID,
    id: uuidv4(),
    host,
    createdAt: Date.now(),
  }).returning().get()


  const route53Client = useRoute53Client()
  await createCNAMERecord(`${host}.flakery.xyz`, "loadb.flakery.xyz", "Z03309493AGZOVY2IU47X", route53Client);

  // create metadata files for userid, templateid

  if (files === undefined) {
    files = []
  }

  files.push({
    id: uuidv4(),
    path: "/metadata/user-id",
    content: userID.toString(),
  })

  files.push({
    id: uuidv4(),
    path: "/metadata/template-id",
    content: template.id,
  })

  files.push({
    id: uuidv4(),
    path: "/metadata/template-host",
    content:`https://${ template.host??""}.flakery.xyz`,
  })

  // add token 

  const tok = useJWT().sign({ userID, templateID: template.id })

  files.push({
    id: uuidv4(), 
    path: "/metadata/user-token",
    content: tok,
  })

  console.log('creating encrypted files')

  // for each file, create if not exists, otherwise update if exists

  await Promise.all(files?.map(async (file) => {
    const cs = useCryptoString()
    const { encryptedData, iv } = cs.encrypt(file.content)
    await db.insert(schemaFiles).values({
      path: file.path,
      content: encryptedData,
      userID,
      id: file.id,
      iv,
    }).execute()
  }))

  console.log('creating template files')
  console.log(files)  
  console.log(template.id)

  await Promise.all(files?.map(async (file) => {
    await db.insert(templateFiles).values({
      fileId: file.id,
      templateId: template.id,
      id: uuidv4(),
    }).execute()
  }))

  console.log({
    "message": 'creating private binary cache',
    "userID": userID,
  })

  // check if privateBinaryCache exists for this user
  // if not, create one
  let tursoClient = useTurso()
  const  existingPrivateBinaryCache =(await  tursoClient.execute({
    sql: `SELECT * FROM private_binary_cache WHERE name = ?`,
    args: [userID.toString()]
  })).rows.length > 0

  console.log('existingPrivateBinaryCache', existingPrivateBinaryCache)
  if (!existingPrivateBinaryCache) {
    const bcacheID = "6bfa64d0-2ffa-4620-8ad3-0fae9dbebdf0"; // todo hardcoded tech debt
    const config = useRuntimeConfig(event)
    console.log('creating deployment for bcache')

    let deployment = new AWSDeployment(
      {
        config,
        templateID: bcacheID,
        userID: "57335981.0", // todo hardcoded tech debt
        production: false,
        overrides: {
          awsInstanceType: "m7i.large",
          publicIP: false,
          loadBalancer: false,
          minInstances: 1,
        }
      })

      console.log('deploying bcache')
    
    let bcache = await deployment.Create();
    console.log('saving bcache')

    await db.insert(privateBinaryCache).values({
      name: userID,
      id: uuidv4(),
      deploymentID: bcache.id,
      createdAt: Date.now(),
    }).execute();

  }


  return template
})
