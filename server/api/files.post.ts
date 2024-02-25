import { useDB } from "../utils/db"

import { useValidatedParams, useValidatedBody, z, } from 'h3-zod'

export default eventHandler(async (event) => {
  const { path, content } = await useValidatedParams(event, {
    path: z.string(),
    content: z.string()
  })
  const session = await requireUserSession(event)

  const db = useDB()
  return files
})
