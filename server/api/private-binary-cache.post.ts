import { useDB } from "~/server/utils/db"

import { privateBinaryCache } from '~/server/database/schema'
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm'

import Delete, { AWSDeployment } from "~/mod/deployment";


export default eventHandler(async (event) => {
  console.log('get private binary cache')

  const db = useDB();
  const session = await requireUserSession(event)
  const userID = session.user.id

  console.log("checking if private binary cache exists")

  const existingPrivateBinaryCache = await db.select().from(privateBinaryCache).where(eq(privateBinaryCache.name, userID)).get()

  console.log("existingPrivateBinaryCache", existingPrivateBinaryCache)


  // delete existing deployment
  console.log('deleting existing deployment')
  if (existingPrivateBinaryCache) {
    await db.delete(privateBinaryCache).where(eq(privateBinaryCache.name, userID))
    // delete existing deployment
    await Delete(existingPrivateBinaryCache.deploymentID)
  }

  const bcacheID = "6bfa64d0-2ffa-4620-8ad3-0fae9dbebdf0"; // todo hardcoded tech debt
  const config = useRuntimeConfig(event)
  console.log('creating deployment for bcache')

  let deployment = new AWSDeployment(
    {
      config,
      templateID: bcacheID,
      userID: "57335981.0", // todo hardcoded tech debt
      production: false,
      overrides: {
        awsInstanceType: "m7i.large",
        publicIP: false,
        loadBalancer: false,
        minInstances: 1,
        targetPort: 3007,
      }
    })

  console.log('deploying bcache')

  let bcache = await deployment.Create();
  console.log('saving bcache')

  const binaryCache = await db.insert(privateBinaryCache).values({
    name: userID,
    id: uuidv4(),
    deploymentID: bcache.id,
    createdAt: Date.now(),
  }).execute();


  return binaryCache
})


