import { deployments } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import config from '~/config';


export default eventHandler(async (event) => {
  const db = useDB()
  const session = await requireUserSession(event)
  const userID = session.user.id
  let resp = await db.select().from(deployments).where(eq(deployments.userID, userID))
  return await Promise.all(resp.map(async (deployment) => {
    let r = await fetch(`${config.BACKEND_URL}/flake/${deployment.flakeComputeID}`, {
      headers: {
        "Content-Type": "application/json",
        'X-Token': process.env.AUTH_TOKEN ?? "b355b95e-1933-4103-8f7e-156687fa0a1f",
      },
  })
    let jsonResponse = await r.json()

    return {
      ...deployment,
      ...jsonResponse,
    }
  }))

})
