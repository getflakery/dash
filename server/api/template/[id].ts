import { templates, deployments, } from '~/server/database/schema'
import { useValidatedParams, z, } from 'h3-zod'

import { eq, and } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })
  const db = useDB()
  const session = await requireUserSession(event)
  const userID = session.user.id
  console.log(JSON.stringify({
    message: "Getting template",
  }))
  let template;
  try {
    template = await db.select().from(templates).where(
      and(
        eq(templates.userID, userID),
        eq(templates.id, id))
    ).get();
  } catch (e) {
    throw new Error("Error getting template")
  }

  if (!template) {
    throw new Error("Template not found")
  }

  console.log(JSON.stringify({
    message: "Getting deployments",
  }))

  let deps;
  try {
    deps = await db.select().from(deployments).where(
      and(
        eq(deployments.userID, userID),
        eq(deployments.templateID, id))
    ).all();
  } catch (e) {
    throw new Error("Error getting deployments")
  }

  return {
    ...template,
    deployments: deps,

  }
})
