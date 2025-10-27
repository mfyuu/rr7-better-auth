import { Stack, type StackProps } from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { Construct, } from 'constructs';
import { idToName, type Config, } from '../config.js';
import { VpcConstruct } from '../construct/vpc.js';
import { Bastion } from '../construct/bastion.js';
import { Rds } from '../construct/rds.js';


type AccountBaseStackProps = StackProps & Config;


export class AccountBaseStack extends Stack {

  public readonly vpcConstruct: VpcConstruct;
  public readonly rds: Rds;
  public readonly bastion: Bastion;

  public constructor(scope: Construct, id: string, props: AccountBaseStackProps,) {
    super(scope, id, {
      stackName: props.stackName ?? idToName(id, props,),
      ...props, // 'props' last to allow overrides of defaults defined above
    },);

    // VPC Construct
    this.vpcConstruct = new VpcConstruct(this, 'Vpc');

    // Bastion EC2インスタンス
    this.bastion = new Bastion(this, 'Bastion', {
      vpc: this.vpcConstruct.vpc,
      bastionSecurityGroup: this.vpcConstruct.bastionSecurityGroup,
      rdsSecurityGroup: this.vpcConstruct.rdsSecurityGroup,
      stackName: props.stackName,
      suffix: props.suffix,
    });

    // RDS Construct
    this.rds = new Rds(this, 'Rds', {
      vpc: this.vpcConstruct.vpc,
      rdsSecurityGroup: this.vpcConstruct.rdsSecurityGroup,
      removalPolicy: props.removalPolicy,
      suffix: props.suffix,
    });

    new StringParameter(this, 'BastionInstanceId', {
      parameterName: `/rr7-better-auth/bastion/instance-id`,
      stringValue: this.bastion.instance.instanceId,
      description: 'Bastion EC2 instance ID',
    });
  }
}
