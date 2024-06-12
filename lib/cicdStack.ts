import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, IGithub, IEnvVar } from './constructs/codePipeline';

export interface CicdStackProps extends cdk.StackProps {
  readonly sysId: string;
  readonly envId: string;
  readonly github: IGithub;
  readonly envVar: IEnvVar;
}

export class CicdStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CicdStackProps) {
    super(scope, id, props);
    
    // 引数のenvが未定義の場合エラーを返す
    if (!props.env) {
      throw new Error('The value of the argument env is invalid.');
    }

    // ------------------------------
    // CICD
    // ------------------------------
    
    // パイプライン 作成
    new CodePipeline(this, 'CodePipeline', {
      env: props.env,
      envId: props.envId,
      ...props.github,
      ...props.envVar,
      buildProjectName: `${props.sysId}-${props.envId}-build`,
      pipelineName: `${props.sysId}-${props.envId}-pipeline`,
    });
  }
}