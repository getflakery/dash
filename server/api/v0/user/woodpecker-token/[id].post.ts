import { useValidatedBody, useValidatedParams, z } from "h3-zod"
import { woodpeckerToken as schemaWoodpeckerToken } from "~/server/database/schema"
import { v4 as uuidv4 } from 'uuid';

export default eventHandler(async (event) => {
    console.log('get id')
    const { id } = await useValidatedParams(event, {
        id: z.number(),
    })
    console.log('get woodpeckerToken')
    const {
        woodpeckerToken,
    } = await useValidatedBody(event, {
        woodpeckerToken: z.string(),
    })


    const db = useDB()
    const cs = useCryptoString()

    console.log('encrypting woodpeckerToken')
    let encryptedData = await cs.encrypt(woodpeckerToken)
    console.log('inserting woodpeckerToken')
    let token = await db.insert(schemaWoodpeckerToken).values({
        token: encryptedData.encryptedData,
        iv: encryptedData.iv,
        id: uuidv4(),
        userID: id.toString(),
        createdAt: Date.now(),

    }).returning().get()

    return new Response('ok', { status: 200 })
})
