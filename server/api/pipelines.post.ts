import { useDB } from "../utils/db"
import { useValidatedBody, z, } from 'h3-zod'
import { pipelines } from '~/server/database/schema'
import { v4 as uuidv4 } from 'uuid';
import { eq, and} from 'drizzle-orm'


export default eventHandler(async (event) => {
  const {
    name,
    flakes,
  } = await useValidatedBody(event, {
    name: z.string().optional(),
    flakes: z.array(z.string()),
  })
  const session = await requireUserSession(event)
  const userID = session.user.id

  const db = useDB()

  const dbFlakes = {
    flakes,
  }

  const pipeline = await db.insert(pipelines).values({
    name,
    flakes: dbFlakes,
    userID,
    id: uuidv4(),
  }).returning().get()



  return pipeline
})
