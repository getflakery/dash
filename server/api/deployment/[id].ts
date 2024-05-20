import { deployments, deploymentLogs } from '~/server/database/schema'
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

  const logs = await db.select().from(deploymentLogs).where(
    eq(deploymentLogs.deploymentID, id)
  ).all();


  return {
    ...inst,
    ...logs.reduce((acc, log) => {
      if (
        acc.logs === undefined ||
        acc.logs === null
      ) {
        acc.logs = []
      }
      if (
        log.logs === undefined ||
        log.logs === null
      ) {
        log.logs = []
      }
      acc.logs.push(...log.logs)
      acc.logs?.sort((a, b) => a.date - b.date)
      return acc
    })
  }
})
