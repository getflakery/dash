import { useValidatedParams, z, } from 'h3-zod'

export default eventHandler(async (event) => {
    const { redirect_uri } = await useValidatedParams(event, {
        redirect_uri: z.string(),
    })
    return oauth.githubEventHandler({
        async onSuccess(event, { user }) {
            await setUserSession(event, { user })
            return sendRedirect(event, redirect_uri)
        }
    })(event);

})
