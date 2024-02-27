import { useDB } from "../utils/db"
import {  useValidatedBody, z, } from 'h3-zod'
import { templates, files as schemaFiles, templateFiles as schemaTemplateFiles } from '~/server/database/schema'
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm'
import config from '~/config';

export default eventHandler(async (event) => {
  const { templateID } = await useValidatedBody(event, {
    templateID: z.string().uuid(),  
  })
  const session = await requireUserSession(event)
  const userID = session.user.id

  const db = useDB()

  const {flakeURL, awsInstanceType } = await db.select().from(templates).where(
    and(
      eq(templates.id, templateID),
      eq(templates.userID, userID) 
  )).get();



  const templateFiles = await db.select().from(schemaTemplateFiles).where(
    eq(schemaTemplateFiles.templateId, templateID)
  ).all();

  const files = await Promise.all(templateFiles?.map(async (templateFile) => 
    await db.select().from(schemaFiles).where(
      eq(schemaFiles.id, templateFile.fileId)
    ).get()
  ))

  let r = await fetch(`${config.BACKEND_URL}/flake/deploy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'X-Token': process.env.AUTH_TOKEN ?? "",
    },
    body: JSON.stringify({
      instanceType: awsInstanceType,
      flakeURL,
      files,
    }),
  })


})
