import { eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type { RuntimeConfig } from 'nuxt/schema';
import { templates, privateBinaryCache, deployments, target } from '~/server/database/schema';


function flakeUrlToConfigUrl(flakeUrl: string) {
    // github:getflakery/bootstrap#grafana	-> github:getflakery/bootstrap#nixosConfigurations.grafana.config.system.build.toplevel
    const parts = flakeUrl.split('#');
    const right = parts[1];
    return `${parts[0]}#nixosConfigurations.${right}.config.system.build.toplevel`;
}

export class Woodpecker {
    templateID: string;
    woodpecker_api_key: string;
    woodpecker_repo_id: number;
    // api: PipelinesApi;
    db: BetterSQLite3Database | LibSQLDatabase<Record<string, never>>;
    config: RuntimeConfig;


    constructor(templateID: string, woodpecker_api_key: string) {
        this.templateID = templateID;
        // this.api = new PipelinesApi();
        this.db = useDB();
        const config = useRuntimeConfig();
        this.config = config;
        this.woodpecker_api_key = woodpecker_api_key;
        this.woodpecker_repo_id = config.woodpecker_repo_id;
    }

    // get vars 
    async getVars(): Promise<{
        BINARY_CACHE_IP: string;
        FLAKE: string;
        TEMPLATE_ID: string;
        ENCRYPTION_KEY: string;
        TURSO_TOKEN: string;
        SSH_PRIVATE_KEY_B64: string;
        GITHUB_TOKEN?: string;
    }> {
        const template = await this.db.select().from(templates).where(eq(templates.id, this.templateID)).get();
        if (!template) {
            throw new Error('Template not found');
        }
        if (!template.flakeURL) {
            throw new Error('Template does not have a flake');
        }
        const binaryCache = await this.db.select().from(privateBinaryCache).where(eq(privateBinaryCache.name, template.userID)).get();

        if (!binaryCache) {
            throw new Error('Binary cache not found');
        }
        const deployment = await this.db.select().from(deployments).where(eq(deployments.id, binaryCache.deploymentID)).get();
        if (!deployment) {
            throw new Error('Deployment not found');
        }

        if (!deployment.host) {
            throw new Error('Binary Cache does not have a host');
        }

        const targets = await this.db.select().from(target).where(eq(target.deploymentID, binaryCache.deploymentID)).all();

        if (targets.length === 0) {
            throw new Error('No targets found');
        }

        // get last target 
        const t = targets[targets.length - 1];
        if (!t) {
            throw new Error('No target found');
        }


        return {
            TEMPLATE_ID: this.templateID,
            ENCRYPTION_KEY: this.config.file_encryption_key,
            TURSO_TOKEN: this.config.turso_token,
            FLAKE: flakeUrlToConfigUrl(template.flakeURL),
            BINARY_CACHE_IP: t.host,
            SSH_PRIVATE_KEY_B64: this.config.ssh_private_key_b64,
            // GITHUB_TOKEN: config.github_token,
        }
    }

    // create a build 
    async Create() {
        const template = await this.db.select().from(templates).where(eq(templates.id, this.templateID)).get();
        if (!template) {
            throw new Error('Template not found');
        }
        const tok = await useJWT().sign({ UserID: template.userID, templateID: this.templateID });
        const resp = await fetch('https://wp.flakery.xyz/api/repos/1/pipelines', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${this.woodpecker_api_key}`,
                'Content-Type': 'application/json',
                'X-Flakery-User-Key': tok,
            },
            body: JSON.stringify({
                branch: 'master',
                variables: await this.getVars(),
            })
        });
        if (!resp.ok) {
            throw new Error('Failed to create pipeline');
        }
        const data = await resp.json();
        // update template pipeline id with resp.id
        await this.db.update(templates).set({
            pipelineID: data.id
        }).where(eq(templates.id, this.templateID)).execute()
        return data;
    }

    async Get() {
        const template = await this.db.select().from(templates).where(eq(templates.id, this.templateID)).get();
        if (!template) {
            throw new Error('Template not found');
        }
        console.log(template.pipelineID);
        const tok = await useJWT().sign({ UserID: template.userID, templateID: this.templateID });
        const resp = await fetch('https://comic-dassie-8723c6.flakery.xyz/api/repos/1/pipelines/' + template.pipelineID, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${this.woodpecker_api_key}`,
                'Content-Type': 'application/json',
                'X-Flakery-User-Key': tok,
            },
        });
        if (!resp.ok) {
            console.log(resp);
            console.log(await resp.text());
            throw new Error('Failed to get pipeline');
        }
        const data = await resp.json();
        return data;
    }
}
