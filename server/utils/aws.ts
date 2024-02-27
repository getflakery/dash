import {
EC2Client,

} from "@aws-sdk/client-ec2";


let _client: EC2Client | null = null
export const useEC2Client = () => {
    if (!_client) {
        _client = new EC2Client({})
    }
    return _client
     
}
