import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const params = {
    TableName: process.env.TableName,
    Key: {
      userId: "123",
      gradeId: event.pathParameters.id,
    },
  };
  await dynamoDb.delete(params);

  return { status: true };
});