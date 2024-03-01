import { useDB } from "../utils/db"
import {  useValidatedBody, z, } from 'h3-zod'
import { templates, files as schemaFiles, templateFiles as schemaTemplateFiles, instances, networks, ports as portsSchema } from '~/server/database/schema'
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm'
import config from '~/config';
import petname from 'node-petname'

export default eventHandler(async (event) => {
  const { templateID, domain, ports, network,newNetWork } = await useValidatedBody(event, {
    templateID: z.string().uuid(),  
    domain: z.string().optional(),
    ports: z.array(z.number()).optional(),
    network: z.string().optional(),
    newNetWork: z.boolean().optional(),
  })
  const session = await requireUserSession(event)
  const userID = session.user.id

  const db = useDB()

  const {flakeURL, awsInstanceType } = await db.select().from(templates).where(
    and(
      eq(templates.id, templateID),
      eq(templates.userID, userID) 
  )).get();



  const templateFiles = await db.select().from(schemaTemplateFiles).where(
    eq(schemaTemplateFiles.templateId, templateID)
  ).all();

  const files = await Promise.all(templateFiles?.map(async (templateFile) => 
    await db.select().from(schemaFiles).where(
      eq(schemaFiles.id, templateFile.fileId)
    ).get()
  ))


  const net = await createNetwork(
    db, 
    userID,
    templateID,
    domain, ports, network,newNetWork
  )


  let r = await fetch(`${config.BACKEND_URL}/flake`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'X-Token': process.env.AUTH_TOKEN ?? "b355b95e-1933-4103-8f7e-156687fa0a1f",
    },
    body: JSON.stringify({
      instanceType: awsInstanceType,
      flakeURL,
      files,
      subdomainPrefix: net?.domain,
    }),
  })
  // {
  //   flakeCompute: {
  //     domain: 'shrgvg.app.flakery.xyz',
  //     flakeURL: 'something',
  //     id: '4ecf13b6-f2fa-42ce-a40b-26afaa18cc1b',
  //     instanceID: 'i-0939b274f6556da26',
  //     status: 'creating instance\ninstance created\n'
  //   }
  // }
  // console.log(await r.json())

  const jsonResponse = await r.json()
  const awsInstanceID = jsonResponse.flakeCompute.instanceID
  const flakeComputeID = jsonResponse.flakeCompute.id
  const name = petname(2, "-")

  return await db.insert(instances).values({
    id: uuidv4(),
    userID,
    templateID,
    flakeComputeID,
    awsInstanceID,
    name,
    network: net.id
  }).returning().get()
})


function generateSubdomain(length: number): string {
  // Define the characters that can be used in the subdomain
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let subdomain = '';

  // Generate a subdomain of the desired length
  for (let i = 0; i < length; i++) {
    // Pick a random character from the chars string
    const randomIndex = Math.floor(Math.random() * chars.length);
    subdomain += chars.charAt(randomIndex);
  }

  return subdomain;
}

async function createNetwork(
  db, 
  userID,
  templateID,
  domain, ports, network,newNetWork
) {
  let net;

  if (newNetWork) {
    net = await db.insert(networks).values({
      domain: generateSubdomain(6),
      id: uuidv4(),
      userID,
      templateID: templateID,
    }).returning().get()
    ports?.forEach(port => {
      db.insert(portsSchema).values({
        number: port,
        network: net.id,
        id: uuidv4(),
      }).execute()
    })
    return net
  }

  if (network) {
    net = await db.select().from(networks).where(and(
      eq(networks.domain, network),
      eq(networks.userID, userID),
    )).get()

    if (!net) {
      throw new Error("Network not found")
    }

    // set this network tempalte id 
    await db.update(networks).set({
      templateID: template.id,
    }).where(eq(networks.id, net.id)).execute()

    ports?.forEach(port => {
      db.insert(portsSchema).values({
        number: port,
        network: net.id,
        id: uuidv4(),
      }).execute()
    })
    return net
  }

  if (domain) {
     net = await db.insert(networks).values({
      domain,
      id: uuidv4(),
      userID,
      templateID: template.id,
    }).returning().get()
  
    ports?.forEach(port => {
      db.insert(portsSchema).values({
        number: port,
        network: net.id,
        id: uuidv4(),
      }).execute()
    })
  }
  return net

}