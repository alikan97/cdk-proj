import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResult, Context } from 'aws-lambda';

const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;

const dbClient = new DynamoDB.DocumentClient();

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Successful'
    }

    try {
        if (event.queryStringParameters) {
            if (PRIMARY_KEY! in event.queryStringParameters) {
                result.body = await queryWithPrimaryPartition(event.queryStringParameters);
            }
            else {
                result.body = await queryWithSecondaryPartition(event.queryStringParameters);
            }
        }
        result.body = await scanTable();
    } catch (error: any) {
        result.body = error.message;
    } 

    return result;
}

async function scanTable() {
    const queryResponse = await dbClient.scan({
        TableName: TABLE_NAME!
    }).promise();

    return JSON.stringify(queryResponse.Items);
}

async function queryWithPrimaryPartition (queryParams: APIGatewayProxyEventQueryStringParameters) {
    const keyValue = queryParams[PRIMARY_KEY!];
    const queryResponse = await dbClient.query({
        TableName: TABLE_NAME!,
        KeyConditionExpression: '#key = :val',
        ExpressionAttributeNames: {
            '#key': PRIMARY_KEY!
        },
        ExpressionAttributeValues: {
            ':val': keyValue
        }
    }).promise();

    return JSON.stringify(queryResponse.Items);
}

async function queryWithSecondaryPartition (queryParams: APIGatewayProxyEventQueryStringParameters) {
    const queryKey = Object.keys(queryParams)[0];
    const queryVal = queryParams[queryKey];

    const queryResponse = await dbClient.query({
        TableName: TABLE_NAME!,
        KeyConditionExpression: '#key = :val',
        ExpressionAttributeNames: {
            '#key': queryKey!
        },
        ExpressionAttributeValues: {
            ':val': queryVal
        }
    }).promise();

    return JSON.stringify(queryResponse.Items);
}

export { handler }