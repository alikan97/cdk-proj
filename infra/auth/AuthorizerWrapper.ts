import { CfnOutput } from "aws-cdk-lib";
import { CognitoUserPoolsAuthorizer, RestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient, CfnUserPoolGroup } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { COGNITO_AUTH_NAME, USERPOOL_NAME } from "../../constants/constants";
import { IdentityPoolWrapper } from "./IdentityPoolWrapper";

export class AuthorizerWrapper {
    private scope: Construct;
    private api: RestApi;
    private userPool!: UserPool;
    private UserPoolClient!: UserPoolClient;
    private identityPoolWrapper!: IdentityPoolWrapper;
    public authorizer!: CognitoUserPoolsAuthorizer;
    
    constructor(scope: Construct, api: RestApi) {
        this.scope = scope;
        this.api = api;
        this.initialize();
    }

    private initialize() {
        this.createUserPool();
        this.addUserPoolClient();
        this.createAuthorizer();
        this.initializeIPWrapper();
        this.createAdminGroup();
    }

    private addUserPoolClient() {
        this.UserPoolClient = this.userPool.addClient(`${USERPOOL_NAME}-client`, {
            userPoolClientName: `${USERPOOL_NAME}-client`,
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userPassword: true,
                userSrp: true
            },
            generateSecret: false
        });

        new CfnOutput(this.scope, 'UserPoolClient-Id', {
            value: this.UserPoolClient.userPoolClientId
        });
    }

    private createUserPool() {
        this.userPool = new UserPool(this.scope, USERPOOL_NAME, {
            userPoolName: USERPOOL_NAME,
            selfSignUpEnabled: true,
            signInAliases: {
                username: true,
                email: true,
            }
        });

        new CfnOutput(this.scope, 'UserPoolId', {
            value: this.userPool.userPoolId
        });
    }

    private createAuthorizer() {
        this.authorizer = new CognitoUserPoolsAuthorizer(this.scope, COGNITO_AUTH_NAME, {
            cognitoUserPools: [this.userPool],
            authorizerName: COGNITO_AUTH_NAME,
            identitySource: 'method.request.header.Authorization'
        });
        this.authorizer._attachToApi(this.api);
    }

    private createAdminGroup() {
        new CfnUserPoolGroup(this.scope, 'Admin-Group', {
            groupName: 'AdminGroup',
            userPoolId: this.userPool.userPoolId,
            roleArn: this.identityPoolWrapper.adminRole.roleArn
        });
    }

    private initializeIPWrapper() {
        this.identityPoolWrapper = new IdentityPoolWrapper(this.scope, this.userPool, this.UserPoolClient);
    }
}