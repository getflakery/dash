import { deployments } from '~/server/database/schema'
import { useValidatedParams, z, } from 'h3-zod'

import { eq, and } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })
  const db = useDB()
  const session = await requireUserSession(event)
  const userID = session.user.id
  let inst = await db.select().from(deployments).where(
    and(
      eq(deployments.userID, userID),
      eq(deployments.id, id))
  ).get();

  return {
    ...inst,
  }
})
