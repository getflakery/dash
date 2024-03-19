import { useValidatedParams, useValidatedBody, z, } from 'h3-zod'
import {
  files as schemaFiles,
  templateFiles as schemaTemplateFiles,
  networks,
  instances,
  deployment,
  templates
} from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { useEC2Client } from '~/server/utils/aws'
import {
  TerminateInstancesCommand,
} from "@aws-sdk/client-ec2";
import config from '~/config';
import { v4 as uuidv4 } from 'uuid';
import petname from 'node-petname'



export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })


  const session = await requireUserSession(event)
  const userID = session.user.id
  const db = useDB()

  let instance = await db.select().from(instances).where(
    and(
      eq(instances.id, id),
      eq(instances.userID, userID)
    )
  ).get();

  if (!instance) {
    throw new Error('Instance not found')
  }


  let activeDeployment = (await db.select().from(deployment).where(
    and(
      eq(deployment.instanceID, id),
      eq(deployment.active, 1)
    )
  ).get())

  if (!activeDeployment) {
    throw new Error('No active deployment found')
  }

  const network = await db.select().from(networks).where(
    and(
      eq(networks.instanceID, id),
      eq(networks.userID, userID)
    )
  ).get()

  const template = await db.select().from(templates).where(
    eq(templates.id, instance.templateID)
  ).get()

  if (!template) {
    throw new Error('Template not found')
  }

  let templateFiles = await db.select().from(schemaTemplateFiles).where(
    eq(schemaTemplateFiles.templateId, instance.templateID)
  ).all()

  let files = await Promise.all(templateFiles.map(async (file) => {
    return await db.select().from(schemaFiles).where(
      eq(schemaFiles.id, file.fileId)
    ).get()
  }));


  let r = await fetch(`${config.BACKEND_URL}/flake`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'X-Token': process.env.AUTH_TOKEN ?? "b355b95e-1933-4103-8f7e-156687fa0a1f",
    },
    body: JSON.stringify({
      instanceType: template.awsInstanceType,
      flakeURL: template.flakeURL,
      files,
      subdomainPrefix: network?.domain,
    }),
  })

  const jsonResponse = await r.json()
  const awsInstanceID = jsonResponse.flakeCompute.instanceID
  const flakeComputeID = jsonResponse.flakeCompute.id
  const name = petname(2, "-")


  // update network with instance id
  await db.update(networks).set({
    instanceID: instance.id
  }).where(eq(networks.id, network.id)).execute()


  // create instance deployments 
  await db.insert(deployment).values({
    id: uuidv4(),
    flakeComputeID,
    awsInstanceID,
    createdAt: new Date().toISOString(),
    active: 1,
    instanceID: instance.id,
  }).execute()

  // terminate current instance
  const client = useEC2Client()


  try {
    await client.send(
      new TerminateInstancesCommand({
        InstanceIds: [activeDeployment?.awsInstanceID ?? ""],
      })
    )
  } catch (err) {
    console.error(err);
  }

  // set active deployment to false
  await db.update(deployment).set({
    active: 0
  }).where(eq(deployment.id, activeDeployment.id)).execute()

  return instance
})
