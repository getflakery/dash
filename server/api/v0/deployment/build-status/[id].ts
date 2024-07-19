import { eq } from "drizzle-orm"
import {  useValidatedParams, z } from "h3-zod"
import { privateBinaryCache, deployments, templates} from "~/server/database/schema"
import { Woodpecker } from "~/mod/woodpecker";

import { woodpeckerToken } from "~/server/database/schema";


export default eventHandler(async (event) => {
    console.log('get id')
    const { id } = await useValidatedParams(event, {
        id: z.string().uuid(),
    })
    const db = useDB()

    console.log('get deployment')
    const deployment = await db.select().from(deployments).where(eq(deployments.id, id)).get()
    if (deployment == null || deployment == undefined) {
        return new Response('not found', { status: 404 })
    }
    const template = await db.select().from(templates).where(eq(templates.id, deployment.templateID)).get()
    if (template == null || template == undefined) {
        return new Response('not found', { status: 404 })
    }
    const woodpecker_token = await db.select().from(woodpeckerToken).where(eq(woodpeckerToken.userID, template.userID)).get()
    if (woodpecker_token == null || woodpecker_token == undefined) {
        return new Response('not found', { status: 404 })
    }
    const cs = useCryptoString()
    const decrpytedData = await cs.decrypt( {
        iv: woodpecker_token.iv,
        encryptedData: woodpecker_token.token
    })
    const woodpecker = new Woodpecker(
        deployment.templateID,
        decrpytedData,
    )
    const resp = await woodpecker.Get()   
    console.log(resp)
    return resp.id
})
