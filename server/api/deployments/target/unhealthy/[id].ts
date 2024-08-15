import { useValidatedParams, useValidatedBody, z } from 'h3-zod'
import { eq, and } from 'drizzle-orm'

import { target as targetSchema } from '~/server/database/schema'

export default eventHandler(async (event) => {
    const { target } = await useValidatedBody(event, {
        target: z.string(),
    })

    const id = await useValidatedParams(event, {
        id: z.string(),
    })
    const db = useDB()
    //   update the target to be unhealthy
    return await db.update(targetSchema).set({
        healthy: 0,
    }).where(
        and(
            eq(targetSchema.deploymentID, id),
            eq(targetSchema.host, target),
        )
    ).get()
})
