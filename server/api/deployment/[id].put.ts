import { deployments, deploymentLogs } from '~/server/database/schema'
import { useValidatedBody, useValidatedParams, z, } from 'h3-zod'

import { eq, and } from 'drizzle-orm'

export default eventHandler(async (event) => {
    const { id } = await useValidatedParams(event, {
        id: z.string().uuid(),
    })

    const {
        name,
        production,
    } = await useValidatedBody(event, {
        name: z.string(),
        production: z.boolean().optional(),
    })
    const db = useDB()
    const session = await requireUserSession(event)

    let update:{
        name: string
        production?: number
    } = {
        name: name,
    
    }

    if (production !== undefined) {
        update["production"] = production ? 1 : 0
    }


    return await db.update(deployments).set(update).where(
        eq(deployments.id, id)
    ).returning().get()


})

