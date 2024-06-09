import { deployments, target, templates } from "~/server/database/schema";
import { inArray, eq } from 'drizzle-orm'

interface routers {
    [key: string]: {
        middlewares?: string[]
        entryPoints: string[]
        rule: string
        service: string
        tls?: {
            certResolver: string
        }
    }
}

interface services {
    [key: string]: {
        loadBalancer: {
            servers: {
                url: string
            }[]
        }
    }
}

export default eventHandler(async (event) => {

    const db = useDB()

    let allTargets = await db.select().from(target).all();

    // index by deployment id
    let targetsByDeployment = allTargets.reduce<{
        [deploymentID: string]: typeof allTargets
    }>((acc, t) => {
        if (!acc[t.deploymentID]) {
            acc[t.deploymentID] = [];
        }
        acc[t.deploymentID].push(t);
        return acc;
    }, {});
    let deploymentIDs = Object.keys(targetsByDeployment);

    // select id, host from deployments where id in (...)
    let deps = await db
        .select()
        .from(deployments)
        .where(inArray(deployments.id, deploymentIDs))
        .execute();


    let routers = deps.reduce<routers>((acc, dep) => {
        acc[dep.id] = {
            entryPoints: ["websecure"],
            rule: `Host(\`${dep.host}\`)`,
            service: dep.id,
            tls: {
                certResolver: "letsencrypt"
            }
        }
        return acc;
    }, {});

    let prodDeployments = await db.select().from(deployments).where(
        eq(deployments.production, 1)
    ).execute();

    if (prodDeployments) {

        routers = await prodDeployments.reduce<Promise<routers>>(async (acc, dep) => {
            let template = await db.select().from(templates).where(
                eq(deployments.id, dep.templateID)
            ).get();
            if (!template) {
                return acc;
            }
            return {
                ...await acc, // todo unnecessary copy
                [template.id]: {
                    entryPoints: ["websecure"],
                    rule: `Host(\`${template.host}.flakery.xyz\`)`,
                    service: dep.id,
                    tls: {
                        certResolver: "letsencrypt"
                    }
                }
            }

        }
            , Promise.resolve(routers));

    }


    let services = deps.reduce<services>((acc, dep) => {
        let targets = targetsByDeployment[dep.id].map(t => t.host).map(h => `${h}:${dep.port}`).map(
            h => {
                return {
                    "url": `http://${h}`
                }
            }
        )
        acc[dep.id] = {
            loadBalancer: {
                servers: targets
            }
        }
        return acc;
    }, {});


    // log body
    return {
        "http": {
            "routers": {
                ...routers
            },
            "services": {
                ...services
            }
        }
    }
});