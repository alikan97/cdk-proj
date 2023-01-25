import { Stack, StackProps } from 'aws-cdk-lib';
import { AuthorizationType, MethodOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { GenericTable } from './GenericTable';
import { API_GATEWAY, DYNAMO_DB } from '../constants/constants';
import { AuthorizerWrapper } from './auth/AuthorizerWrapper';

export default class AppStack extends Stack {
    private api = new RestApi(this, API_GATEWAY.name);
    private authorizer: AuthorizerWrapper;
    
    private appDb = new GenericTable(this, 
        {
            tableName: DYNAMO_DB.tableName,
            primaryKey: DYNAMO_DB.primaryKey,
            createLambdaPath: 'Create',
            readLambdaPath: 'Read',
            updateLambdaPath: 'Update',
            deleteLambdaPath: 'Delete',
        });
    
    constructor(scope: Construct,id: string, props: StackProps) {
        super(scope, id, props);

        this.authorizer = new AuthorizerWrapper(this, this.api);

        const optionsWithAuthorizer: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: this.authorizer.authorizer.authorizerId
            }
        }

        // API Integrations
        const storeResourceObject = this.api.root.addResource('Items');
        storeResourceObject.addMethod('POST', this.appDb.createLambdaIntegration, optionsWithAuthorizer);
        storeResourceObject.addMethod('GET', this.appDb.readLambdaIntegration, optionsWithAuthorizer);
        storeResourceObject.addMethod('PUT', this.appDb.updateLambdaIntegration, optionsWithAuthorizer);
        storeResourceObject.addMethod('DELETE', this.appDb.deleteLambdaIntegration, optionsWithAuthorizer);
    }
}
