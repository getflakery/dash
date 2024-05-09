import { deployments } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import config from '~/config';


export default eventHandler(async (event) => {
  const db = useDB()
  const session = await requireUserSession(event)
  const userID = session.user.id
  let resp = await db.select().from(deployments).where(eq(deployments.userID, userID))
  return resp

})
