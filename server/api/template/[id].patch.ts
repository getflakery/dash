import { templates, } from '~/server/database/schema'
import { useValidatedParams, z, useValidatedBody } from 'h3-zod'
import { ChangeResourceRecordSetsCommand } from "@aws-sdk/client-route-53";

import { eq, and } from 'drizzle-orm'

async function deleteCNAMERecord(domainName, route53Client) {
  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: "DELETE",
          ResourceRecordSet: {
            Name: domainName,
            Type: "CNAME",
            TTL: 300,
            ResourceRecords: [
              {
                Value: "loadb.flakery.xyz"
              }
            ]
          }
        }
      ]
    },
    HostedZoneId: "Z03309493AGZOVY2IU47X"
  };

  try {
    const command = new ChangeResourceRecordSetsCommand(params);
    const response = await route53Client.send(command);
    console.log("CNAME record deleted:", response);
  } catch (error) {
    console.error("Error deleting CNAME record:", error);
    throw new Error(`CNAMERecordDeletionFailed: ${error}`);
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


export default eventHandler(async (event) => {
  const { id } = await useValidatedParams(event, {
    id: z.string().uuid(),
  })
  const {
    name,
    flakeURL,
    host
  } = await useValidatedBody(event, {
    name: z.string(),
    flakeURL: z.string(),
    host: z.string()
  })
  const db = useDB()
  const session = await requireUserSession(event)
  const userID = session.user.id

  // check if the template exists
  let template = await db.select().from(templates).where(
    and(
      eq(templates.userID, userID),
      eq(templates.id, id))
  ).get();

  if (!template) {
    throw new Error('Template not found')
  }

  // if host is changed, update the host
  if (host !== template.host) {
    // delete the existing CNAME record
    const route53Client = useRoute53Client()
    await deleteCNAMERecord(`${template.host}.flakery.xyz`, route53Client)
    // create a new CNAME record
    await createCNAMERecord(`${host}.flakery.xyz`, "loadb.flakery.xyz", "Z03309493AGZOVY2IU47X", route53Client);


    await db.update(templates).set({
      host
    }).where(
      and(
        eq(templates.userID, userID),
        eq(templates.id, id))
    ).execute();
  }


  // set template name and flakeURL to the new values

  await db.update(templates).set({
    name,
    flakeURL
  }).where(
    and(
      eq(templates.userID, userID),
      eq(templates.id, id))
  ).execute();


  return
})
