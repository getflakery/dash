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
    const template = await db.select().from(templates).where(eq(templates.id, id)).get()
    if (template == null || template == undefined) {
        return new Response('not found', { status: 404 })
    }
    const flake = template.flakeURL
    // get repo owner and repo name from flake url 
})
