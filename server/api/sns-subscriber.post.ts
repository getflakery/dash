import { useValidatedBody, z } from 'h3-zod';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch'; // ensure 'node-fetch' is installed if running outside a browser context

export default eventHandler(async (event) => {
  let body = await readRawBody(event);
  let { Type, SubscribeURL, Message } = JSON.parse(body ?? "{}");

  switch (Type) {
    case "SubscriptionConfirmation":
      // Get the SubscribeURL and confirm the subscription
      await fetch(SubscribeURL);
      return {
        statusCode: 200,
        body: 'Subscription confirmed'
      };

    case "Notification":
      // Parse the Message to get further details like ResponseURL
      let { RequestType, ResponseURL, StackId, RequestId, LogicalResourceId} = JSON.parse(Message);

      if (RequestType !== "Create") {
        return {
          statusCode: 200,
          body: 'Ignoring non-create request'
        };
      }

      // Example data to send back to CloudFormation
      const responseData = {
        Status: "SUCCESS",
        Reason: "todo",
        PhysicalResourceId: uuidv4(),
        StackId,
        RequestId,
        LogicalResourceId,
      };

      // Send the response to the pre-signed S3 URL provided by CloudFormation
      await fetch(ResponseURL, {
        method: 'PUT',
        headers: {
          'Content-Type': '',
          'Content-Length': JSON.stringify(responseData).length.toString()
        },
        body: JSON.stringify(responseData)
      });

      return {
        statusCode: 200,
        body: 'Notification processed'
      };

    default:
      console.log('Type not matched:', Type);
      return {
        statusCode: 400,
        body: 'Invalid notification type'
      };
  }
});
