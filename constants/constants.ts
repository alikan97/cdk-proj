export const API_GATEWAY = {
    name: 'StoreApi'
}

export const DYNAMO_DB = {
    tableName: 'StoreTable',
    primaryKey: 'ItemId'
}

export const LAMBDA = {
    name: 'Create',
}

export const STACK_NAME = 'ApplicationStack'
export const USERPOOL_NAME = 'ApplicationUserPool';
export const COGNITO_AUTH_NAME = 'ApplicationUserAuthorizer';
export const IDENTITY_POOL_NAME = 'ApplicationIdentityPool';