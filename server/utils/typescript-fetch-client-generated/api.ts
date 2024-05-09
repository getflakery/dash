/// <reference path="./custom.d.ts" />
// tslint:disable
/**
 * webserver
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 0.1.0
 * 
 *
 * NOTE: This file is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the file manually.
 */

import * as url from "url";
import * as isomorphicFetch from "isomorphic-fetch";
import { Configuration } from "./configuration";

const BASE_PATH = "/".replace(/\/+$/, "");

/**
 *
 * @export
 */
export const COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "\t",
    pipes: "|",
};

/**
 *
 * @export
 * @interface FetchAPI
 */
export interface FetchAPI {
    (url: string, init?: any): Promise<Response>;
}

/**
 *
 * @export
 * @interface FetchArgs
 */
export interface FetchArgs {
    url: string;
    options: any;
}

/**
 *
 * @export
 * @class BaseAPI
 */
export class BaseAPI {
    protected configuration: Configuration;

    constructor(configuration?: Configuration, protected basePath: string = BASE_PATH, protected fetch: FetchAPI = isomorphicFetch) {
        if (configuration) {
            this.configuration = configuration;
            this.basePath = configuration.basePath || this.basePath;
        }
    }
}

/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */
export class RequiredError extends Error {
    name = "RequiredError"
    constructor(public field: string, msg?: string) {
        super(msg);
    }
}

/**
 * 
 * @export
 * @interface CreateListenerInput
 */
export interface CreateListenerInput {
    /**
     * 
     * @type {string}
     * @memberof CreateListenerInput
     */
    deploymentId: string;
    /**
     * 
     * @type {Array<Mapping>}
     * @memberof CreateListenerInput
     */
    mappings: Array<Mapping>;
}
/**
 * 
 * @export
 * @interface CreateListenerOutput
 */
export interface CreateListenerOutput {
}
/**
 * 
 * @export
 * @interface DeployAWSInput
 */
export interface DeployAWSInput {
    /**
     * 
     * @type {string}
     * @memberof DeployAWSInput
     */
    flakeUrl: string;
    /**
     * 
     * @type {string}
     * @memberof DeployAWSInput
     */
    instanceType: string;
    /**
     * 
     * @type {string}
     * @memberof DeployAWSInput
     */
    deploymentSlug: string;
    /**
     * 
     * @type {Array<any>}
     * @memberof DeployAWSInput
     */
    files?: Array<any>;
    /**
     * 
     * @type {string}
     * @memberof DeployAWSInput
     */
    subdomainPrefix: string;
    /**
     * 
     * @type {number}
     * @memberof DeployAWSInput
     */
    minSize?: number;
    /**
     * 
     * @type {number}
     * @memberof DeployAWSInput
     */
    maxSize?: number;
    /**
     * 
     * @type {Array<Target>}
     * @memberof DeployAWSInput
     */
    targets?: Array<Target>;
    /**
     * 
     * @type {string}
     * @memberof DeployAWSInput
     */
    templateId: string;
}
/**
 * 
 * @export
 * @interface DeployAWSOutput
 */
export interface DeployAWSOutput {
    /**
     * 
     * @type {string}
     * @memberof DeployAWSOutput
     */
    id: string;
    /**
     * 
     * @type {DeployAWSInput}
     * @memberof DeployAWSOutput
     */
    input: DeployAWSInput;
    /**
     * 
     * @type {string}
     * @memberof DeployAWSOutput
     */
    lbArn?: string;
}
/**
 * 
 * @export
 * @interface LogInput
 */
export interface LogInput {
    /**
     * 
     * @type {string}
     * @memberof LogInput
     */
    log: string;
}
/**
 * 
 * @export
 * @interface LogOutput
 */
export interface LogOutput {
}
/**
 * 
 * @export
 * @interface Mapping
 */
export interface Mapping {
    /**
     * 
     * @type {number}
     * @memberof Mapping
     */
    listenerPort: number;
    /**
     * 
     * @type {number}
     * @memberof Mapping
     */
    targetPort: number;
}
/**
 * 
 * @export
 * @interface ModelFile
 */
export interface ModelFile {
    /**
     * 
     * @type {string}
     * @memberof ModelFile
     */
    content: string;
    /**
     * 
     * @type {string}
     * @memberof ModelFile
     */
    path: string;
}
/**
 * 
 * @export
 * @interface Target
 */
export interface Target {
    /**
     * 
     * @type {number}
     * @memberof Target
     */
    port: number;
    /**
     * 
     * @type {string}
     * @memberof Target
     */
    healthCheckPath?: string;
    /**
     * 
     * @type {boolean}
     * @memberof Target
     */
    healthCheckEnabled?: boolean;
}
/**
 * DefaultApi - fetch parameter creator
 * @export
 */
export const DefaultApiFetchParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @param {CreateListenerInput} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        handlersCreateListenerCreateListener(body: CreateListenerInput, options: any = {}): FetchArgs {
            // verify required parameter 'body' is not null or undefined
            if (body === null || body === undefined) {
                throw new RequiredError('body','Required parameter body was null or undefined when calling handlersCreateListenerCreateListener.');
            }
            const localVarPath = `/create-listener`;
            const localVarUrlObj = url.parse(localVarPath, true);
            const localVarRequestOptions = Object.assign({ method: 'POST' }, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarHeaderParameter['Content-Type'] = 'application/json';

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            localVarUrlObj.search = null;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);
            const needsSerialization = (<any>"CreateListenerInput" !== "string") || localVarRequestOptions.headers['Content-Type'] === 'application/json';
            localVarRequestOptions.body =  needsSerialization ? JSON.stringify(body || {}) : (body || "");

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Get instance ID from queue  Retrieves the next available EC2 instance ID from the queue.
         * @param {DeployAWSInput} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        handlersDeployDeployAwsCreate(body: DeployAWSInput, options: any = {}): FetchArgs {
            // verify required parameter 'body' is not null or undefined
            if (body === null || body === undefined) {
                throw new RequiredError('body','Required parameter body was null or undefined when calling handlersDeployDeployAwsCreate.');
            }
            const localVarPath = `/deploy/aws/create`;
            const localVarUrlObj = url.parse(localVarPath, true);
            const localVarRequestOptions = Object.assign({ method: 'POST' }, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarHeaderParameter['Content-Type'] = 'application/json';

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            localVarUrlObj.search = null;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);
            const needsSerialization = (<any>"DeployAWSInput" !== "string") || localVarRequestOptions.headers['Content-Type'] === 'application/json';
            localVarRequestOptions.body =  needsSerialization ? JSON.stringify(body || {}) : (body || "");

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Get instance ID from queue  Retrieves the next available EC2 instance ID from the queue.
         * @param {LogInput} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        handlersLogLog(body: LogInput, options: any = {}): FetchArgs {
            // verify required parameter 'body' is not null or undefined
            if (body === null || body === undefined) {
                throw new RequiredError('body','Required parameter body was null or undefined when calling handlersLogLog.');
            }
            const localVarPath = `/log`;
            const localVarUrlObj = url.parse(localVarPath, true);
            const localVarRequestOptions = Object.assign({ method: 'POST' }, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarHeaderParameter['Content-Type'] = 'application/json';

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            localVarUrlObj.search = null;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);
            const needsSerialization = (<any>"LogInput" !== "string") || localVarRequestOptions.headers['Content-Type'] === 'application/json';
            localVarRequestOptions.body =  needsSerialization ? JSON.stringify(body || {}) : (body || "");

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * DefaultApi - functional programming interface
 * @export
 */
export const DefaultApiFp = function(configuration?: Configuration) {
    return {
        /**
         * 
         * @param {CreateListenerInput} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        handlersCreateListenerCreateListener(body: CreateListenerInput, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<CreateListenerOutput> {
            const localVarFetchArgs = DefaultApiFetchParamCreator(configuration).handlersCreateListenerCreateListener(body, options);
            return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                return fetch(basePath + localVarFetchArgs.url, localVarFetchArgs.options).then((response) => {
                    if (response.status >= 200 && response.status < 300) {
                        return response.json();
                    } else {
                        throw response;
                    }
                });
            };
        },
        /**
         * Get instance ID from queue  Retrieves the next available EC2 instance ID from the queue.
         * @param {DeployAWSInput} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        handlersDeployDeployAwsCreate(body: DeployAWSInput, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<DeployAWSOutput> {
            const localVarFetchArgs = DefaultApiFetchParamCreator(configuration).handlersDeployDeployAwsCreate(body, options);
            return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                return fetch(basePath + localVarFetchArgs.url, localVarFetchArgs.options).then((response) => {
                    if (response.status >= 200 && response.status < 300) {
                        return response.json();
                    } else {
                        throw response;
                    }
                });
            };
        },
        /**
         * Get instance ID from queue  Retrieves the next available EC2 instance ID from the queue.
         * @param {LogInput} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        handlersLogLog(body: LogInput, options?: any): (fetch?: FetchAPI, basePath?: string) => Promise<LogOutput> {
            const localVarFetchArgs = DefaultApiFetchParamCreator(configuration).handlersLogLog(body, options);
            return (fetch: FetchAPI = isomorphicFetch, basePath: string = BASE_PATH) => {
                return fetch(basePath + localVarFetchArgs.url, localVarFetchArgs.options).then((response) => {
                    if (response.status >= 200 && response.status < 300) {
                        return response.json();
                    } else {
                        throw response;
                    }
                });
            };
        },
    }
};

/**
 * DefaultApi - factory interface
 * @export
 */
export const DefaultApiFactory = function (configuration?: Configuration, fetch?: FetchAPI, basePath?: string) {
    return {
        /**
         * 
         * @param {CreateListenerInput} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        handlersCreateListenerCreateListener(body: CreateListenerInput, options?: any) {
            return DefaultApiFp(configuration).handlersCreateListenerCreateListener(body, options)(fetch, basePath);
        },
        /**
         * Get instance ID from queue  Retrieves the next available EC2 instance ID from the queue.
         * @param {DeployAWSInput} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        handlersDeployDeployAwsCreate(body: DeployAWSInput, options?: any) {
            return DefaultApiFp(configuration).handlersDeployDeployAwsCreate(body, options)(fetch, basePath);
        },
        /**
         * Get instance ID from queue  Retrieves the next available EC2 instance ID from the queue.
         * @param {LogInput} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        handlersLogLog(body: LogInput, options?: any) {
            return DefaultApiFp(configuration).handlersLogLog(body, options)(fetch, basePath);
        },
    };
};

/**
 * DefaultApi - object-oriented interface
 * @export
 * @class DefaultApi
 * @extends {BaseAPI}
 */
export class DefaultApi extends BaseAPI {
    /**
     * 
     * @param {CreateListenerInput} body 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    public handlersCreateListenerCreateListener(body: CreateListenerInput, options?: any) {
        return DefaultApiFp(this.configuration).handlersCreateListenerCreateListener(body, options)(this.fetch, this.basePath);
    }

    /**
     * Get instance ID from queue  Retrieves the next available EC2 instance ID from the queue.
     * @param {DeployAWSInput} body 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    public handlersDeployDeployAwsCreate(body: DeployAWSInput, options?: any) {
        return DefaultApiFp(this.configuration).handlersDeployDeployAwsCreate(body, options)(this.fetch, this.basePath);
    }

    /**
     * Get instance ID from queue  Retrieves the next available EC2 instance ID from the queue.
     * @param {LogInput} body 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    public handlersLogLog(body: LogInput, options?: any) {
        return DefaultApiFp(this.configuration).handlersLogLog(body, options)(this.fetch, this.basePath);
    }

}
