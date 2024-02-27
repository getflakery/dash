import { useValidatedParams, z, } from 'h3-zod'
import { instances } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { useEC2Client } from '~/server/utils/aws'
import {
  TerminateInstancesCommand,
  
  } from "@aws-sdk/client-ec2";
  

export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })
  const db = useDB()
  const session = await requireUserSession(event)
  const userID = session.user.id
  let instance = await db.select().from(instances).where(
    and(
      eq(instances.id, id),
      eq(instances.userID, userID)
    )
  ).get();

  if (!instance) {
    throw new Error('Instance not found')
  }


  const client = useEC2Client()


  try {
    await client.send(
      new TerminateInstancesCommand({
        InstanceIds: [instance.awsInstanceID],
      })
    )
  } catch (err) {
    console.error(err);
  }

  return db.delete(instances).where(eq(instances.id, id))

})
