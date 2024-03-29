import { useDB } from "../utils/db"
import {  useValidatedBody, z, } from 'h3-zod'
import { networks, ports as portsSchema } from '~/server/database/schema'
import { v4 as uuidv4 } from 'uuid';


export default eventHandler(async (event) => {
  const { domain, ports } = await useValidatedBody(event, {
    domain: z.string(),
    ports: z.array(z.number()).optional(),    
  })
  console.log(domain, ports)
  const session = await requireUserSession(event)
  const userID = session.user.id

  const db = useDB()

  const network = await db.insert(networks).values({
    domain,
    id: uuidv4(),
    userID,
  }).returning().get()


  ports?.forEach( port => {
    db.insert(portsSchema).values({
      number: port,
      network: network.id,
      id: uuidv4(),
    }).execute()
  })

  return network
})
