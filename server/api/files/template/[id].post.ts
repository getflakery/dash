import { useValidatedParams, useValidatedBody, z, } from 'h3-zod'
import { files, templateFiles } from '~/server/database/schema'
import { v4 as uuidv4 } from 'uuid';

export default eventHandler(async (event) => {
    const { id } = await useValidatedParams(event, {
        id: z.string().uuid(),
    })
    const db = useDB()
    const session = await requireUserSession(event)
    const userID = session.user.id

    const {
        file,
    } = await useValidatedBody(event, {
        // deleteFiles: z.boolean(),
        file: z.object({
            id: z.string(),
            path: z.string(),
            content: z.string(),
        }),
    })

    const cs = useCryptoString()

    const { encryptedData, iv } = cs.encrypt(file.content)


    const f = await db.insert(files).values({
        path: file.path,
        content: encryptedData,
        userID,
        id: file.id,
        iv,
    }).returning().get()


    // create templateFile entry to link back to template
    try {
        await db.insert(templateFiles).values({
            fileId: f.id,
            templateId: id,
            id: uuidv4(),
        }).execute()
    } catch (e) {
        console.log('error creating template file for file', e)
    }
    
    return f
})
