import { eq } from "drizzle-orm"
import {  useValidatedParams, z, useValidatedBody } from "h3-zod"
import { privateBinaryCache } from "~/server/database/schema"

export default eventHandler(async (event) => {
    console.log('get id')
    let { id } = await useValidatedParams(event, {
        id: z.string(),
    })

    const {privatekey, publickey } = await useValidatedBody(event, {
        privatekey: z.string(),
        publickey: z.string(),
    })
    
    const db = useDB()

    if (!id.includes('.0')) {
        id = id + '.0'
    }

    const pbc = await db.select().from(privateBinaryCache).where(
        eq(privateBinaryCache.name, id)
    ).get()

    if (pbc == null || pbc == undefined) {
        return new Response('not found', { status: 404 })
    }

    const cs = useCryptoString()

    console.log('encrypting privatekey')
    let encryptedData = await cs.encrypt(privatekey)
    console.log('inserting privatekey')
    const updatedPbc = await db.update(privateBinaryCache).set({
        privatekey: encryptedData.encryptedData,
        iv: encryptedData.iv,
        publickey: publickey,
    }).where(
        eq(privateBinaryCache.name, id)
    ).returning().get()
    return updatedPbc
})
