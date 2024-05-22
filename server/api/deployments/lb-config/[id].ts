import { , deployments } from "~/server/database/schema";
import { useValidatedParams, z, } from 'h3-zod'
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm'


export default eventHandler(async (event) => {
    const { id } = await useValidatedParams(event, {
        id: z.string().uuid(),
    })
    const db = useDB()
    let {
        domain,
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
                    "rule": `Host(\`${domain}\`)`,
                    "service": "my-service",
                    "tls": {
                        "certResolver": "myresolver"
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