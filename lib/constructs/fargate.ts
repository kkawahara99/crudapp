import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secrets from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface FargateProps {
  cluster: ecs.Cluster;
  taskName?: string;
  containerName: string;
  environment?: { [key: string]: string; }
  environmentSec?: { [key: string]: ecs.Secret; }
  serviceName?: string;
  subnets: ec2.ISubnet[];
  securityGroups: ec2.ISecurityGroup[];
  ecrRepository: ecr.Repository;
  secret?: secrets.Secret;
  containerPort: number;
}

export class Fargate extends Construct {
  public readonly taskDefinition: ecs.FargateTaskDefinition;
  public readonly fargateService: ecs.FargateService;

  constructor(scope: Construct, id: string, props: FargateProps) {
    super(scope, id);
    
    const cluster = props.cluster;
    
    // タスク定義
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      family: props.taskName,
    });
    const container = taskDefinition.addContainer(props.containerName, {
      image: ecs.ContainerImage.fromEcrRepository(props.ecrRepository, 'latest'),
      environment: props.environment,
      secrets: props.environmentSec,
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: props.containerName,
        mode: ecs.AwsLogDriverMode.NON_BLOCKING,
        maxBufferSize: cdk.Size.mebibytes(25),
      }),
    });
    container.addPortMappings({
      containerPort: props.containerPort,
      hostPort: props.containerPort,
    });

    // ECSサービス（Fargate）
    const fargateService = new ecs.FargateService(this, 'FargateService', {
      serviceName: props.serviceName,
      cluster,
      taskDefinition,
      vpcSubnets: {
        subnets: props.subnets
      },
      securityGroups: props.securityGroups,
    });

    // 権限追加
    if (props.secret) {
      props.secret.grantRead(taskDefinition.executionRole!);
    }
    props.ecrRepository.grantPull(taskDefinition.executionRole!);

    // 結果をセット
    this.fargateService = fargateService;
  }
}