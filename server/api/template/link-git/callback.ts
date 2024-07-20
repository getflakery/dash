
import { OAuthApp } from '@octokit/oauth-app';
import axios from 'axios';
import { templates } from '~/server/database/schema';
import { eq } from 'drizzle-orm';

export default eventHandler(async (event) => {

    const { webhook_client_id, webhook_client_secret } = useRuntimeConfig()


    const clientId = webhook_client_id// Replace with your actual client ID
    const clientSecret = webhook_client_secret // Replace with your actual client secret

    const oauthApp = new OAuthApp({
        clientType: 'oauth-app',
        clientId: clientId, // Replace with your actual client ID
        clientSecret: clientSecret, // Replace with your actual client secret
    });
    console.log('get code and state from query')
    // const { code, state } = req.query;
    const { code, state } = getQuery(event)

    console.log(code, state)
    const { repoOwner, repoName, webhookURL, stateString, templateID } = JSON.parse(Buffer.from(state, 'base64').toString());
    const out = await oauthApp.createToken({ code, state });
    console.log('Token:', out);
    console.log('Repo owner:', repoOwner);
    console.log('Repo name:', repoName);
    console.log('Webhook URL:', webhookURL);
    try {
        await axios.post(
            `https://api.github.com/repos/${repoOwner}/${repoName}/hooks`,
            {
                name: 'web',
                active: true,
                events: ['push'],
                config: {
                    url: webhookURL,
                    content_type: 'json',
                    secret: 'your-webhook-secret', // Replace with your actual secret
                },
            },
            {
                headers: {
                    Authorization: `token ${out.authentication.token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        );
    } catch (error) {
        console.error('Failed to create webhook:', error);
        throw new Error('Failed to create webhook');
    }

    // update template with repo full name and webhook 1 
    console.log("templateID", templateID)
    console.log("update template")
    const db = useDB()
    const r = await db.update(templates).set({
        repoFullName: `${repoOwner}/${repoName}`,
        webhook: 1,
    }).where(eq(templates.id, templateID)).execute();

    console.log(r);

    //    navigateTo()
    return sendRedirect(event, `/dashboard/template/${templateID}`)



})
