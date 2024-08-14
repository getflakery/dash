import { useValidatedParams, useValidatedBody, z, } from 'h3-zod'
import { files } from '~/server/database/schema'
import { v4 as uuidv4 } from 'uuid';

export default eventHandler(async (event) => {
  const { target } = await useValidatedBody(event, {
    target: z.string(),
  })
  const session = await requireUserSession(event)
  const userID = session.user.id

  const cs = useCryptoString()

  const {encryptedData, iv} = cs.encrypt(content)

  const db = useDB()

  const file = await db.insert(files).values({
    path,
    content: encryptedData,
    userID,
    id: uuidv4(),
    iv,
  }).returning().get()
  return file
})
