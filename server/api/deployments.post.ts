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


async function createLaunchTemplate(
  input: { deploymentSlug: string },
  tags: { [key: string]: string },
  ec2ClientNg: EC2Client,
  instanceType: string,
  imageID: string, 
  instanceProfile: LaunchTemplateIamInstanceProfileSpecificationRequest | undefined = undefined,

) {
  try {
    const command = new CreateLaunchTemplateCommand({
      LaunchTemplateName: input.deploymentSlug,
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
  deploymentSlug: string,
  ec2Client: EC2Client,
  vpcId: string,
) {


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
  input: { lb_port: number, instance_port: number }[],
  ec2ClientNg: EC2Client
) {


  const authorizeSecurityGroupIngressCommands = input.map(target => {
    return new AuthorizeSecurityGroupIngressCommand({
      GroupId: sgId,
      IpPermissions: [{
        FromPort: target.lb_port,
        ToPort: target.instance_port,
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



type instanceType = string | undefined | null

export default eventHandler(async (event) => {

  const config: {
    turso_token: string,
    file_encryption_key: string,
    github_token: string,
    public: {
      vpc_id: string,
      public_subnet_1: string,
      public_subnet_2: string,
      image_id: string,
    }
  } = useRuntimeConfig(event)

  const {
    vpc_id,
    public_subnet_1, public_subnet_2, image_id,
  } = config.public

  const { turso_token, file_encryption_key, github_token } = config


  const body = await useValidatedBody(event, {
    templateID: z.string().uuid(),
    awsInstanceType: z.string().optional(),
  })
  let templateID = body.templateID



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

  await createLaunchTemplate(
    { deploymentSlug: tags.deployment_id },
    tags, ec2Client, it, image_id,
  )

  let autoscalingClient = useAutoScalingClient()
  console.log("Creating autoscaling group");
  console.log(public_subnet_1);
  // Parameters for creating the auto scaling group
  const createAsgParams = {
    AutoScalingGroupName: tags.deployment_id,
    LaunchTemplate: {
      LaunchTemplateName: tags.deployment_id,
      // additional parameters can be specified here
    },
    MinSize: 1,
    MaxSize: 1,
    VPCZoneIdentifier: public_subnet_1,
    // AvailabilityZones: ["us-west-1a", "us-west-1c"],
    // DesiredCapacity: 1,
    // other parameters can be added here
  };

  await autoscalingClient.send(
    new CreateAutoScalingGroupCommand(createAsgParams)
  );

  let sg_id = await createSecurityGroup(tags.deployment_id, ec2Client, vpc_id ?? "")

  await authorizeSecurityGroupIngress(
    sg_id ?? "",
    [{
      lb_port: 443,
      instance_port: 8000
    }],
    ec2Client,
  )


  let lbDns = name + ".flakery.app"

  let lb_tags = {
    ...tags,
    flake_url: "github:getflakery/bootstrap#lb",
    bootstrap_args: "--lb",
  }

  let lb_launch_template = 
    await createLaunchTemplate(
      { deploymentSlug: tags.deployment_id + "-lb" },
      lb_tags, ec2Client, "t3.small", image_id, {
        Arn: "arn:aws:iam::150301572911:instance-profile/flakery" // todo read from config
      }
    )

  await autoscalingClient.send(
    new CreateAutoScalingGroupCommand({
      AutoScalingGroupName: tags.deployment_id + "-lb",
      LaunchTemplate: {
        LaunchTemplateName: tags.deployment_id + "-lb",
      },
      MinSize: 1,
      MaxSize: 1,
      VPCZoneIdentifier: public_subnet_1,
    })
  );

  let deployment = await db.insert(deployments).values({
    id: tags.deployment_id,
    userID,
    templateID,
    name,
    createdAt: new Date().valueOf(),
    host: lbDns,
    data: {
      port_mappings: [{
        lb_port: 443,
        instance_port: 8000
      }],
      aws_resources: {
        security_group_id: sg_id ?? "",
        launch_template_id: tags.deployment_id,
        autoscaling_group_id: tags.deployment_id.split("-")[0],
      },
    }
  }).returning().get()






  return deployment
})

