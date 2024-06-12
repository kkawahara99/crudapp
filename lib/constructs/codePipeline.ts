import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as codeBuild from 'aws-cdk-lib/aws-codebuild';
import * as codePipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codePipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface CodePipelineProps extends IGithub, IEnvVar {
  readonly env: cdk.Environment;
  readonly envId: string;
  readonly bucketName?: string;
  readonly buildProjectName?: string;
  readonly pipelineName?: string;
}

export interface IGithub {
  readonly owner: string;
  readonly repo: string;
  readonly branch: { [key: string]: string };
  readonly connectionArn: string;
}

export interface IEnvVar {
  readonly userPoolId: string;
  readonly userPoolClientId: string;
  readonly apiUrl: string;
  readonly certificateArn: string;
}

/**
 * CodePipelineを作成
 */
export class CodePipeline extends Construct {
  public readonly pipeline: codePipeline.Pipeline;

  constructor(scope: Construct, id: string, props: CodePipelineProps) {
    super(scope, id);

    // Artifact用S3バケット
    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: props.bucketName,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Source 作成
    const sourceArtifact = new codePipeline.Artifact();

    // Source アクション作成
    const sourceAction = new codePipelineActions.CodeStarConnectionsSourceAction({
      actionName: 'source',
      owner: props.owner,
      repo: props.repo,
      branch: props.branch[props.envId],
      connectionArn: props.connectionArn,
      output: sourceArtifact,
    });
    
    // Build 作成
    const buildProject = new codeBuild.PipelineProject(this, 'BuildProject', {
      projectName: props.buildProjectName,
      buildSpec: codeBuild.BuildSpec.fromAsset('buildspec.yml'),
      environment: {
        buildImage: codeBuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codeBuild.ComputeType.SMALL,
        environmentVariables: {
          ENV_ID: {
            type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: props.envId,
          },
          USER_POOL_ID: {
            type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: props.userPoolId,
          },
          USER_POOL_CLIENT_ID: {
            type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: props.userPoolClientId,
          },
          API_URL: {
            type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: props.apiUrl,
          },
          CERTIFICATE_ARN: {
            type: codeBuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: props.certificateArn,
          },
        },
      },
    });
    
    // Build権限追加（一旦Administrator権限を付与）
    buildProject.role!.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));
    
    // Build アクション作成
    const buildAction = new codePipelineActions.CodeBuildAction({
      actionName: 'build',
      project: buildProject,
      input: sourceArtifact,
    });
    
    // パイプライン作成
    const pipeline = new codePipeline.Pipeline(this, 'Pipeline', {
      pipelineName: props.pipelineName,
      pipelineType: codePipeline.PipelineType.V2,
      artifactBucket: bucket,
      stages: [
        {
          stageName: 'source',
          actions: [sourceAction],
        },
        {
          stageName: 'build',
          actions: [buildAction],
        },
      ],
    });

    // 結果をセット
    this.pipeline = pipeline;
  }
}