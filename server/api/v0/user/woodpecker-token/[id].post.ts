import { useValidatedBody, z } from "h3-zod"
import { woodpeckerToken as schemaWoodpeckerToken } from "~/server/database/schema"
import { v4 as uuidv4 } from 'uuid';

export default eventHandler(async (event) => {
    const {
        woodpeckerToken,
        userID,
      } = await useValidatedBody(event, {
        woodpeckerToken: z.string(),
        userID: z.string(),
      })


    const db = useDB()
    const cs = useCryptoString()

    let encryptedData = await cs.encrypt(woodpeckerToken)
    let token = await db.insert(schemaWoodpeckerToken).values({
        token: encryptedData.encryptedData,
        iv: encryptedData.iv,
        id: uuidv4(),
        userID,
        createdAt: Date.now(),

    }).returning().get()
    
    return new Response('ok', { status: 200 })
})
