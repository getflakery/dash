import { useValidatedParams, useValidatedBody, z, } from 'h3-zod'
import { target } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid';

export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })
  const {
    // deleteFiles,
    host
  } = await useValidatedBody(event, {
    // deleteFiles: z.boolean(),
    host: z.string()
  })

//   todo add auth
//   const session = await requireUserSession(event)
//   const userID = session.user.id
  const db = useDB()

  return await db.insert(target).values({
    id: uuidv4(),
    deploymentID: id,
    host: host,
    }).returning().get()
})

