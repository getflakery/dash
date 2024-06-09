import { useDB } from "../utils/db"
import { useValidatedBody, z, } from 'h3-zod'
import { templates, files as schemaFiles, templateFiles } from '~/server/database/schema'
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm'

import petname from 'node-petname'
import {  ChangeResourceRecordSetsCommand } from "@aws-sdk/client-route-53";

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
  const {
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

 const host = toSubDomain(name || "")
  const template = await db.insert(templates).values({
    name,
    flakeURL,
    awsInstanceType,
    userID,
    id: uuidv4(),
    host,
  }).returning().get()

  
  const route53Client = useRoute53Client()
  await createCNAMERecord(`${host}.flakery.xyz`, "loadb.flakery.xyz", "Z03309493AGZOVY2IU47X", route53Client);


  // for each file, create if not exists, otherwise update if exists
  files?.forEach(async (file) => {
    const existingFile = await db.select().from(schemaFiles).where(eq(schemaFiles.id, file.id)).get()
    if (existingFile) {
      const cs = useCryptoString()
      const { encryptedData, iv } = cs.encrypt(file.content)
      await db.update(schemaFiles).set({
        path: file.path,
        content: encryptedData,
        iv,
      }).where(eq(schemaFiles.id, file.id)).execute()
    } else {
      const cs = useCryptoString()
      const { encryptedData, iv } = cs.encrypt(file.content)
      await db.insert(schemaFiles).values({
        path: file.path,
        content: encryptedData,
        userID,
        id: file.id,
        iv,
      }).execute()
    }
  })

  // for each file, create a junction record 
  files?.forEach(async (file) => {
    await db.insert(templateFiles).values({
      fileId: file.id,
      templateId: template.id,
      id: uuidv4(),
    }).execute()
  })




  return template
})
