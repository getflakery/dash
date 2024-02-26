import { useValidatedParams, z, } from 'h3-zod'
import { files } from '~/server/database/schema'
import { eq } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })
  const db = useDB()
  return db.delete(files).where(eq(files.id, id))

})
