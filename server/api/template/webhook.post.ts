import { templates, deployments, woodpeckerToken } from '~/server/database/schema'
import { useValidatedBody, useValidatedParams, z, } from 'h3-zod'

import { eq, and } from 'drizzle-orm'
import { Woodpecker } from '~/mod/woodpecker'

export default eventHandler(async (event) => {
  const { ref, repository, zen } = await useValidatedBody(event, {
    zen: z.string().optional(),
    ref: z.string().optional(),
    repository: z.object({
      full_name: z.string(),
    }).optional(),
  })

  // if zen is present return 200
  if (zen !== undefined) {
    return new Response('ok', { status: 200 })
  }

  if (repository == null || repository == undefined) {
    return new Response('repository not set', { status: 400 })
  }

  if (ref == null || ref == undefined) {
    return new Response('ref not set', { status: 400 })
  }



  console.log(ref)
  // if not main or master branch return
  if (ref !== 'refs/heads/main' && ref !== 'refs/heads/master') {
    return new Response('not main or master branch', { status: 200 })
  }
  const db = useDB()
  console.log("get templates")
  const templatesToBuild = await db.select().from(templates).where(
    and(
      eq(templates.repoFullName, repository.full_name),
      eq(templates.webhook, 1)
    )
  ).execute()

  console.log(templatesToBuild)

  const cs = useCryptoString()
  console.log("build templates")
  await Promise.all(templatesToBuild.map(async (t) => {
    console.log(t)
    console.log("get woodpecker token")
    const userID = t.userID.split('.')[0] // this will def never come back to bite me

    const wpToken = await db.select().from(woodpeckerToken).where(eq(woodpeckerToken.userID, userID)).get()
    if (wpToken == null || wpToken == undefined) {
      return new Response('woodpecker token not found', { status: 404 })
    }
    const decrpytedData = await cs.decrypt({
      iv: wpToken.iv,
      encryptedData: wpToken.token
    })
    const woodpecker = new Woodpecker(
      t.id,
      decrpytedData,
    )
    console.log("building on woodpecker")
    const resp = await woodpecker.Create()
    console.log(resp)
  }))
  console.log("done")




})
