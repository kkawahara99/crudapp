import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export interface CognitoProps {
  userPoolName?: string;
}

export class Cognito extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly client: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: CognitoProps) {
    super(scope, id);
    
    // ユーザープール
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: props.userPoolName,
      signInCaseSensitive: false, 
      selfSignUpEnabled: true,
      mfa: cognito.Mfa.OFF,
      signInAliases: {
        username: true,
        email: true,
      },
      email: cognito.UserPoolEmail.withCognito(),
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: cdk.Duration.days(7),
      },
      advancedSecurityMode: cognito.AdvancedSecurityMode.ENFORCED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    
    // APP クライアント
    const client = userPool.addClient('AppClient');

    // 結果をセット
    this.userPool = userPool;
    this.client = client;
  }
}