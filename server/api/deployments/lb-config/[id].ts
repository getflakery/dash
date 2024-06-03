import { deployments } from "~/server/database/schema";
import { useValidatedParams, z, } from 'h3-zod'
import { eq } from 'drizzle-orm'


export default eventHandler(async (event) => {
    const { id } = await useValidatedParams(event, {
        id: z.string().uuid(),
    })
    const db = useDB()
    let {
        host,
    } = await db.select().from(deployments).where(
        eq(deployments.id, id)
    ).get();

    // log body
    return {
        "http": {
            "routers": {
                "http-to-https": {
                    "entryPoints": ["web"],
                    "rule": "HostRegexp(`{host:.+}`)",
                    "middlewares": ["redirect-to-https"]
                },
                "my-secure-router": {
                    "entryPoints": ["websecure"],
                    "rule": `Host(\`${host}.${id.substring(0,6)}\`)`,
                    "service": "my-service",
                    "tls": {
                        "certResolver": "letsencrypt"
                    }
                }
            },
            "middlewares": {
                "redirect-to-https": {
                    "redirectScheme": {
                        "scheme": "https"
                    }
                }
            },
            "services": {
                "my-service": {
                    "loadBalancer": {
                        "servers": [
                            {
                                "url": "http://localhost:8080"
                            },
                            {
                                "url": "http://localhost:8081"
                            }
                        ]
                    }
                }
            }
        }
    }
});