import { DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion, StorageType, ParameterGroup } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Vpc, SubnetType, SecurityGroup, InstanceType, InstanceClass, InstanceSize } from 'aws-cdk-lib/aws-ec2';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface RdsProps {
  vpc: Vpc;
  rdsSecurityGroup: SecurityGroup;
  removalPolicy: RemovalPolicy;
  suffix: string;
}

export class Rds extends Construct {
  public readonly database: DatabaseInstance;
  public readonly secret: Secret;

  constructor(scope: Construct, id: string, props: RdsProps) {
    super(scope, id);

    // PostgreSQL用のカスタムパラメータグループ
    const parameterGroup = new ParameterGroup(this, 'PostgresParameterGroup', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_16,
      }),
      description: 'Custom parameter group for PostgreSQL 16',
      parameters: {
        // SSL接続を無効化（SSMトンネル経由のため）
        'rds.force_ssl': '0',
        // 認証方法を設定
        'shared_preload_libraries': 'pg_stat_statements',
      },
    });

    // Secrets Manager（DB認証情報）
    this.secret = new Secret(this, 'DatabaseSecret', {
      description: 'RDS PostgreSQL credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'better_auth' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\\'',
      },
    });

    // RDS PostgreSQL 16インスタンス
    this.database = new DatabaseInstance(this, 'Database', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_16,
      }),
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [props.rdsSecurityGroup],
      parameterGroup: parameterGroup, // カスタムパラメータグループを適用
      credentials: {
        username: 'better_auth',
        password: this.secret.secretValueFromJson('password'),
      },
      databaseName: 'better_auth',
      allocatedStorage: 20,
      storageType: StorageType.GP3,
      backupRetention: Duration.days(0), // バックアップ無効
      deleteAutomatedBackups: true,
      deletionProtection: false, // 開発環境のため削除保護無効
      removalPolicy: props.removalPolicy,
    });

    // SSM Parameter Storeに接続情報を出力
    new StringParameter(this, 'DatabaseEndpoint', {
      parameterName: `/rr7-better-auth/database/endpoint`,
      stringValue: this.database.instanceEndpoint.hostname,
      description: 'RDS PostgreSQL endpoint',
    });

    new StringParameter(this, 'DatabasePort', {
      parameterName: `/rr7-better-auth/database/port`,
      stringValue: this.database.instanceEndpoint.port.toString(),
      description: 'RDS PostgreSQL port',
    });

    new StringParameter(this, 'DatabaseName', {
      parameterName: `/rr7-better-auth/database/name`,
      stringValue: 'better_auth',
      description: 'RDS PostgreSQL database name',
    });

    new StringParameter(this, 'SecretArn', {
      parameterName: `/rr7-better-auth/database/secret-arn`,
      stringValue: this.secret.secretArn,
      description: 'RDS PostgreSQL secret ARN',
    });
  }
}
