import { useValidatedParams, useValidatedBody, z, } from 'h3-zod'
import { templateFiles as schemaTemplateFiles, files, networks, deployments} from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { useEC2Client } from '~/server/utils/aws'
import {
  TerminateInstancesCommand,
  } from "@aws-sdk/client-ec2";
  
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

  // if (deleteFiles) {
  //   // delete all files associated with the template through templateFiles
  //   // if the file has no other associations 
  //   // then delete the file from the files table
  //   const associatedFiles = await db.select().from(schemaTemplateFiles).where(eq(schemaTemplateFiles.templateId, id)).all()
  //   associatedFiles?.forEach(async (file) => {
  //     const otherAssociations = await db.select().from(schemaTemplateFiles).where(and(eq(schemaTemplateFiles.fileId, file.fileId), eq(schemaTemplateFiles.templateId, id))).get()
  //     if (otherAssociations !== undefined) {
  //       await db.delete(schemaTemplateFiles).where(eq(schemaTemplateFiles.fileId, file.fileId)).execute()
  //       await db.delete(files).where(eq(files.id, file.fileId)).execute()
  //     } else {
  //       await db.delete(schemaTemplateFiles).where(and(eq(schemaTemplateFiles.fileId, file.fileId), eq(schemaTemplateFiles.templateId, id))).execute()
  //     }
  //   })


  // } else {
  //   // remove the association from templateFiles but do not delete the files
  //   await db.delete(schemaTemplateFiles).where(eq(schemaTemplateFiles.templateId, id)).execute()
  // }
  if (deleteNetwork) {
    console.log(id)
    // delete the network 
    await db.delete(networks).where(
      eq(networks.deploymentID, id)
      ).execute()
  } else {
    // set the fk to the template to null on the template's network
    await db.update(networks).set({
      deploymentID: null
    }).where(eq(networks.deploymentID, id)).execute()
  }
  let instance = await db.select().from(deployments).where(
    and(
      eq(deployments.id, id),
      eq(deployments.userID, userID)
    )
  ).get();

  if (!instance) {
    throw new Error('Instance not found')
  }


  const client = useEC2Client()


  try {
    await client.send(
      new TerminateInstancesCommand({
        InstanceIds: [deployments.awsInstanceID],
      })
    )
  } catch (err) {
    console.error(err);
  }

  return db.delete(deployments).where(eq(deployments.id, id))

})
