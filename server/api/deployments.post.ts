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
import config from '~/config';
import petname from 'node-petname'
import { AuthorizeSecurityGroupIngressCommand, CreateLaunchTemplateCommand, CreateSecurityGroupCommand, EC2Client } from "@aws-sdk/client-ec2";
import { CreateAutoScalingGroupCommand } from "@aws-sdk/client-auto-scaling";

interface TagData {
  turso_token: string
  file_encryption_key: string
  template_id: string
  flake_url: string
  deployment_id: string
}

async function createLaunchTemplate(
  input: { deploymentSlug: string },
  tags: { [key: string]: string },
  ec2ClientNg: EC2Client
) {
  console.log(tags)
  try {
    const command = new CreateLaunchTemplateCommand({
      LaunchTemplateName: input.deploymentSlug,
      LaunchTemplateData: {
        InstanceType: "t3.small",
        ImageId: "ami-07dba754bbb515299",
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
        }]
      }
    });

    const response = await ec2ClientNg.send(command);
    console.log('Launch Template Created:', response);
  } catch (error) {
    console.error('Error creating launch template:', error);
    throw new Error(`LaunchTemplateCreationFailed: ${error}`);
  }
}


async function createSecurityGroup(deploymentSlug: string, ec2Client: EC2Client) {
  const vpcId = "vpc-031c620b47a9ea885";
  const publicSubnets = [
    "subnet-040ebc679c54ecf38",
    "subnet-0e22657a6f50a3235"
  ];

  // Create security group request
  const createSGParams = {
    Description: "Security group for the deployment",
    GroupName: deploymentSlug,
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


async function authorizeSecurityGroupIngress(
  sgId: string,
  input: { targets?: { port: number }[] },
  ec2ClientNg: EC2Client
) {
  const inputTargets = input.targets || [{ port: 8000 }];
  const additionalTargets = [{ port: 443 }];

  const authorizeSecurityGroupIngressCommands = [...inputTargets, ...additionalTargets].map(target => {
      return new AuthorizeSecurityGroupIngressCommand({
          GroupId: sgId,
          IpPermissions: [{
              FromPort: target.port,
              ToPort: target.port,
              IpProtocol: "TCP",
              IpRanges: [{
                  CidrIp: "0.0.0.0/0"
              }]
          }]
      });
  });

  for (let command of authorizeSecurityGroupIngressCommands) {
      try {
          const response = await ec2ClientNg.send(command);
          console.log('Security group ingress rules added:', response);
      } catch (error) {
          console.error('Error adding security group ingress rules:', error);
          throw new Error(`SecurityGroupIngressRulesAdditionFailed: ${error}`);
      }
  }
}


export default eventHandler(async (event) => {
  console.log("event", event)
  const { templateID } = await useValidatedBody(event, {
    templateID: z.string().uuid(),
  })

  const session = await requireUserSession(event)

  const userID = session.user.id

  const db = useDB()

  const { flakeURL, awsInstanceType } = await db.select().from(templates).where(
    and(
      eq(templates.id, templateID),
      eq(templates.userID, userID)
    )).get();



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


  // todo deploy aws create
  let tags = {
    turso_token: process.env.TURSO_DB_TOKEN || "",
    file_encryption_key: process.env.FILE_ENCRYPTION_KEY || "",
    template_id: templateID,
    flake_url: flakeURL,
    deployment_id: uuidv4(),
  }

  let ec2Client = useEC2Client()

  await createLaunchTemplate(
    { deploymentSlug: tags.deployment_id },
    tags, ec2Client,
  )

  let autoscalingClient = useAutoScalingClient()

  // Parameters for creating the auto scaling group
  const createAsgParams = {
    AutoScalingGroupName: tags.deployment_id,
    LaunchTemplate: {
      LaunchTemplateName: tags.deployment_id,
      // additional parameters can be specified here
    },
    MinSize: 1,
    MaxSize: 1,
    VPCZoneIdentifier: "subnet-040ebc679c54ecf38",
    // AvailabilityZones: ["us-west-1a", "us-west-1c"],
    // DesiredCapacity: 1,
    // other parameters can be added here
  };

  await autoscalingClient.send(
    new CreateAutoScalingGroupCommand(createAsgParams)
  );

  let sg_id = await createSecurityGroup(tags.deployment_id, ec2Client)

  // await authorizeSecurityGroupIngress(sg_id??"", { targets: ports??[].map(
  //   port => ({ port })) }, ec2Client)






  const name = petname(2, "-")

  let deployment = await db.insert(deployments).values({
    id: tags.deployment_id,
    userID,
    templateID,
    name,
    createdAt: new Date().valueOf(),
  }).returning().get()



  return deployment
})


function generateSubdomain(length: number): string {
  // Define the characters that can be used in the subdomain
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let subdomain = '';

  // Generate a subdomain of the desired length
  for (let i = 0; i < length; i++) {
    // Pick a random character from the chars string
    const randomIndex = Math.floor(Math.random() * chars.length);
    subdomain += chars.charAt(randomIndex);
  }

  return subdomain;
}

