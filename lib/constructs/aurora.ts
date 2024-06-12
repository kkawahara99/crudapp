import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secrets from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface AuroraProps {
  clusterIdentifier?: string;
  dbUserName: string;
  dbName: string;
  engineVersion: rds.AuroraMysqlEngineVersion;
  parameterGroupName?: string;
  serverlessV2MinCapacity: number;
  serverlessV2MaxCapacity: number;
  vpc: ec2.Vpc;
  subnets: ec2.ISubnet[];
  dbSecurityGroups: ec2.SecurityGroup[];
  endpointSecurityGroups: ec2.SecurityGroup[]
  secretName?: string;
  endpointName?: string;
}

export class Aurora extends Construct {
  public readonly dbSecret: secrets.Secret;
  public readonly aurora: rds.DatabaseCluster;

  constructor(scope: Construct, id: string, props: AuroraProps) {
    super(scope, id);
    
    const vpc = props.vpc;

    // DB認証情報用シークレット
    const dbSecret = new secrets.Secret(this, 'Secret', {
      secretName: props.secretName,
      description: 'Secret for DB auth info',
      generateSecretString: {
        excludeCharacters: '@%*()_+=`~{}|[]\\:";\'?,./',
        generateStringKey: 'password',
        secretStringTemplate: JSON.stringify({username: props.dbUserName}),
      },
    });
    
    // Clusterパラメータグループ
    const parameterGroup = new rds.ParameterGroup(this, 'ParameterGroup', {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: props.engineVersion,
      }),
      name: props.parameterGroupName,
      parameters: {
        time_zone: 'Asia/Tokyo',
      }
    });

    // Aurora Serverless v2（MySQL）
    const aurora = new rds.DatabaseCluster(this, 'Aurora', {
      clusterIdentifier: props.clusterIdentifier,
      credentials: rds.Credentials.fromSecret(dbSecret),
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: props.engineVersion,
      }),
      defaultDatabaseName: props.dbName,
      writer: rds.ClusterInstance.serverlessV2('writer'),
      readers: [
        rds.ClusterInstance.serverlessV2('reader', { scaleWithWriter: true }),
      ],
      serverlessV2MinCapacity: props.serverlessV2MinCapacity,
      serverlessV2MaxCapacity: props.serverlessV2MaxCapacity,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false, // 本番ではtrueにすべき
      storageEncrypted: true,
      vpc,
      vpcSubnets: {
        subnets: props.subnets
      },
      securityGroups: props.dbSecurityGroups,
      parameterGroup: parameterGroup,
      backtrackWindow: cdk.Duration.hours(1),
    });

    aurora.addRotationSingleUser({
      automaticallyAfter: cdk.Duration.days(30),
      excludeCharacters: "\"@/\\ '",
      vpcSubnets: {
        subnets: props.subnets
      },
    });

    // SecretsManager用のVPCエンドポイント
    const endpoint = new ec2.InterfaceVpcEndpoint(this, 'SecretsManagerEndpoint', {
      vpc: props.vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      securityGroups: props.endpointSecurityGroups
    });
    if (props.endpointName) {
      cdk.Tags.of(endpoint).add('Name', props.endpointName);
    }

    // 結果をセット
    this.dbSecret = dbSecret;
    this.aurora = aurora;
  }
}