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

    console.log('get template')

    const template = await db.select().from(templates).where(eq(templates.id, id)).get()
    if (template == null || template == undefined) {
        return new Response('template not found', { status: 404 })
    }
    console.log('get token')
    // strip .0 from template.userID
    const userID = template.userID.split('.')[0] // this will def never come back to bite me
    const woodpecker_token = await db.select().from(woodpeckerToken).where(eq(woodpeckerToken.userID, userID)).get()
    if (woodpecker_token == null || woodpecker_token == undefined) {
        return new Response('token not found', { status: 404 })
    }

    console.log('decrypt token')

    const cs = useCryptoString()
    const decrpytedData = await cs.decrypt( {
        iv: woodpecker_token.iv,
        encryptedData: woodpecker_token.token
    })
    const woodpecker = new Woodpecker(
        deployment.templateID,
        decrpytedData,
    )
    console.log('get pipeline')

    const resp = await woodpecker.Get()   
    console.log(resp)
    return resp.status
})
