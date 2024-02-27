import { useDB } from "../utils/db"
import {  useValidatedBody, z, } from 'h3-zod'
import { templates, files as schemaFiles, templateFiles as schemaTemplateFiles, instances } from '~/server/database/schema'
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

  let r = await fetch(`${config.BACKEND_URL}/flake`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'X-Token': process.env.AUTH_TOKEN ?? "b355b95e-1933-4103-8f7e-156687fa0a1f",
    },
    body: JSON.stringify({
      instanceType: awsInstanceType,
      flakeURL,
      files,
    }),
  })
  // {
  //   flakeCompute: {
  //     domain: 'shrgvg.app.flakery.xyz',
  //     flakeURL: 'something',
  //     id: '4ecf13b6-f2fa-42ce-a40b-26afaa18cc1b',
  //     instanceID: 'i-0939b274f6556da26',
  //     status: 'creating instance\ninstance created\n'
  //   }
  // }
  // console.log(await r.json())

  const jsonResponse = await r.json()
  const awsInstanceID = jsonResponse.flakeCompute.instanceID
  const flakeComputeID = jsonResponse.flakeCompute.id

  return await db.insert(instances).values({
    id: uuidv4(),
    userID,
    templateID,
    flakeComputeID,
    awsInstanceID,
    name: `todo`,
  })




})
