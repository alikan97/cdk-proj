import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { validateEntry } from "../models/InputeValidator";
import {v4 as uuidv4} from 'uuid';

const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB.DocumentClient();

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Successful'
    }

    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);

    const parsedItem = validateEntry(item);

    try {
        await dbClient.put({
            TableName: TABLE_NAME!,
            Item: parsedItem
        }).promise()
    } catch (error: any) {
        result.statusCode = 500;
        result.body = JSON.stringify(error);
    } 
    result.body = JSON.stringify(`Created item with id: ${parsedItem.itemId}`);

    return result;
}

export { handler }