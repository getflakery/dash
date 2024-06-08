import { deployments, deploymentLogs } from '~/server/database/schema'
import { useValidatedBody, useValidatedParams, z, } from 'h3-zod'

import { eq, and } from 'drizzle-orm'

export default eventHandler(async (event) => {
    const { id } = await useValidatedParams(event, {
        id: z.string().uuid(),
    })

    const {
        name,
    } = await useValidatedBody(event, {
        name: z.string(),
    })
    const db = useDB()
    const session = await requireUserSession(event)



    return await db.update(deployments).set({
        name: name,
    }).where(
        eq(deployments.id, id)
    ).returning().get()


})

