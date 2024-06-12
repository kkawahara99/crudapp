import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloud9 from '@aws-cdk/aws-cloud9-alpha';
import { Construct } from 'constructs';
import { IAM } from 'aws-sdk';

export interface Cloud9Props {
  env: cdk.Environment;
  environmentName?: string;
  vpc: ec2.Vpc;
  ownerName: string;
  dbSecurityGroup: ec2.ISecurityGroup;
}

export class Cloud9 extends Construct {

  constructor(scope: Construct, id: string, props: Cloud9Props) {
    super(scope, id);
    
    const { vpc } = props;

    (async () => {
      // Cloud9 環境の所有者ARNを取得
      const owner = await this.getOwnerArn(props.ownerName, props.env.account!, props.env.region!);
    
      // Cloud9 環境作成
      const cloud9Env = new cloud9.Ec2Environment(this, 'Cloud9EnvironmentAlpha', {
        ec2EnvironmentName: props.environmentName,
        instanceType: new ec2.InstanceType('t2.small'),
        imageId: cloud9.ImageId.AMAZON_LINUX_2023,
        vpc,
        owner,
        connectionType: cloud9.ConnectionType.CONNECT_SSM,
        automaticStop: cdk.Duration.minutes(30),
      });
    })();

    // DBセキュリティグループにMySQL（3306）ポートの許可ルール追加
    props.dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(3306),
      'Allow MySQL access from Cloud9'
    );
  }

  // Cloud9 環境の所有者ARNを取得する関数
  private async getOwnerArn(ownerName: string, accountId: string, region: string): Promise<cloud9.Owner> {
    const iamClient = new IAM({ region: region });

    return new Promise(async (resolve, reject) => {
      try {
        const userResponse = await iamClient.getUser({ UserName: ownerName }).promise();
        if (userResponse) {
          resolve(cloud9.Owner.user(iam.User.fromUserName(this, 'User', ownerName)));
          return;
        }
      } catch (error) {
        console.warn(`IAM user (${ownerName}) is not exist: ${error}`);
      }
  
      resolve(cloud9.Owner.assumedRole(
        accountId,
        ownerName
      ));
      return;
    });
  }
}

