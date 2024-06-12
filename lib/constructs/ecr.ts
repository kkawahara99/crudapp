import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import * as ecrdeploy from 'cdk-ecr-deployment';
import { Construct } from 'constructs';

export interface EcrProps {
  env: cdk.Environment;
  repositoryName?: string;
  dockerImageAssetPath: string;
  buildArgs?: { [key: string]: string; }
}

export class Ecr extends Construct {
  public readonly ecrRepository: ecr.Repository;

  constructor(scope: Construct, id: string, props: EcrProps) {
    super(scope, id);

    // ECRリポジトリ
    const ecrRepository = new ecr.Repository(this, 'EcrRepo', {
      repositoryName: props.repositoryName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // Docker Image Asset
    const dockerImageAsset = new DockerImageAsset(this, 'DockerImageAsset', {
      directory:  props.dockerImageAssetPath,
      buildArgs: props.buildArgs,
    });

    // ECRリポジトリにDockerイメージをデプロイ
    new ecrdeploy.ECRDeployment(this, 'DeployDockerImage', {
      src: new ecrdeploy.DockerImageName(dockerImageAsset.imageUri),
      dest: new ecrdeploy.DockerImageName(
        `${props.env.account}.dkr.ecr.${props.env.region}.amazonaws.com/${ecrRepository.repositoryName}:latest`
      ),
    });

    // Set Result
    this.ecrRepository = ecrRepository;
  }
}