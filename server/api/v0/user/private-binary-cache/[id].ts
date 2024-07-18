import { eq } from "drizzle-orm"
import {  useValidatedParams, z } from "h3-zod"
import { privateBinaryCache } from "~/server/database/schema"

export default eventHandler(async (event) => {
    console.log('get id')
    const { id } = await useValidatedParams(event, {
        id: z.string(),
    })

    
    const db = useDB()

    const pbc = await db.select().from(privateBinaryCache).where(
        eq(privateBinaryCache.name, id)
    ).get()

    if (pbc == null || pbc == undefined) {
        return new Response('not found', { status: 404 })
    }

    return pbc
})
