import { useValidatedParams, z, } from 'h3-zod'
import { networks, ports } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'


export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })
  const db = useDB()
  const session = await requireUserSession(event)
  const userID = session.user.id

  db.delete(ports).where(eq(ports.network, id)).execute()



  return db.delete(networks).where(and(eq(networks.id, id), eq(networks.userID, userID)))

})
