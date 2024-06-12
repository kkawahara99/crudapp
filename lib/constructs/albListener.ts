import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

export interface AlbListenerProps {
  alb: elbv2.ApplicationLoadBalancer;
  serviceBack: ecs.FargateService;
  serviceFront: ecs.FargateService;
  certificateArn: string;
}

export class AlbListener extends Construct {

  constructor(scope: Construct, id: string, props: AlbListenerProps) {
    super(scope, id);
    
    // リスナー
    const listener = props.alb.addListener('Listener', {
      port: 80,
    });

    // HTTPS リスナー
    const httpsListener = props.alb.addListener('HttpsListener', {
      port: 443,
      certificates: [
        {
          certificateArn: props.certificateArn,
        },
      ],
    });

    // HTTP から HTTPS へのリダイレクト
    listener.addAction('Redirect', {
      action: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    });
  
    // ターゲット（バックエンド）
    httpsListener.addTargets('TgBackend', {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [props.serviceBack],
      priority: 10,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/api/*']),
      ],
      healthCheck: {
        path: "/api",
        protocol: elbv2.Protocol.HTTP,
      },
    });
    
    // ターゲット（フロントエンド）
    httpsListener.addTargets('TgFrontend', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [props.serviceFront],
      healthCheck: {
        path: "/",
        protocol: elbv2.Protocol.HTTP,
      },
    });
  }
}