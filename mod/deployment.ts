import type { AutoScalingClient } from "@aws-sdk/client-auto-scaling";
import type { Route53Client } from "@aws-sdk/client-route-53";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { RuntimeConfig } from "~/types";
import type { CryptoString } from "~/server/utils/crypto";
import { v4 as uuidv4 } from 'uuid';
import { AuthorizeSecurityGroupIngressCommand, CreateLaunchTemplateCommand, CreateSecurityGroupCommand, EC2Client, _InstanceType } from "@aws-sdk/client-ec2";
import { CreateAutoScalingGroupCommand } from "@aws-sdk/client-auto-scaling";

import { ChangeResourceRecordSetsCommand } from "@aws-sdk/client-route-53";
import { templates, deployments } from "~/server/database/schema";
import { eq } from 'drizzle-orm'
import petname from 'node-petname'

async function authorizeInboundTrafficForAllPorts(securityGroupId: string, client: EC2Client) {
    try {
        // Define the permissions for IPv4
        const ipv4Params = {
            GroupId: securityGroupId,
            IpPermissions: [
                {
                    IpProtocol: "-1",
                    FromPort: -1,
                    ToPort: -1,
                    IpRanges: [{ CidrIp: "0.0.0.0/0" }]
                }
            ]
        };

        // Define the permissions for IPv6
        const ipv6Params = {
            GroupId: securityGroupId,
            IpPermissions: [
                {
                    IpProtocol: "-1",
                    FromPort: -1,
                    ToPort: -1,
                    Ipv6Ranges: [{ CidrIpv6: "::/0" }]
                }
            ]
        };

        // Authorize IPv4 ingress
        await client.send(new AuthorizeSecurityGroupIngressCommand(ipv4Params));
        console.log("IPv4 ingress authorized for all ports.");

        // Authorize IPv6 ingress
        await client.send(new AuthorizeSecurityGroupIngressCommand(ipv6Params));
        console.log("IPv6 ingress authorized for all ports.");
    }
    catch (error) {
        console.error("Error authorizing inbound traffic:", error);
    }
}

// authorize inbound traffic for port 
async function authorizeInboundTrafficForPort(securityGroupId: string, client: EC2Client, port: number) {
    try {
        // Define the permissions for IPv4
        const ipv4Params = {
            GroupId: securityGroupId,
            IpPermissions: [
                {
                    IpProtocol: "tcp",
                    FromPort: port,
                    ToPort: port,
                    IpRanges: [{ CidrIp: "0.0.0.0/0" }]
                }
            ]
        };

        // Define the permissions for IPv6
        const ipv6Params = {
            GroupId: securityGroupId,
            IpPermissions: [
                {
                    IpProtocol: "tcp",
                    FromPort: port,
                    ToPort: port,
                    Ipv6Ranges: [{ CidrIpv6: "::/0" }]
                }
            ]
        };

        // Authorize IPv4 ingress
        await client.send(new AuthorizeSecurityGroupIngressCommand(ipv4Params));
        console.log(`IPv4 ingress authorized for port ${port}.`);
        // Authorize IPv6 ingress
        await client.send(new AuthorizeSecurityGroupIngressCommand(ipv6Params));
        console.log(`IPv6 ingress authorized for port ${port}.`);
    }

    catch (error) {
        console.error("Error authorizing inbound traffic:", error);
    }
}

async function createCNAMERecord(domainName, targetDNS, hostedZoneId, route53Client) {
    const params = {
        ChangeBatch: {
            Changes: [
                {
                    Action: "UPSERT",
                    ResourceRecordSet: {
                        Name: domainName,
                        Type: "CNAME",
                        TTL: 300,
                        ResourceRecords: [
                            {
                                Value: targetDNS
                            }
                        ]
                    }
                }
            ]
        },
        HostedZoneId: hostedZoneId
    };

    try {
        const command = new ChangeResourceRecordSetsCommand(params);
        const response = await route53Client.send(command);
        console.log("CNAME record created:", response);
    } catch (error) {
        console.error("Error creating CNAME record:", error);
        throw new Error(`CNAMERecordCreationFailed: ${error}`);
    }
}



export interface AWSDeploymentInput {
    config: RuntimeConfig,
    templateID: string,
    userID: string,
    production: boolean,
    overrides: {
        awsInstanceType?: string;
        publicIP?: boolean;
        loadBalancer?: boolean;
        minInstances?: number;
        targetPort?: number;
    }
}

export class AWSDeployment {
    input: AWSDeploymentInput;
    db: BetterSQLite3Database | LibSQLDatabase<Record<string, never>>;
    ec2Client: EC2Client;
    autoScalingClient: AutoScalingClient;
    route53Client: Route53Client;
    cs: CryptoString;
    deploymentID: string;


    constructor(input: AWSDeploymentInput) {
        this.input = input;
        this.ec2Client = useEC2Client();
        this.autoScalingClient = useAutoScalingClient();
        this.route53Client = useRoute53Client();
        this.db = useDB();
        this.cs = useCryptoString();
        this.deploymentID = uuidv4();
    }


    // add method to create a deployment
    public async Create(){

        console.log('creating security group')
        const sg_id = await this.createSecurityGroup();


        console.log('creating sg rules')
        if (this.shouldCreateLoadBalancer()) {
            await authorizeInboundTrafficForPort(sg_id, this.ec2Client, this.input.overrides.targetPort ?? 8080)
        } else {
            await authorizeInboundTrafficForAllPorts(sg_id, this.ec2Client)
        }

        console.log('fetching template')
        let template = await this.db.select().from(templates).where(
            eq(templates.id, this.input.templateID)
        ).get()
        if (!template) {
            throw new Error('Template not found');

        }

        console.log('creating launch template')
        await this.createLaunchTemplate(template.flakeURL, sg_id);
        console.log('creating asg')
        await this.createAutoScalingGroup();

        const name = petname(2, "-")
        let lbDns = `${name}-${this.deploymentID.substring(0, 6)}.flakery.xyz`

        if (this.shouldCreateLoadBalancer()) {
            console.log('creating cname record')
            await createCNAMERecord(lbDns, "loadb.flakery.xyz", "Z03309493AGZOVY2IU47X", this.route53Client);
        }

        console.log('THIS', this)

        try {
            let deployment = await this.db.insert(deployments).values({
                id: this.deploymentID,
                userID: this.input.userID,
                templateID: this.input.templateID,
                name,
                createdAt: new Date().valueOf(),
                host: lbDns,
                port: this.input.overrides.targetPort ?? 8080,
                data: {
                    aws_resources: {
                        launch_template_id: this.deploymentID,
                        autoscaling_group_id: this.deploymentID,
                    },
                    min_instances: this.input.overrides.minInstances ?? 1,
                    max_instances: this.input.overrides.minInstances ?? 1,
                    public_ip: this.input.overrides.publicIP ?? false,
                    load_balancer: this.input.overrides.loadBalancer ?? true,
                },
                production: this.input.production ? 1 : 0,
            }).returning().get()
            if (!deployment) {
                throw new Error('Deployment creation failed');
            }
            return deployment;
        } catch (error) {
            console.error("Error creating deployment:", error);
            console.error(this);
            throw new Error(`DeploymentCreationFailed: ${error}`);
        }

    }

    private async createAutoScalingGroup(): Promise<void> {

        let subnet = this.input.config.public.private_subnet_1
        if (this.input.overrides.publicIP) {
            subnet = this.input.config.public.public_subnet_1
        }


        const createAsgParams = {
            AutoScalingGroupName: this.deploymentID,
            LaunchTemplate: {
                LaunchTemplateName: this.deploymentID,
                // additional parameters can be specified here
            },
            MinSize: this.input.overrides.minInstances ?? 1,
            MaxSize: this.input.overrides.minInstances ?? 1, // just make a static number of instances instead elastic
            VPCZoneIdentifier: subnet,
        };
        await this.autoScalingClient.send(
            new CreateAutoScalingGroupCommand(createAsgParams)
        );
    }

    private async createLaunchTemplate(
        flake_url: string,
        sg_id: string,
    ): Promise<void> {
        let tags = {
            turso_token: this.input.config.turso_token,
            file_encryption_key: this.input.config.file_encryption_key,
            template_id: this.input.templateID,
            flake_url: flake_url,
            deployment_id: this.deploymentID,
            github_token: this.input.config.github_token,
            name: this.deploymentID,
        }
        const command = new CreateLaunchTemplateCommand({
            LaunchTemplateName: this.deploymentID,
            LaunchTemplateData: {
                KeyName: "flakery",
                InstanceType: (this.input.overrides.awsInstanceType ?? "t3.small") as _InstanceType,
                ImageId: this.input.config.public.image_id,
                MetadataOptions: {
                    InstanceMetadataTags: "enabled"
                },
                TagSpecifications: [{
                    ResourceType: "instance",
                    Tags: Object.entries(tags).map(([key, value]) => ({ Key: key, Value: value }))
                  }],
                  BlockDeviceMappings: [{
                    DeviceName: "/dev/xvda",
                    Ebs: {
                      VolumeSize: 256,
                      VolumeType: "gp2",
                      DeleteOnTermination: true
                    }
                  }],
                  SecurityGroupIds: [sg_id],
                  InstanceMarketOptions: {
                    MarketType: "spot",
                  },
            }
        });

        await this.ec2Client.send(command);

    }




    private shouldCreateLoadBalancer(): boolean {
        return this.input.overrides.loadBalancer ?? true;
    }

    private async createSecurityGroup(): Promise<string> {
        // Create security group request
        const createSGParams = {
            Description: `Security group for deployment ${this.deploymentID}`,
            GroupName: this.deploymentID,
            VpcId: this.input.config.public.vpc_id
        };

        // Sending the create security group request
        const createSGCommand = new CreateSecurityGroupCommand(createSGParams);
        const response = await this.ec2Client.send(createSGCommand);
        if (!response.GroupId) {
            throw new Error('Security group creation failed');
        }
        return response.GroupId;

    }
}



