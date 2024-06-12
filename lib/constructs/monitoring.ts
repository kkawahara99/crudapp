
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

export interface MonitoringProps {
  topicName?: string;
  displayName?: string;
  email: string;
  ruleName?: string;
  ruleDescription?: string;
  eventPattern: events.EventPattern;
  serviceName: string;
}

export class Monitoring extends Construct {

  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);

    // トピック
    const topic = new sns.Topic(this, 'Topic', {
      topicName: props.topicName,
      displayName: props.displayName,
    });
    
    // サブスクリプション追加
    topic.addSubscription(new subs.EmailSubscription(props.email));

    // Rule
    const rule = new events.Rule(this, 'Rule', {
      ruleName: props.ruleName,
      description: props.ruleDescription,
      eventPattern: props.eventPattern
    });
    
    // ターゲットにトピックを設定
    rule.addTarget(new targets.SnsTopic(topic, {
      message: events.RuleTargetInput.fromMultilineText(
`== AWS Step Funtions '${events.EventField.fromPath('$.detail.status')}'==
AWSアカウントID: '${events.EventField.fromPath('$.account')}'
リージョン: '${events.EventField.fromPath('$.region')}'
発生時刻: '${events.EventField.fromPath('$.time')}'
サービス: '${events.EventField.fromPath('$.source')}'
内容: '${events.EventField.fromPath('$.detail-type')}'
リソース: '${events.EventField.fromPath('$.resources')}'
(詳細は${props.serviceName}画面から確認すること)
====`
      )
    }));
  }
}