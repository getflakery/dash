import { useValidatedParams, useValidatedBody, z, } from 'h3-zod'
import { templateFiles as schemaTemplateFiles, files, deployments } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { useEC2Client } from '~/server/utils/aws'
import { AutoScalingClient, DeleteAutoScalingGroupCommand } from '@aws-sdk/client-auto-scaling';


export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })
  const {
    // deleteFiles,
    deleteNetwork
  } = await useValidatedBody(event, {
    // deleteFiles: z.boolean(),
    deleteNetwork: z.boolean()
  })

  const session = await requireUserSession(event)
  const userID = session.user.id
  const db = useDB()

  let instance = await db.select().from(deployments).where(
    and(
      eq(deployments.id, id),
      eq(deployments.userID, userID)
    )
  ).get();

  if (!instance) {
    throw new Error('Instance not found')
  }



  const client = useAutoScalingClient()
  const command = new DeleteAutoScalingGroupCommand({
    AutoScalingGroupName: instance.id,
    ForceDelete: true
  });

  try {
    const result = await client.send(command);
    console.log(result);
  } catch (err) {
    console.log(err);

}

  // todo delete security group
  // todo delete launch template



  return db.delete(deployments).where(eq(deployments.id, id))

})
