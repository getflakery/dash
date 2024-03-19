import { useValidatedParams, z, } from 'h3-zod'
import { files, templateFiles } from '~/server/database/schema'
import { eq, or } from 'drizzle-orm'

export default eventHandler(async (event) => {
    const { id } = await useValidatedParams(event, {
        id: z.string().uuid(),
    })
    const db = useDB()

    const tf = await db.select().from(templateFiles).where(eq(templateFiles.templateId, id)).all()

    const fs = await Promise.all(tf.map(async (f) => {
        return await db.select().from(files).where(eq(files.id, f.fileId)).get()
    }))

    return fs
})
