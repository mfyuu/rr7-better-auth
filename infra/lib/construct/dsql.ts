import { CfnCluster } from 'aws-cdk-lib/aws-dsql';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface DsqlProps {
  suffix: string;
}

export class Dsql extends Construct {
  public readonly cluster: CfnCluster;

  constructor(scope: Construct, id: string, props: DsqlProps) {
    super(scope, id);

    this.cluster = new CfnCluster(this, 'DsqlCluster', {
    });

    // SSM Parameter Storeに接続情報を出力
    new StringParameter(this, 'DsqlEndpoint', {
      parameterName: `/rr7-better-auth/dsql/endpoint`,
      stringValue: 'TBD', // デプロイ後に手動で更新が必要
      description: 'Amazon DSQL cluster endpoint',
    });

    new StringParameter(this, 'DsqlPort', {
      parameterName: `/rr7-better-auth/dsql/port`,
      stringValue: '5432',
      description: 'Amazon DSQL cluster port',
    });

    new StringParameter(this, 'DsqlDatabase', {
      parameterName: `/rr7-better-auth/dsql/database`,
      stringValue: 'postgres',
      description: 'Amazon DSQL default database',
    });

    new StringParameter(this, 'DsqlClusterArn', {
      parameterName: `/rr7-better-auth/dsql/cluster-arn`,
      stringValue: this.cluster.ref,
      description: 'Amazon DSQL cluster ARN',
    });
  }
}
