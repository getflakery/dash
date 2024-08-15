import { deployments, deploymentLogs } from '~/server/database/schema'
import { useValidatedParams, z, } from 'h3-zod'

import { eq, and } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })
  const db = useDB()
  const session = await requireUserSession(event)
  let inst = await db.select().from(deployments).where(
    and(
      eq(deployments.id, id))
  ).get();

  console.log("inst", inst) 
  return {
    ...inst,
    logs: []
  }

  // const limit = 2; // Adjust the limit based on your needs
  // const offset = 0;  // Update this for pagination
  // let logs = await db.select().from(deploymentLogs).where(
  //   eq(deploymentLogs.deploymentID, id)
  // ).limit(limit).offset(offset).all();
  
  // console.log("logs", logs)


  // switch (logs) {
  //   case null:

  //   default:
  //     return {
  //       ...inst,
  //       ...logs.reduce((acc, log) => {
  //         if (
  //           acc.logs === undefined ||
  //           acc.logs === null
  //         ) {
  //           acc.logs = []
  //         }
  //         if (
  //           log.logs === undefined ||
  //           log.logs === null
  //         ) {
  //           log.logs = []
  //         }
  //         acc.logs.push(...log.logs)
  //         acc.logs?.sort((a, b) => a.date - b.date)
  //         return acc
  //       }, {})
  //     }
  // }
})

