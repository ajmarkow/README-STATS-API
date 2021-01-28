import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const params = {
    TableName: process.env.TableName,
    // Defining params for dynamodb query
    // - 'userId = :userId': returns item matching userId
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId,
    },
  };

  const result = await dynamoDb.query(params);
  // Then we return matching items from dynamodb API call.
  return result.Items;
});