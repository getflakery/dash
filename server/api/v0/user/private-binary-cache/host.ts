import { eq } from "drizzle-orm"
import { useValidatedParams, z } from "h3-zod"
import { deployments, privateBinaryCache, target } from "~/server/database/schema"

export default eventHandler(async (event) => {
    let id = event.context.auth?.userID.toString()


    if (!id.includes('.0')) {
        id = id + '.0'
    }

    console.log('get id')   
    console.log(id)

    const db = useDB()

    const { publickey } = await db.select().from(privateBinaryCache).where(
        eq(privateBinaryCache.name, id)
    ).get()

    if (publickey == null || publickey == undefined) {
        return new Response('not found', { status: 404 })
    }

    return {  publickey, host: publickey.split(':')[0] }
})
