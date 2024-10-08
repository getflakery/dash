import {
    EC2Client,

} from "@aws-sdk/client-ec2";

// autoscaling
import {
    AutoScalingClient,
} from "@aws-sdk/client-auto-scaling";

import { ElasticLoadBalancingV2Client } from "@aws-sdk/client-elastic-load-balancing-v2";

import { Route53Client, ChangeResourceRecordSetsCommand } from "@aws-sdk/client-route-53";


const getConf = () => {
    const config = useRuntimeConfig()

    if (config.aws_key && config.aws_secret) {
        console.log('using env aws conf')
        return {
            region: 'us-west-2',
            credentials: {
                accessKeyId: config.AWS_ACCESS_KEY_ID,
                secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
            }

        }
    }



    console.log('using dev aws conf')
    return {
        region: 'us-west-2',
    }
}


let _client: EC2Client | null = null
export const useEC2Client = () => {
    if (!_client) {
        _client = new EC2Client(getConf())
    }
    return _client

}

// // // autoscaling
let _autoScalingClient: AutoScalingClient | null = null
export const useAutoScalingClient = () => {
    if (!_autoScalingClient) {
        _autoScalingClient = new AutoScalingClient(getConf())
    }
    return _autoScalingClient

}

let _elbClient: ElasticLoadBalancingV2Client | null = null
export const useELBClient = () => {
    if (!_elbClient) {
        _elbClient = new ElasticLoadBalancingV2Client(getConf())
    }
    return _elbClient

}

let _route53Client: Route53Client | null = null
export const useRoute53Client = () => {
    if (!_route53Client) {
        _route53Client = new Route53Client(getConf())
    }
    return _route53Client

}