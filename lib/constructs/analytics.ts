import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as glue_alpha from '@aws-cdk/aws-glue-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secrets from 'aws-cdk-lib/aws-secretsmanager';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

export interface AnalyticsProps {
  // 共通
  env: cdk.Environment;
  // S3
  bucketName?: string;
  // Glue
  databaseRawName?: string;
  databaseRawDescription?: string;
  databaseProcessedName?: string;
  databaseProcessedDescription?: string;
  connectionName?: string;
  securityGroups: ec2.ISecurityGroup[];
  subnet: ec2.ISubnet;
  jdbcConnectionUrl: string;
  secret: secrets.Secret;
  roleRawName?: string;
  roleProcessedName?: string;
  sourceRds: rds.DatabaseCluster;
  crawlerRawName?: string;
  crawlerProcessedName?: string;
  dbName: string;
  jobName?: string;
  jobDescription?: string;
  codePath: string;
  // StepFunctions
  stateMachineName?: string;
  // EventBridge
  ruleName?: string;
  ruleDescription?: string;
  etlCron: string;
}

interface CrawlerStates {
  raw: StateCrawler;
  processed: StateCrawler;
}
interface StateCrawler {
  startCrawler: tasks.CallAwsService;
  getCrawler:  tasks.CallAwsService;
  wait: sfn.Wait;
}
const stateSuffix = {
  raw: 'Raw',
  processed: 'Processed',
}

export class Analytics extends Construct {

  constructor(scope: Construct, id: string, props: AnalyticsProps) {
    super(scope, id);

    // ----------------------------------------
    // S3
    // ----------------------------------------

    // 変換データ格納用S3バケット
    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: props.bucketName,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ----------------------------------------
    // Glue
    // ----------------------------------------

    // 生データ用 Glue Database
    const databaseRaw = new glue_alpha.Database(this, 'DatabaseRaw', {
      databaseName: props.databaseRawName,
      description: props.databaseRawDescription,
    });
    
    // 処理済みデータ用 Glue Database
    const databaseProcessed = new glue_alpha.Database(this, 'DatabaseProcessed', {
      databaseName: props.databaseProcessedName,
      description: props.databaseProcessedDescription,
    });

    // Glue Connection 作成
    const connection = new glue_alpha.Connection(this, 'Connection', {
      connectionName: props.connectionName,
      type: glue_alpha.ConnectionType.JDBC,
      securityGroups: props.securityGroups,
      subnet: props.subnet,
      properties: {
        JDBC_CONNECTION_URL: props.jdbcConnectionUrl,
        JDBC_ENFORCE_SSL: 'false',
        SECRET_ID: props.secret.secretName,
      },
    });

    // 生データ用 Glue Crawler Role
    const crawlerRoleRaw = new iam.Role(this, 'CrawlerRoleRaw', {
      roleName: props.roleRawName,
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
      ],
    });
    crawlerRoleRaw.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['logs:*'],
      resources: [`arn:aws:logs:${props.env.region}:${props.env.account}:log-group:/aws-glue/*`],
    }));
    props.secret.grantRead(crawlerRoleRaw);
    props.sourceRds.grantConnect(crawlerRoleRaw, '*');
    
    // 処理済みデータ用 Glue Crawler Role
    const crawlerRoleProcessed = new iam.Role(this, 'CrawlerRoleProcessed', {
      roleName: props.roleProcessedName,
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
      ],
    });
    crawlerRoleProcessed.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['logs:*'],
      resources: [`arn:aws:logs:${props.env.region}:${props.env.account}:log-group:/aws-glue/*`],
    }));
    bucket.grantRead(crawlerRoleProcessed);

    // 生データ用 Glue Crawler
    const crawlerRaw = new glue.CfnCrawler(this, 'CrawlerRaw', {
      name: props.crawlerRawName,
      role: crawlerRoleRaw.roleArn,
      databaseName: databaseRaw.databaseName,
      targets: {
        jdbcTargets: [{
          connectionName: connection.connectionName,
          path: `${props.dbName}/%`,
        }],
      },
    });

    // 処理済みデータ用 Glue Crawler
    const crawlerProcessed = new glue.CfnCrawler(this, 'CrawlerProcessed', {
      name: props.crawlerProcessedName,
      role: crawlerRoleProcessed.roleArn,
      databaseName: databaseProcessed.databaseName,
      targets: {
        s3Targets: [
          {path: bucket.s3UrlForObject()},
        ],
      },
    });

    // ETLジョブ
    const job = new glue_alpha.Job(this, 'Job', {
      jobName: props.jobName,
      description: props.jobDescription,
      sparkUI: {
        enabled: false,
      },
      executable: glue_alpha.JobExecutable.pythonEtl({
        glueVersion: glue_alpha.GlueVersion.V4_0,
        pythonVersion: glue_alpha.PythonVersion.THREE,
        script: glue_alpha.Code.fromAsset(props.codePath),
      }),
      defaultArguments: {
        '--job-bookmark-option': 'job-bookmark-disable',
        '--enable-glue-datacatalog': 'true',
        '--enable-continuous-cloudwatch-log': 'true',
        '--DATABASE_NAME': databaseRaw.databaseName,
        '--TARGET_BUCKET_PATH': bucket.s3UrlForObject(),
      },
      maxConcurrentRuns: 2,
      connections: [connection],
    });
    
    // Glue Job 権限付与
    job.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'));
    props.secret.grantRead(job.role);
    props.sourceRds.grantConnect(job.role, '*');
    bucket.grantReadWrite(job.role);

    // ----------------------------------------
    // CloudWatch Logs
    // ----------------------------------------
    
    // ロググループ 作成
    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ----------------------------------------
    // StepFunctions State
    // ----------------------------------------

    // テーブル取得ステート
    const stateGetTables = new tasks.CallAwsService(this, 'StateGetTables', {
      service: 'glue',
      action: 'getTables',
      parameters: {
        DatabaseName: databaseRaw.databaseName
      },
      iamResources: ['arn:aws:states:::aws-sdk:glue:getTables'],
      resultPath: `$.response.get_tables`
    });
    
    // Mapステート
    const map = new sfn.Map(this, 'Map', {
      itemsPath: `$.response.get_tables.TableList`,
      maxConcurrency: 1,
      outputPath: sfn.JsonPath.DISCARD,
    });

    // ETLジョブ実行ステート
    const stateStartJob = new tasks.GlueStartJobRun(this, 'StateStartJob', {
      glueJobName: job.jobName,
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      arguments: sfn.TaskInput.fromObject({
        '--TABLE_NAME': sfn.JsonPath.stringAt('$.Name'),
      }),
    });
    
    // ETLジョブ実行ステートをMapに組み込む
    const stateEtl = map.itemProcessor(stateStartJob);
    
    // Glue Crawler用ステート（生データ用、処理済みデータ用）
    const statesCrawler: CrawlerStates = {
      raw: this.getCrawlerStates(stateSuffix.raw, crawlerRaw.name!),
      processed: this.getCrawlerStates(stateSuffix.processed, crawlerProcessed.name!),
    }

    // 通過ステート
    const statePass = new sfn.Pass(this, 'StatePass');

    // 失敗ステート
    const stateFail = new sfn.Fail(this, 'StateFail');
    
    // Crawler実行中かどうかの条件
    const conditionRunningOrStopping = sfn.Condition.or(
      sfn.Condition.stringEquals(`$.response.get_crawler.Crawler.State`, 'RUNNING'),
      sfn.Condition.stringEquals(`$.response.get_crawler.Crawler.State`, 'STOPPING'),
    );
    
    // Crawler成功かどうかの条件
    const conditionSucceeded = sfn.Condition.stringEquals(
      `$.response.get_crawler.Crawler.LastCrawl.Status`, 'SUCCEEDED'
    );

    // ステート定義
    const definition = statesCrawler.raw.startCrawler
      .next(statesCrawler.raw.getCrawler)
      .next(
        new sfn.Choice(this, `IsCrawlerRunning?${stateSuffix.raw}`)
        .when(
          conditionRunningOrStopping,
          statesCrawler.raw.wait
            .next(statesCrawler.raw.getCrawler)
        )
        .when(
          conditionSucceeded,
          stateGetTables
        )
        .otherwise(stateFail)
      );
    stateGetTables
      .next(stateEtl)
      .next(statesCrawler.processed.startCrawler)
      .next(statesCrawler.processed.getCrawler)
      .next(
        new sfn.Choice(this, `IsCrawlerRunning?${stateSuffix.processed}`)
        .when(
          conditionRunningOrStopping,
          statesCrawler.processed.wait
            .next(statesCrawler.processed.getCrawler)
        )
        .when(
          conditionSucceeded,
          statePass
        )
        .otherwise(stateFail)
      );

    const definitionBody = sfn.DefinitionBody.fromChainable(definition);

    // ステートマシン 作成
    const stateMachine = new sfn.StateMachine(this, 'StateMachine', {
      stateMachineName: props.stateMachineName,
      definitionBody: definitionBody,
      logs: {
        destination: logGroup,
        level: sfn.LogLevel.ALL
      }, // AwsSolutions-SF1 対応
      tracingEnabled: true, // AwsSolutions-SF2 対応
    });
    
    // State Machine Role 取得
    const stateMachinteRole = stateMachine.role as iam.Role;

    // State Machine Role に追加権限付与
    stateMachinteRole.addToPrincipalPolicy(new iam.PolicyStatement(
      {
        effect: iam.Effect.ALLOW,
        actions: [
          'glue:StartCrawler',
          'glue:GetCrawler',
        ],
        resources: [
          `arn:aws:glue:${props.env.region}:${props.env.account}:crawler/*`,
        ]
      }
    ));
    stateMachinteRole.addToPrincipalPolicy(new iam.PolicyStatement(
      {
        effect: iam.Effect.ALLOW,
        actions: [
          'glue:GetTables',
        ],
        resources: [
          `arn:aws:glue:${props.env.region}:${props.env.account}:*`
        ]
      }
    ));

    // ----------------------------------------
    // EventBridge
    // ----------------------------------------

    // Rule
    const rule = new events.Rule(this, 'Rule', {
      ruleName: props.ruleName,
      description: props.ruleDescription,
      schedule: events.Schedule.expression(props.etlCron),
    });
    
    // ターゲット追加
    const target = new targets.SfnStateMachine(stateMachine);
    rule.addTarget(target);
  }
  
  // Crawler関連ステートを生成し取得する関数
  private getCrawlerStates(suffix: string, crawlerName: string): StateCrawler {
    return {
      // Glue Crawler 実行ステート
      startCrawler: new tasks.CallAwsService(this, `StateStartCrawler${suffix}`, {
        service: 'glue',
        action: 'startCrawler',
        parameters: {
          Name: crawlerName
        },
        iamResources: ['arn:aws:states:::aws-sdk:glue:startCrawler'],
        resultPath: `$.response.start_crawler`,
        inputPath: sfn.JsonPath.DISCARD,
      }),
      // Glue Crawler 状態取得ステート
      getCrawler: new tasks.CallAwsService(this, `StateGetCrawler${suffix}`, {
        service: 'glue',
        action: 'getCrawler',
        parameters: {
          Name: crawlerName
        },
        iamResources: ['arn:aws:states:::aws-sdk:glue:getCrawler'],
        resultPath: `$.response.get_crawler`,
        inputPath: sfn.JsonPath.DISCARD
      }), 
      // 待機ステート
      wait: new sfn.Wait(this, `StateWait${suffix}`, {
        time: sfn.WaitTime.duration(cdk.Duration.seconds(10)),
      }),
    }
  }
}