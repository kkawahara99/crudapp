import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secrets from 'aws-cdk-lib/aws-secretsmanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as utils from './utils/index';
import { Cognito } from './constructs/cognito';
import { Vpc } from './constructs/vpc';
import { Aurora } from './constructs/aurora';
import { Cloud9 } from './constructs/cloud9';
import { Analytics } from './constructs/analytics';
import { Monitoring } from './constructs/monitoring';

export interface BaseStackProps extends cdk.StackProps {
  sysId: string;
  envId: string;
  cloud9Owner: string;
  networkConf: INetworkConf;
  dataConf: IDataConf;
}

export interface INetworkConf {
  cidrBlock: string;
  cidrMaskPub: number;
  cidrMaskPri: number;
  cidrMaskSec: number;
}

export interface IDataConf {
  userName: string;
  dbName: string;
  minCapacity: number;
  maxCapacity: number;
  glueCodePath: string;
  email: string;
  etlCron: string;
}

export class BaseStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly securityGroup: {
    public: ec2.SecurityGroup
    private: ec2.SecurityGroup
    secure: ec2.SecurityGroup
  };
  public readonly alb: elbv2.ApplicationLoadBalancer;
  public readonly cluster: ecs.Cluster;
  public readonly dbSecret: secrets.Secret;
  public readonly userPoolId: string;
  public readonly userPoolClientId: string;
  
  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    // ------------------------------
    // Authentication
    // ------------------------------

    const cognitoConstruct = new Cognito(this, 'CognitoConstruct', {
      userPoolName: `${props.sysId}-${props.envId}-userpool`,
    });

    // ------------------------------
    // Network
    // ------------------------------

    const vpcConstruct = new Vpc(this, 'VpcConstruct', {
      vpcName: `${props.sysId}-${props.envId}-vpc-main`,
      cidrBlock: props.networkConf.cidrBlock,
      cidrMaskPub: props.networkConf.cidrMaskPub,
      cidrMaskPri: props.networkConf.cidrMaskPri,
      cidrMaskSec: props.networkConf.cidrMaskSec,
      bucketName: `${props.sysId}-${props.envId}-s3-flowlog-${props.env!.account}`,
    });

    // ------------------------------
    // Database
    // ------------------------------

    const auroraConstruct = new Aurora(this, 'AuroraConstruct', {
      clusterIdentifier: `${props.sysId}-${props.envId}-rds-cluster`,
      dbUserName: props.dataConf.userName,
      dbName: props.dataConf.dbName,
      engineVersion: rds.AuroraMysqlEngineVersion.VER_3_05_2,
      parameterGroupName: `${props.sysId}-${props.envId}-rds-pg`,
      serverlessV2MinCapacity: props.dataConf.minCapacity,
      serverlessV2MaxCapacity: props.dataConf.maxCapacity,
      vpc: vpcConstruct.vpc,
      subnets: utils.getIsolatedSubnetsFromVpc(vpcConstruct.vpc),
      dbSecurityGroups: [vpcConstruct.securityGroup.secure],
      endpointSecurityGroups:  [vpcConstruct.securityGroup.private],
      secretName: `${props.sysId}-${props.envId}-secret-aurora`,
      endpointName: `${props.sysId}-${props.envId}-end-secret`,
    });

    // ------------------------------
    // Service
    // ------------------------------
    
    // DB管理用Cloud9
    const cloud9 = new Cloud9(this, 'Cloud9Construct', {
      env: props.env!,
      environmentName: `${props.sysId}-${props.envId}-env`,
      vpc: vpcConstruct.vpc,
      ownerName: props.cloud9Owner,
      dbSecurityGroup: vpcConstruct.securityGroup.secure,
    });
    
    // ECSクラスター
    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      clusterName: `${props.sysId}-${props.envId}-ecs-cluster`,
      vpc: vpcConstruct.vpc,
      containerInsightsV2: ecs.ContainerInsights.ENABLED,
    });
    
    // ロードバランサー
    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      loadBalancerName: `${props.sysId}-${props.envId}-alb`,
      vpc: vpcConstruct.vpc,
      vpcSubnets: {
        subnets: utils.getPublicSubnetsFromVpc(vpcConstruct.vpc),
      },
      securityGroup: vpcConstruct.securityGroup.public,
      internetFacing: true,
    });
    
    // ALB サーバーアクセスログ
    const bucketAccessLog = new s3.Bucket(this, 'BucketAccessLog', {
      bucketName: `${props.sysId}-${props.envId}-s3-accesslog-${props.env!.account}`,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    alb.logAccessLogs(bucketAccessLog);

    // ------------------------------
    // Analytics
    // ------------------------------
    
    const analyticsConstruct = new Analytics(this, 'AnalyticsConstruct', {
      env: props.env!,
      bucketName: `${props.sysId}-${props.envId}-s3-etl-processed-${props.env!.account}`,
      databaseRawName: `${props.sysId}-${props.envId}-glue-db-raw`,
      databaseRawDescription: 'Glue Database for raw data',
      databaseProcessedName: `${props.sysId}-${props.envId}-glue-db-processed`,
      databaseProcessedDescription: 'Glue Database for processed data',
      connectionName: `${props.sysId}-${props.envId}-glue-conn`,
      securityGroups: [vpcConstruct.securityGroup.private],
      subnet: utils.getPrivateSubnetsFromVpc(vpcConstruct.vpc)[0],
      jdbcConnectionUrl: `jdbc:mysql://${auroraConstruct.aurora.clusterEndpoint.socketAddress}/${props.dataConf.dbName}`,
      secret: auroraConstruct.dbSecret,
      roleRawName: `${props.sysId}-${props.envId}-role-crawler-raw`,
      roleProcessedName: `${props.sysId}-${props.envId}-role-crawler-processed`,
      sourceRds: auroraConstruct.aurora,
      crawlerRawName: `${props.sysId}-${props.envId}-crawler-raw`,
      crawlerProcessedName: `${props.sysId}-${props.envId}-crawler-processed`,
      dbName: props.dataConf.dbName,
      jobName: `${props.sysId}-${props.envId}-glue-job`,
      jobDescription: 'Glue Job for order data',
      codePath: props.dataConf.glueCodePath,
      stateMachineName: `${props.sysId}-${props.envId}-sfn-etl`,
      ruleName: `${props.sysId}-${props.envId}-rule-etl`,
      ruleDescription: 'This rule is used to start Step Functions',
      etlCron: props.dataConf.etlCron,
    });

    // ------------------------------
    // 監視
    // -----------------------------
    
    new Monitoring(this, 'MonitoringConstruct', {
      topicName: `${props.sysId}-${props.envId}-topic-monitoring`,
      displayName: '[CONFIRMATION REQUIRED] Notification from AWS Step Functions.',
      email: props.dataConf.email,
      ruleName: `${props.sysId}-${props.envId}-rule-monitoring`,
      ruleDescription: 'This rule is used to notify Step Functions event to SNS topic',
      eventPattern: {
        detailType: ['Step Functions Execution Status Change'],
        source: ['aws.states'],
        detail: {
          'status': ['Failed', 'TIMED_OUT', 'ABORTED']
        },
      },
      serviceName: 'AWS Step Functions',
    });
    
    // 他スタックへの参照用
    this.vpc = vpcConstruct.vpc;
    this.securityGroup = vpcConstruct.securityGroup;
    this.alb = alb;
    this.cluster = cluster;
    this.dbSecret = auroraConstruct.dbSecret;
    this.userPoolId = cognitoConstruct.userPool.userPoolId;
    this.userPoolClientId = cognitoConstruct.client.userPoolClientId;
  }
}