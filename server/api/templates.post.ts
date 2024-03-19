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
      const cs = useCryptoString()
      const {encryptedData, iv} = cs.encrypt(file.content)
      await db.update(schemaFiles).set({
        path: file.path,
        content: encryptedData,
        iv,
      }).where(eq(schemaFiles.id, file.id)).execute()
    } else {
      const cs = useCryptoString()
      const {encryptedData, iv} = cs.encrypt(file.content)
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
