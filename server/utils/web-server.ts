import {
    DefaultApi,
    Configuration,
    DefaultApiFactory,
} from "./typescript-fetch-client-generated/";



export const useApiClient = () => DefaultApiFactory(
    new Configuration({
        basePath: "http://18.144.72.10:8000"
    }),
    fetch,
    "http://18.144.72.10:8000",
)


