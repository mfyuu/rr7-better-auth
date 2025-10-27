import { Instance, InstanceClass, InstanceSize, InstanceType, MachineImage, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { idToName } from '../config.js';

export interface BastionProps {
  vpc: Vpc;
  bastionSecurityGroup: SecurityGroup;
  rdsSecurityGroup: SecurityGroup;
  stackName?: string;
  suffix: string;
}

export class Bastion extends Construct {
  public readonly instance: Instance;
  public readonly securityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props: BastionProps) {
    super(scope, id);

    // SSM Session Manager用のIAM Role
    const ssmRole = new Role(this, 'SSMRole', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // 追加のSSM権限を付与
    ssmRole.addToPolicy(new PolicyStatement({
      effect: 'Allow',
      actions: [
        'ssm:UpdateInstanceInformation',
        'ssmmessages:CreateControlChannel',
        'ssmmessages:CreateDataChannel',
        'ssmmessages:OpenControlChannel',
        'ssmmessages:OpenDataChannel',
      ],
      resources: ['*'],
    }));

    // 既存のSecurity Groupを使用
    this.securityGroup = props.bastionSecurityGroup;

    // Bastion EC2インスタンス
    this.instance = new Instance(this, 'BastionInstance', {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: props.vpc.publicSubnets[0].subnetType,
      },
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.NANO), // x86_64アーキテクチャに変更
      machineImage: MachineImage.latestAmazonLinux2023(),
      securityGroup: this.securityGroup,
      role: ssmRole,
      instanceName: idToName('bastion', { suffix: props.suffix }),
    });
  }
}
