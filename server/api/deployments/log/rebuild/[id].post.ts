import { deploymentLogs } from "~/server/database/schema";
import { useValidatedParams, z, } from 'h3-zod'
import { v4 as uuidv4 } from 'uuid';


export default eventHandler(async (event) => {

    const { id } = await useValidatedParams(event, {
        id: z.string().uuid(),
    })
    // log body
    let body = await readRawBody(event);
    let bodyJSON = JSON.parse(body);

    const db = useDB()
    const session = await requireUserSession(event)
    await db.insert(deploymentLogs).values({
        id: uuidv4(),
        deploymentID: id,
        logs: bodyJSON,
    }).returning().get()

    


});