import { eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type { RuntimeConfig } from 'nuxt/schema';
import { templates, privateBinaryCache, deployments } from '~/server/database/schema';
import {
    PipelinesApi,
} from '~/woodpecker-client/api'


export class Woodpecker {
    templateID: string;
    woodpecker_api_key: string;
    woodpecker_repo_id: number;
    api: PipelinesApi;
    db: BetterSQLite3Database | LibSQLDatabase<Record<string, never>>;
    config: RuntimeConfig;


    constructor(templateID: string) {
        this.templateID = templateID;
        this.api = new PipelinesApi();
        this.db = useDB();
        const config = useRuntimeConfig();
        this.config = config;
        this.woodpecker_api_key = config.woodpecker_token;
        this.woodpecker_repo_id = config.woodpecker_repo_id;

    }

    // get vars 
    async getVars(): Promise<{
        BINARY_CACHE_HOST: string;
        FLAKE: string;
        TEMPLATE_ID: string;
        ENCRYPTION_KEY: string;
        TURSO_TOKEN: string;
        SSH_PRIVATE_KEY_B64: string;
        GITHUB_TOKEN?: string;
    }> {
        const template = await this.db.select().from(templates).where(eq(templates.id, templateID)).get();
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

        return {
            TEMPLATE_ID: this.templateID,
            ENCRYPTION_KEY: this.config.file_encryption_key,
            TURSO_TOKEN: this.config.turso_token,
            FLAKE: template.flakeURL,
            BINARY_CACHE_HOST: deployment.host,
            SSH_PRIVATE_KEY_B64: this.config.ssh_private_key_b64,
            // GITHUB_TOKEN: config.github_token,
        }
    }

    // create a build 
    async createBuild() {
        return await this.api.reposRepoIdPipelinesPost(
            this.woodpecker_api_key,
            this.woodpecker_repo_id,
            {
                variables: await this.getVars(),
            }
        )
    }
}
