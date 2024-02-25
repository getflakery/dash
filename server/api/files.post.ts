import { useDB } from "../utils/db"
import { useValidatedParams, useValidatedBody, z, } from 'h3-zod'
import { files } from '~/server/database/schema'
import { v4 as uuidv4 } from 'uuid';

export default eventHandler(async (event) => {
  const { path, content } = await useValidatedParams(event, {
    path: z.string(),
    content: z.string()
  })
  const session = await requireUserSession(event)
  const userID = session.user.id

  const db = useDB()

  const file = await db.insert(files).values({
    path,
    content,
    userID,
    id: uuidv4(),
  }).returning().get()
  return file
})
