import { Stack, type StackProps } from 'aws-cdk-lib';
import type { Construct, } from 'constructs';
import { idToName, type Config, } from '../config.js';
import { Dsql } from '../construct/dsql.js';


type AccountBaseStackProps = StackProps & Config;


export class AccountBaseStack extends Stack {

  public readonly dsql: Dsql;

  public constructor(scope: Construct, id: string, props: AccountBaseStackProps,) {
    super(scope, id, {
      stackName: props.stackName ?? idToName(id, props,),
      ...props, // 'props' last to allow overrides of defaults defined above
    },);

    // Amazon DSQLクラスター
    this.dsql = new Dsql(this, 'Dsql', {
      suffix: props.suffix,
    });
  }
}
