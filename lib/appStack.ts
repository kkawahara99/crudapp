import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as secrets from 'aws-cdk-lib/aws-secretsmanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as utils from './utils/index';
import { Ecr } from './constructs/ecr';
import { Fargate } from './constructs/fargate';
import { AlbListener } from './constructs/albListener';

export interface AppStackProps extends cdk.StackProps {
  sysId: string;
  envId: string;
  vpc: ec2.Vpc;
  securityGroup: {
    public: ec2.SecurityGroup
    private: ec2.SecurityGroup
    secure: ec2.SecurityGroup
  };
  alb: elbv2.ApplicationLoadBalancer;
  cluster: ecs.Cluster;
  dbSecret: secrets.Secret;
  userPoolId: string;
  userPoolClientId: string;
  apiUrl: string;
  commitHash?: string;
  certificateArn: string;
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);
    
    const vpc = props.vpc;
    const cluster = props.cluster;
    const alb = props.alb;

    // ------------------------------
    // Service
    // ------------------------------
    
    // バックエンド用リポジトリ
    const ecrConstructBackend = new Ecr(this, 'EcrConstructBackend', {
      env: props.env!,
      repositoryName: `${props.sysId}${props.envId}backend`,
      dockerImageAssetPath: 'src/backend',
    });

    // バックエンド用Fargateサービス
    const fargateConstructBackend = new Fargate(this, 'FargateConstructBackend', {
      cluster,
      taskName: `${props.sysId}-${props.envId}-ecs-task-backend`,
      containerName: 'backend',
      environment: {
        'PORT': '3000',
      },
      environmentSec: {
        'MYSQL_HOST': ecs.Secret.fromSecretsManager(props.dbSecret, 'host'),
        'MYSQL_DATABASE': ecs.Secret.fromSecretsManager(props.dbSecret, 'dbname'),
        'MYSQL_PORT': ecs.Secret.fromSecretsManager(props.dbSecret, 'port'),
        'MYSQL_USER': ecs.Secret.fromSecretsManager(props.dbSecret, 'username'),
        'MYSQL_PASSWORD': ecs.Secret.fromSecretsManager(props.dbSecret, 'password'),
      },
      serviceName: `${props.sysId}-${props.envId}-ecs-service-backend`,
      subnets: utils.getPrivateSubnetsFromVpc(vpc),
      securityGroups: [props.securityGroup.private],
      ecrRepository: ecrConstructBackend.ecrRepository,
      secret: props.dbSecret,
      containerPort: 3000,
    });

    // フロントエンド用リポジトリ
    const ecrConstructFrontend = new Ecr(this, 'EcrConstructFrontend', {
      env: props.env!,
      repositoryName: `${props.sysId}${props.envId}frontend`,
      dockerImageAssetPath: 'src/frontend',
      buildArgs: {
        'REACT_APP_AUTH_USER_POOL_ID': props.userPoolId,
        'REACT_APP_AUTH_USER_POOL_CLIENT_ID': props.userPoolClientId,
        'REACT_APP_API_URL': props.apiUrl,
        'REACT_APP_COMMIT_HASH': props.commitHash || "",
      },
    });

    // フロントエンド用Fargateサービス
    const fargateConstructFrontend = new Fargate(this, 'FargateConstructFrontend', {
      cluster,
      taskName: `${props.sysId}-${props.envId}-ecs-task-frontend`,
      containerName: 'frontend',
      serviceName: `${props.sysId}-${props.envId}-ecs-service-frontend`,
      subnets: utils.getPrivateSubnetsFromVpc(vpc),
      securityGroups: [props.securityGroup.private],
      ecrRepository: ecrConstructFrontend.ecrRepository,
      containerPort: 80,
    });
    
    // ALBリスナー
    new AlbListener(this, 'ListenerConstruct', {
      alb,
      serviceBack: fargateConstructBackend.fargateService,
      serviceFront: fargateConstructFrontend.fargateService,
      certificateArn: props.certificateArn,
    });
  }
}