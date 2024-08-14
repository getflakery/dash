import { deployments, target, templates } from "~/server/database/schema";
import { inArray, eq } from 'drizzle-orm'

interface routers {
    [key: string]: {
        service: string
    }
}

interface services {
    [key: string]: {
        servers: {
            url: string
        }[]
    }
}

export default eventHandler(async (event) => {
    console.log("lb config");

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
        if (!dep.host) {
            return acc;
        }
        acc[dep.host] = {
            service: dep.id
        }
        return acc;
    }, {});

    let prodDeployments = await db.select().from(deployments).where(
        eq(deployments.production, 1)
    ).execute();

    console.log(prodDeployments);

    if (prodDeployments) {

        routers = await prodDeployments.reduce<Promise<routers>>(async (acc, dep) => {
            let template = await db.select().from(templates).where(
                eq(templates.id, dep.templateID)
            ).get();
            if (!template) {
                return acc;
            }
            return {
                ...await acc, // todo unnecessary copy
                [`${template.host}.flakery.xyz`]: {
                    service: dep.id,
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
                servers: targets
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