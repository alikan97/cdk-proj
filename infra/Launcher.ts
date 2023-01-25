import AppStack from "./AppStack";
import { App } from "aws-cdk-lib";
import { STACK_NAME } from "../constants/constants";

const app = new App();
const application = new AppStack(app, 'Application', {
    stackName: STACK_NAME,
});
