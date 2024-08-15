import { useValidatedParams, useValidatedBody, z } from 'h3-zod'
import { eq, and } from 'drizzle-orm'

import { target as targetSchema } from '~/server/database/schema'

export default eventHandler(async (event) => {
    console.log("unhealthy target")
    const { target } = await useValidatedBody(event, {
        target: z.string(),
    })
    console.log("target", target)

    const id = await useValidatedParams(event, {
        id: z.string(),
    })

    console.log("id", id)
    const db = useDB()
    //   update the target to be unhealthy
    const resp = await db.update(targetSchema).set({
        healthy: 0,
    }).where(
        and(
            eq(targetSchema.deploymentID, id),
            eq(targetSchema.host, target),
        )
    )
    console.log("resp", resp)
    return resp
    
})
