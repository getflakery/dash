import { useDB } from "../utils/db"
import { useValidatedBody, z, } from 'h3-zod'
import { templates, files as schemaFiles, templateFiles, networks, ports as portsSchema } from '~/server/database/schema'
import { v4 as uuidv4 } from 'uuid';
import { eq, and} from 'drizzle-orm'


export default eventHandler(async (event) => {
  const {
    name,
    flakeURL,
    awsInstanceType,
    files,
    domain,
    ports,
    network,
    newNetWork,
  } = await useValidatedBody(event, {
    name: z.string().optional(),
    flakeURL: z.string(),
    awsInstanceType: z.string().optional(),
    files: z.array(z.object({
      id: z.string(),
      path: z.string(),
      content: z.string(),
    })).optional(),
    domain: z.string().optional(),
    ports: z.array(z.number()).optional(),
    network: z.string().optional(),
    newNetWork: z.boolean().optional(),
  })
  const session = await requireUserSession(event)
  const userID = session.user.id

  const db = useDB()

  const template = await db.insert(templates).values({
    name,
    flakeURL,
    awsInstanceType,
    userID,
    id: uuidv4(),
  }).returning().get()


  // for each file, create if not exists, otherwise update if exists
  files?.forEach(async (file) => {
    const existingFile = await db.select().from(schemaFiles).where(eq(schemaFiles.id, file.id)).get()
    if (existingFile) {
      await db.update(schemaFiles).set({
        path: file.path,
        content: file.content,
      }).where(eq(schemaFiles.id, file.id)).execute()
    } else {
      await db.insert(schemaFiles).values({
        path: file.path,
        content: file.content,
        userID,
        id: file.id,
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

  if (newNetWork) {
    const net = await db.insert(networks).values({
      domain: generateSubdomain(6),
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
    return template
  }

  if (network) {
    const net = await db.select().from(networks).where(and(
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
    return template
  }

  if (!domain) {
    throw new Error("Domain is required")
  }

  const net = await db.insert(networks).values({
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
  

  return template
})
