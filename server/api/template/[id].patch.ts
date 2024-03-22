import { templates, } from '~/server/database/schema'
import { useValidatedParams, z, useValidatedBody } from 'h3-zod'

import { eq, and } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })
  const {
    name,
    flakeURL
  } = await useValidatedBody(event, {
    name: z.string(),
    flakeURL: z.string()
  })
  const db = useDB()
  const session = await requireUserSession(event)
  const userID = session.user.id



  // set template name and flakeURL to the new values

  await db.update(templates).set({
    name,
    flakeURL
  }).where(
    and(
      eq(templates.userID, userID),
      eq(templates.id, id))
  ).execute();


  return 
})
