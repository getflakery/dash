import { useValidatedParams, useValidatedBody, z, } from 'h3-zod'
import { templates, templateFiles as schemaTemplateFiles, files, deployments } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })

  const session = await requireUserSession(event)
  const userID = session.user.id
  const db = useDB()

  // if template has deployments, return 400 error 
  const deps = await db.select().from(deployments).where(eq(deployments.templateID, id)).all()

  if (deps.length > 0) {
    let msg = `Cannot delete template with active deployments: \n\n ${deps.map((dep) => dep.name).join('\n')}
    
    please delete deployments first.`
    return new Response(msg, { status: 400 })
  }


  // delete all files associated with the template through templateFiles
  // if the file has no other associations 
  // then delete the file from the files table
  const associatedFiles = await db.select().from(schemaTemplateFiles).where(eq(schemaTemplateFiles.templateId, id)).all()
  associatedFiles?.forEach(async (file) => {
    const otherAssociations = await db.select().from(schemaTemplateFiles).where(and(eq(schemaTemplateFiles.fileId, file.fileId), eq(schemaTemplateFiles.templateId, id))).get()
    if (otherAssociations !== undefined) {
      await db.delete(schemaTemplateFiles).where(eq(schemaTemplateFiles.fileId, file.fileId)).execute()
      await db.delete(files).where(eq(files.id, file.fileId)).execute()
    } else {
      await db.delete(schemaTemplateFiles).where(and(eq(schemaTemplateFiles.fileId, file.fileId), eq(schemaTemplateFiles.templateId, id))).execute()
    }
  })


  return db.delete(templates).where(eq(templates.id, id))
})
