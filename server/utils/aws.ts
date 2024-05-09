import {
EC2Client,

} from "@aws-sdk/client-ec2";

// autoscaling
import {
    AutoScaling,
} from "@aws-sdk/client-auto-scaling";


let _client: EC2Client | null = null
export const useEC2Client = () => {
    if (!_client) {
        _client = new EC2Client({
            region: 'us-west-1'
        })
    }
    return _client
     
}

// autoscaling
let _autoScalingClient: AutoScaling | null = null
export const useAutoScalingClient = () => {
    if (!_autoScalingClient) {
        _autoScalingClient = new AutoScaling({})
    }
    return _autoScalingClient
     
}
