import { Woodpecker } from "~/mod/woodpecker";

import { useValidatedParams, z} from 'h3-zod'
import { woodpeckerToken, templates } from "~/server/database/schema";
import { eq } from 'drizzle-orm';

export default eventHandler(async (event) => {
    const { id } = await useValidatedParams(event, {
        id: z.string().uuid(),
    })
    const user = await requireUserSession(event)
    const db = useDB()
    const woodpecker_token = await db.select().from(woodpeckerToken).where(woodpeckerToken.userID, user.id).get()
    if (woodpecker_token == null || woodpecker_token == undefined) {
        return new Response('not found', { status: 404 })
    }
    const cs = useCryptoString()
    const decrpytedData = await cs.decrypt( {
        iv: woodpecker_token.iv,
        encryptedData: woodpecker_token.token
    })
    const woodpecker = new Woodpecker(
        id,
        decrpytedData,
    )
    const resp =  await woodpecker.Create()
    return resp

})
