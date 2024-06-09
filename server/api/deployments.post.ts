import { useDB } from "../utils/db"
import { useValidatedBody, z, } from 'h3-zod'
import {
  templates,
  files as schemaFiles,
  templateFiles as schemaTemplateFiles,
  deployments,
} from '~/server/database/schema'
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm'
import petname from 'node-petname'
import { AuthorizeSecurityGroupIngressCommand, CreateLaunchTemplateCommand, CreateSecurityGroupCommand, EC2Client, _InstanceType, type LaunchTemplateIamInstanceProfileSpecificationRequest } from "@aws-sdk/client-ec2";
import { CreateAutoScalingGroupCommand } from "@aws-sdk/client-auto-scaling";

import {  ChangeResourceRecordSetsCommand } from "@aws-sdk/client-route-53";

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


interface createLaunchTemplateInput {
  deploymentSlug: string
  tags: { [key: string]: string }
  ec2ClientNg: EC2Client
  instanceType: string
  imageID: string
  instanceProfile?: LaunchTemplateIamInstanceProfileSpecificationRequest
  securityGroups?: string[]
}


async function createLaunchTemplate(
  createLaunchTemplateInput: createLaunchTemplateInput
) {
  const { deploymentSlug, tags, ec2ClientNg, instanceType, imageID, instanceProfile } = createLaunchTemplateInput
  try {
    const command = new CreateLaunchTemplateCommand({
      LaunchTemplateName: deploymentSlug,
      LaunchTemplateData: {
        KeyName: "flakery",
        InstanceType: instanceType as _InstanceType,
        ImageId: imageID,
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
            VolumeSize: 80,
            VolumeType: "gp2",
            DeleteOnTermination: true
          }
        }],
        IamInstanceProfile: instanceProfile,
        SecurityGroupIds: createLaunchTemplateInput.securityGroups ?? [],
        // MaxSpotPriceAsPercentageOfOptimalOnDemandPrice: 99,
        InstanceMarketOptions: {
          MarketType: "spot",
        },
      }
    });

    const response = await ec2ClientNg.send(command);
    console.log('Launch Template Created:', response);
  } catch (error) {
    console.error('Error creating launch template:', error);
    throw new Error(`LaunchTemplateCreationFailed: ${error}`);
  }
}


async function createSecurityGroup(
  name: string,
  ec2Client: EC2Client,
  vpcId: string,
) {


  // Create security group request
  const createSGParams = {
    Description: "Security group for the deployment",
    GroupName: name,
    VpcId: vpcId
  };

  try {
    // Sending the create security group request
    const createSGCommand = new CreateSecurityGroupCommand(createSGParams);
    const response = await ec2Client.send(createSGCommand);
    console.log("Security group created:", response);
    return response.GroupId;
  } catch (e) {
    console.error("SecurityGroupCreationFailed:", e);
    throw new Error(`Failed to create security group: ${e}`);
  }
}

async function authorizeInboundTraffic(securityGroupId: string, client: EC2Client) {
  try {
    // Define the permissions for IPv4
    const ipv4Params = {
      GroupId: securityGroupId,
      IpPermissions: [
        {
          IpProtocol: "tcp",
          FromPort: 80,
          ToPort: 80,
          IpRanges: [{ CidrIp: "0.0.0.0/0" }]
        },
        {
          IpProtocol: "tcp",
          FromPort: 443,
          ToPort: 443,
          IpRanges: [{ CidrIp: "0.0.0.0/0" }]
        },
        // 22
        {
          IpProtocol: "tcp",
          FromPort: 22,
          ToPort: 22,
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
          FromPort: 80,
          ToPort: 80,
          Ipv6Ranges: [{ CidrIpv6: "::/0" }]
        },
        {
          IpProtocol: "tcp",
          FromPort: 443,
          ToPort: 443,
          Ipv6Ranges: [{ CidrIpv6: "::/0" }]
        },
        {
          IpProtocol: "tcp",
          FromPort: 22,
          ToPort: 22,
          Ipv6Ranges: [{ CidrIpv6: "::/0" }]
        }
      ]
    };

    // Authorize IPv4 ingress
    await client.send(new AuthorizeSecurityGroupIngressCommand(ipv4Params));
    console.log("IPv4 ingress authorized for ports 80 and 443.");

    // Authorize IPv6 ingress
    await client.send(new AuthorizeSecurityGroupIngressCommand(ipv6Params));
    console.log("IPv6 ingress authorized for ports 80 and 443.");
  } catch (error) {
    console.error("Error authorizing inbound traffic:", error);
  }
}

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

export default eventHandler(async (event) => {

  const config: {
    turso_token: string,
    file_encryption_key: string,
    github_token: string,
    public: {
      vpc_id: string,
      public_subnet_1: string,
      public_subnet_2: string,
      private_subnet_1: string,
      private_subnet_2: string,
      image_id: string,
    }
  } = useRuntimeConfig(event)

  const {
    vpc_id,
    public_subnet_1, public_subnet_2, image_id,
    private_subnet_1, private_subnet_2
  } = config.public



  const { turso_token, file_encryption_key, github_token } = config



  const body = await useValidatedBody(event, {
    templateID: z.string().uuid(),
    awsInstanceType: z.string().optional(),
    publicIP: z.boolean(),
    loadBalancer: z.boolean(),
    minInstances: z.number(),
    maxInstances: z.number(),
    targetPort: z.number().optional(),
    production: z.boolean().optional().default(false),
  })
  let templateID = body.templateID


  let subnet = public_subnet_1
  if (!body.publicIP) {
    subnet = private_subnet_1
  }

  const session = await requireUserSession(event)

  const userID = session.user.id

  const db = useDB()

  const { flakeURL, awsInstanceType } = await db.select().from(templates).where(
    and(
      eq(templates.id, templateID),
      eq(templates.userID, userID)
    )).get();

  let it = body.awsInstanceType ?? awsInstanceType ?? "t3.small"



  const templateFiles = await db.select().from(schemaTemplateFiles).where(
    eq(schemaTemplateFiles.templateId, templateID)
  ).all();

  const cs = useCryptoString()

  const files = (await Promise.all(templateFiles?.map(async (templateFile) =>
    await db.select().from(schemaFiles).where(
      eq(schemaFiles.id, templateFile.fileId)
    ).get()
  )))?.map((file) => {
    if (!file) {
      return file
    }
    return {
      ...file,
      // todo, leave encrypted and decrypt on 
      // the receiver side
      content: cs.decrypt({
        iv: file.iv,
        encryptedData: file.content
      })
    }
  })


  const name = petname(2, "-")


  // todo deploy aws create
  let tags = {
    turso_token,
    file_encryption_key,
    template_id: templateID,
    flake_url: flakeURL,
    deployment_id: uuidv4(),
    github_token,
    name,
  }

  let ec2Client = useEC2Client()
\
  let sg_id = await createSecurityGroup(tags.deployment_id, ec2Client, vpc_id ?? "")

  if (sg_id == null || sg_id == undefined) {
    throw new Error("Failed to create security group")
  }

  if (body.loadBalancer) {
    await authorizeInboundTrafficForPort(sg_id, ec2Client, body.targetPort ?? 8080)
    await authorizeInboundTrafficForPort(sg_id, ec2Client, 22)

  } else {
    await authorizeInboundTrafficForAllPorts(sg_id, ec2Client)
  }

  await createLaunchTemplate(
    {
      deploymentSlug: tags.deployment_id,
      tags,
      ec2ClientNg: ec2Client,
      instanceType: it,
      imageID: image_id,
      securityGroups: [
        sg_id
      ] 
    }
  )

  let autoscalingClient = useAutoScalingClient()
  console.log("Creating autoscaling group");
  // Parameters for creating the auto scaling group
  const createAsgParams = {
    AutoScalingGroupName: tags.deployment_id,
    LaunchTemplate: {
      LaunchTemplateName: tags.deployment_id,
      // additional parameters can be specified here
    },
    MinSize: body.minInstances ?? 1,
    MaxSize: body.maxInstances ?? 1,
    VPCZoneIdentifier: subnet,
    // AvailabilityZones: ["us-west-1a", "us-west-1c"],
    // DesiredCapacity: 1,
    // other parameters can be added here

    
  };

  await autoscalingClient.send(
    new CreateAutoScalingGroupCommand(createAsgParams)
  );


  let lbDns = `${name}.${tags.deployment_id.substring(0, 6)}.flakery.xyz`

  if (body.loadBalancer) {
    const route53Client = useRoute53Client()
    await createCNAMERecord(lbDns, "loadb.flakery.xyz", "Z03309493AGZOVY2IU47X", route53Client);
  }


  let deployment = await db.insert(deployments).values({
    id: tags.deployment_id,
    userID,
    templateID,
    name,
    createdAt: new Date().valueOf(),
    host: lbDns,
    port: body.targetPort,
    data: {
      port_mappings: [{
        lb_port: 443,
        instance_port: 8000
      }],
      aws_resources: {
        launch_template_id: tags.deployment_id,
        autoscaling_group_id: tags.deployment_id.split("-")[0],
      },
      min_instances: body.minInstances,
      max_instances: body.maxInstances,
      public_ip: body.publicIP,
      load_balancer: body.loadBalancer,
    },
    production: body.production ? 1 : 0,
  }).returning().get()






  return deployment
})

