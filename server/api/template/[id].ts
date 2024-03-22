import { networks, templates, deployments, } from '~/server/database/schema'
import { useValidatedParams, z, } from 'h3-zod'
import config from '~/config';

import { eq, and } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })
  const db = useDB()
  const session = await requireUserSession(event)
  const userID = session.user.id
  let template = await db.select().from(templates).where(
    and(
      eq(templates.userID, userID),
      eq(templates.id, id))
  ).get();

  let deps = await db.select().from(deployments).where(
    and(
      eq(deployments.userID, userID),
      eq(deployments.templateID, id))
  ).all();

  return {
    ...template,
    deployments: deps,

  }
})
