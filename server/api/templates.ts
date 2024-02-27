import { templates } from '~/server/database/schema'
import { eq } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const db = useDB()
  const session = await requireUserSession(event)
  const userID = session.user.id
 return await db.select().from(templates).where(eq(templates.userID, userID))
})
