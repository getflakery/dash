import { instances, networks, instanceDeployment } from '~/server/database/schema'
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
  let inst = await db.select().from(instances).where(
    and(
      eq(instances.userID, userID),
      eq(instances.id, id))
  ).get();

  let flakeComputeID = (await db.select().from(instanceDeployment).where(
    and(
      eq(instanceDeployment.instanceID, id),
      eq(instanceDeployment.active, 1)
    )
  ).get())?.flakeComputeID

  let r = await fetch(`${config.BACKEND_URL}/flake/${flakeComputeID}`, {
    headers: {
      "Content-Type": "application/json",
      'X-Token': process.env.AUTH_TOKEN ?? "b355b95e-1933-4103-8f7e-156687fa0a1f",
    },
  })
  let jsonResponse = await r.json()

  const network = await db.select().from(networks).where(
    and(
      eq(networks.instanceID, id),
      eq(networks.userID, userID)
    )
  ).get()

  return {
    ...inst,
    ...jsonResponse,
    network: network ?? {},
  }
})
