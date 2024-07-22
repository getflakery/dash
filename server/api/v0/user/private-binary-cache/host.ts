import { eq } from "drizzle-orm"
import { useValidatedParams, z } from "h3-zod"
import { deployments, privateBinaryCache, target } from "~/server/database/schema"

export default eventHandler(async (event) => {
    console.log('get id')
    const { id } = await useValidatedParams(event, {
        id: z.string(),
    })

    const db = useDB()

    const { host } = await db.select({
        host: target.host,
    }).from(privateBinaryCache).where(
        eq(privateBinaryCache.name, id)
    ).innerJoin(deployments, eq(deployments.id, privateBinaryCache.deploymentID))
        .innerJoin(target, eq(target.deploymentID, deployments.id))
        .limit(1)

    if (host == null || host == undefined) {
        return new Response('not found', { status: 404 })
    }

    const { pubkey } = await db.select({
        pubkey: privateBinaryCache.publickey,
    }).from(privateBinaryCache).where(
        eq(privateBinaryCache.name, id)
    ).limit(1)

    if (pubkey == null || pubkey == undefined) {
        return new Response('not found', { status: 404 })
    }

    return { host, pubkey }
})
