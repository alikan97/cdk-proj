import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const TABLE_NAME = process.env.TABLE_NAME as string;
const PRIMARY_KEY = process.env.PRIMARY_KEY as string;
const dbClient = new DynamoDB.DocumentClient();

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Successful'
    }

    const requestBody = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const itemId = event.queryStringParameters?.[PRIMARY_KEY];

    if (requestBody && itemId) {
        const requestBodyKey = Object.keys(requestBody)[0];
        const requestBodyVal = requestBody[requestBody];

        const updateResult = await dbClient.update({
            TableName: TABLE_NAME,
            Key: {
                [PRIMARY_KEY]: itemId
            },
            UpdateExpression: 'set #key = :val',
            ExpressionAttributeNames: {
                '#key': requestBodyKey
            },
            ExpressionAttributeValues: {
                ':val': requestBodyVal
            },
            ReturnValues: 'UPDATED_NEW'
        }).promise();

        result.body = JSON.stringify(updateResult);
    }  

    return result;
}

export { handler }