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

    let update: {
        name: string
        production?: number
    } = {
        name: name,

    }

    const deploymentToUpdate = await db.select().from(deployments).where(
        eq(deployments.id, id)
    ).get()

    if (!deploymentToUpdate) {
        throw new Error(`DeploymentNotFound: ${id}`)
    }

    if (production !== undefined) {
        if (production) {
            update["production"] = 1
            // find current production deployment and set it to false
            let currentProduction = await db.select().from(deployments).where(
                and(
                    eq(deployments.userID, session.user.id),
                    eq(deployments.production, 1),
                    eq(deployments.templateID, deploymentToUpdate.templateID)
                    
                )
            ).get()
            if (currentProduction) {
                await db.update(deployments).set({ production: 0 }).where(
                    eq(deployments.id, currentProduction.id)
                ).returning().get()
            }
        } else {
            update["production"] = 0
        }
    }


    return await db.update(deployments).set(update).where(
        eq(deployments.id, id)
    ).returning().get()


})

