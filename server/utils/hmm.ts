// autoscaling
import {
    AutoScalingClient,
} from "@aws-sdk/client-auto-scaling";
// // // autoscaling
let _autoScalingClient: AutoScalingClient | null = null
export const useAutoScalingClient = () => {
    if (!_autoScalingClient) {
        _autoScalingClient = new AutoScalingClient(getConf())
    }
    return _autoScalingClient
     
}