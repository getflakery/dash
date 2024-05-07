import {  useValidatedBody, z, } from 'h3-zod'
import { v4 as uuidv4 } from 'uuid';


export default eventHandler(async (event) => {

  let body = await readRawBody(event)

  let { Type,  SubscribeURL} = JSON.parse(body??"{}")

  switch (Type) {
    case "SubscriptionConfirmation":
        console.log(SubscribeURL)
        // get the SubscribeURL and confirm the subscription
        await fetch(SubscribeURL)
        return 
    default:
        console.log('not matched');
  }
})
