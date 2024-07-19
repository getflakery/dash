import { useValidatedBody, z, } from 'h3-zod'
import type { RuntimeConfig } from "~/types";

import { AWSDeployment } from '~/mod/deployment';


export default eventHandler(async (event) => {

  const config: RuntimeConfig = useRuntimeConfig(event)
  const body = await useValidatedBody(event, {
    templateID: z.string().uuid(),
    awsInstanceType: z.string().optional(),
    publicIP: z.boolean(),
    loadBalancer: z.boolean(),
    minInstances: z.number(),
    maxInstances: z.number(),
    targetPort: z.number().optional(),
    production: z.boolean().optional().default(false),
  })
  


  let templateID = body.templateID

  const session = await requireUserSession(event)

  const userID = session.user.id

  const awsDeployment = new AWSDeployment({ 
    config,
    templateID,
    userID,
    production: body.production,
    overrides: {
      awsInstanceType: body.awsInstanceType,
      publicIP: body.publicIP,
      loadBalancer: body.loadBalancer,
      minInstances: body.minInstances,
      targetPort: body.targetPort,
    }
  })



  return await awsDeployment.Create()
})

