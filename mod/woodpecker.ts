import {
    PipelinesApi,
} from '~/woodpecker-client/api'


export class Woodpecker {
    templateID: string;
    woodpecker_api_key: string;
    woodpecker_repo_id: number;
    api: PipelinesApi;
    db: BetterSQLite3Database | LibSQLDatabase<Record<string, never>>;
    buildVars: {
        BINARY_CACHE_HOST: string;
        FLAKE: string;
        TEMPLATE_ID: string;
        ENCRYPTION_KEY: string;
        TURSO_TOKEN: string;
        SSH_PRIVATE_KEY_B64: string;
        // GITHUB_TOKEN: string | undefined;
    }



    constructor(templateID: string) {
        this.templateID = templateID;
        this.api = new PipelinesApi();
        this.db = useDB();
        const config = useRuntimeConfig();
        this.woodpecker_api_key = config.woodpecker_token;
        this.woodpecker_repo_id = config.woodpecker_repo_id;
        this.buildVars = {
            TEMPLATE_ID: this.templateID,
            ENCRYPTION_KEY: config.file_encryption_key,
            TURSO_TOKEN: config.turso_token,
            // GITHUB_TOKEN: config.github_token,
        }
    }

    // create a build 
    async createBuild() {
        return await this.api.reposRepoIdPipelinesPost(
            this.woodpecker_api_key,
            this.woodpecker_repo_id,
            {
                variables: this.buildVars,
            }
        )
    }
}
