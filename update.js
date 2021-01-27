import { DynamoDB } from "aws-sdk";
import handler from "./libs/handler-lib";
import DynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    // Key object below is providing partition + sort key to update
    Key: {
      userId: "123",
      gradeId: event.pathParameters.id,
    },
    //Update Expression tells dynamodb what to change
    UpdateExpression: "SET content = :content, attachment = :attachment",
    ExpressionAttributeValues: {
      ":attachment": data.attachment || null,
      ":content": data.content || null,
    },
    //Return Values param tells dynamodb whether to return new item attributes.
    ReturnValues: "ALL_NEW",
  };

  await DynamoDb.update(params);

  return { status: true };
})