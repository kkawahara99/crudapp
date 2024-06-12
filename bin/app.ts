#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BaseStack, INetworkConf, IDataConf } from '../lib/baseStack';
import { CicdStack } from '../lib/cicdStack';
import { AppStack } from '../lib/appStack';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag'

const app = new cdk.App();

// Get Contexts.
const sysId: string = app.node.tryGetContext('sysId');
const envId: 'prd' | 'stg' | 'dev' = app.node.tryGetContext('envId');
const projectName: string = app.node.tryGetContext('projectName');
const domain: string = app.node.tryGetContext('domain');
const certificateArn: string = app.node.tryGetContext('certificateArn');
const cloud9Owner: string = app.node.tryGetContext('cloud9Owner');
const userPoolId: string = app.node.tryGetContext('userPoolId');
const userPoolClientId: string = app.node.tryGetContext('userPoolClientId');
const apiUrl: string = app.node.tryGetContext('apiUrl');
const commitHash: string = app.node.tryGetContext('commitHash');
const networkConf: INetworkConf = app.node.tryGetContext('networkConf');
const dataConf: IDataConf = app.node.tryGetContext('dataConf');

// どのスタックでも使用する共通プロパティを定義
const commonProps = {
  env: app.node.tryGetContext('env'),
  terminationProtection: envId === 'dev' ? false : true,
  sysId,
  envId,
}

// Create Stack.
// Base スタック
const baseStack = new BaseStack(app, 'BaseStack', {
  stackName: `${sysId}-${envId}-stack-base`,
  ...commonProps,
  cloud9Owner,
  networkConf,
  dataConf,
});

// CI/CD スタック
const cicdStack = new CicdStack(app, 'CicdStack', {
  stackName: `${sysId}-${envId}-stack-cicd`,
  ...commonProps,
  github: app.node.tryGetContext('github'),
  envVar: {
    userPoolId: baseStack.userPoolId,
    userPoolClientId: baseStack.userPoolClientId,
    apiUrl: domain !== '' ? `https://${domain}/api`
      : `https://${baseStack.alb.loadBalancerDnsName}/api`,
    certificateArn,
  },
});

// App スタック
const appStack = new AppStack(app, 'AppStack', {
  stackName: `${sysId}-${envId}-stack-app`,
  ...commonProps,
  vpc: baseStack.vpc,
  securityGroup: baseStack.securityGroup,
  alb: baseStack.alb,
  cluster: baseStack.cluster,
  dbSecret: baseStack.dbSecret,
  userPoolId,
  userPoolClientId,
  apiUrl,
  commitHash,
  certificateArn,
});

// Add tags.
cdk.Tags.of(app).add('sysId', sysId);
cdk.Tags.of(app).add('envId', envId);
cdk.Tags.of(app).add('ProjectName', projectName);

// cdk-nag suppressions.
NagSuppressions.addStackSuppressions(baseStack, [
  {
    id: 'AwsSolutions-S1',
    reason: 'Server access logs are not required'
  },
  {
    id: 'AwsSolutions-EC23',
    reason: 'Use 0.0.0.0/0 for DMZ'
  },
  {
    id: 'AwsSolutions-RDS6',
    reason: 'IAM Database Authentication is not required'
  },
  {
    id: 'AwsSolutions-RDS10',
    reason: 'Deletion protection is not required'
  },
  {
    id: 'AwsSolutions-RDS11',
    reason: 'Use 3306 port'
  },
  {
    id: "CdkNagValidationFailure",
    reason: "https://github.com/cdklabs/cdk-nag/issues/817"
  },
  {
    id: "AwsSolutions-IAM4",
    reason: "Use managed policy"
  },
  {
    id: "AwsSolutions-IAM5",
    reason: "Use wild card"
  },
  {
    id: "AwsSolutions-COG2",
    reason: 'MFA is not required'
  },
  {
    id: 'AwsSolutions-GL1',
    reason:'CloudWatch Logs does not include logs that should not be leaked to the outside world'
  },
  {
    id: 'AwsSolutions-GL3',
    reason:'Job bookmark does not include that should not be leaked to the outside world'
  },
  {
    id: 'AwsSolutions-SNS2',
    reason:'EventBridge cannot delivery to sns topic with AWS managed key'
  },
  {
    id: 'AwsSolutions-SNS3',
    reason:'EventBridge cannot delivery to sns topic with AWS managed key'
  },
]);

NagSuppressions.addStackSuppressions(cicdStack, [
  {
    id: "AwsSolutions-IAM4",
    reason: "Use managed policy"
  },
  {
    id: 'AwsSolutions-IAM5',
    reason: 'Use wildcard permissions'
  },
  {
    id: 'AwsSolutions-KMS5',
    reason: 'Automatic key rotation is not required'
  },
  {
    id: 'AwsSolutions-S1',
    reason: 'Server access logs are not required'
  },
  {
    id: 'AwsSolutions-CB4',
    reason: 'KMS key is not required'
  },
]);

NagSuppressions.addStackSuppressions(appStack, [
  {
    id: 'AwsSolutions-S1',
    reason: 'Server access logs are not required'
  },
  {
    id: "AwsSolutions-IAM4",
    reason: "Use managed policy"
  },
  {
    id: "AwsSolutions-IAM5",
    reason: "Use wild card"
  },
  {
    id: "AwsSolutions-ECS2",
    reason: 'Use environment variables'
  },
]);

// cdk-nag check.
cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))