import { Woodpecker } from "~/mod/woodpecker";

import { useValidatedParams, z} from 'h3-zod'

export default eventHandler(async (event) => {
    const { id } = await useValidatedParams(event, {
        id: z.string().uuid(),
    })
    await requireUserSession(event)
    const woodpecker = new Woodpecker(
        id,
    )
    await woodpecker.Create()
})
