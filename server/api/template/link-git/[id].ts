import { Woodpecker } from "~/mod/woodpecker";

import { useValidatedParams, z} from 'h3-zod'
import { woodpeckerToken, templates } from "~/server/database/schema";
import { eq } from 'drizzle-orm';

function getRepoOwnerAndRepoName(flake: string) {
    // getflakery/bootstrap#woodpecker

    // start from end of string
    // trailing # from repo name
    // get repo name 
    // remove /
    // get repo owner

    const noflake = flake.split('#')[0]
    // getflakery/bootstrap
    // idk how many leading / there are so
    const splitted = noflake.split('/')
    let repoOwner = splitted[splitted.length - 2]
    repoOwner = repoOwner.replace('github:', '')
    let repoName = splitted[splitted.length - 1]

    return { repoOwner, repoName }
}


export default eventHandler(async (event) => {
    const { id } = await useValidatedParams(event, {
        id: z.string().uuid(),
    })
    const user = await requireUserSession(event)
    const db = useDB()
    const template = await db.select().from(templates).where(eq(templates.id, id)).get()
    if (template == null || template == undefined) {
        return new Response('not found', { status: 404 })
    }
    const flake = template.flakeURL
    // get repo owner and repo name from flake url 
    const {repoOwner, repoName} = getRepoOwnerAndRepoName(flake)
    const {webhook_url,webhook_client_id } = useRuntimeConfig()
    const webhookURL =  webhook_url// todo make configurable
    let stateString = "todo" // todo make configurable
    let state = Buffer.from(JSON.stringify({ repoOwner, repoName, webhookURL, stateString, templateID: template.id})).toString('base64');
    const clientId = webhook_client_id // Replace with your actual client ID
    const authorizationUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&state=${state}&scope=repo&login=${repoOwner}`;
    await sendRedirect(event, authorizationUrl)

})
