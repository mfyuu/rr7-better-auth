import { Vpc, SubnetType, SecurityGroup, Port, InterfaceVpcEndpoint, InterfaceVpcEndpointAwsService } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface VpcProps {
  // 必要に応じて設定を追加
}

export class VpcConstruct extends Construct {
  public readonly vpc: Vpc;
  public readonly rdsSecurityGroup: SecurityGroup;
  public readonly bastionSecurityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props: VpcProps = {}) {
    super(scope, id);

    // VPC作成（2AZ、パブリック/プライベートサブネット）
    this.vpc = new Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0, // コスト削減のためNAT Gatewayなし
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // RDS用Security Group
    this.rdsSecurityGroup = new SecurityGroup(this, 'RdsSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for RDS PostgreSQL',
      allowAllOutbound: false,
    });

    // Bastion用Security Group
    this.bastionSecurityGroup = new SecurityGroup(this, 'BastionSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Bastion host',
      allowAllOutbound: true,
    });

    // RDSへの接続を許可（Bastionからのみ）
    this.rdsSecurityGroup.addIngressRule(
      this.bastionSecurityGroup,
      Port.tcp(5432),
      'Allow PostgreSQL access from Bastion'
    );

    // SSM用のVPCエンドポイントを追加（NAT GatewayなしでSSM接続を可能にする）
    new InterfaceVpcEndpoint(this, 'SSMEndpoint', {
      vpc: this.vpc,
      service: InterfaceVpcEndpointAwsService.SSM,
      subnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    new InterfaceVpcEndpoint(this, 'SSMMessagesEndpoint', {
      vpc: this.vpc,
      service: InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      subnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    // EC2メタデータサービス用のエンドポイント（SSMエージェントがインスタンス情報を取得するため）
    new InterfaceVpcEndpoint(this, 'EC2Endpoint', {
      vpc: this.vpc,
      service: InterfaceVpcEndpointAwsService.EC2,
      subnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
    });
  }
}
