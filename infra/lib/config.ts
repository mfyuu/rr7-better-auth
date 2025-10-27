import { App, RemovalPolicy, Tags, type Environment, } from 'aws-cdk-lib';
import { RetentionDays, } from 'aws-cdk-lib/aws-logs';
import pkg from '../../package.json';
import { toKebabCase, } from './util.js';

const { name, } = pkg;
const project = name.slice(0, name.indexOf('-',),);
const group = name.slice(0, name.indexOf('-', project.length + 1,),);

const accounts = {
  dev: 'TBD',
  prd: 'TBD',
};


const context = <T extends string,> (app: App, key: string, defaultValue: T,): T => app.node.tryGetContext(key,) ?? defaultValue; // eslint-disable-line @typescript-eslint/no-unsafe-return -- 'cuz context from cli args
const stage = (app: App,): string => context(app, 'stage', 'poc',);

const idToName = (id: string, props: Config,): string => `${toKebabCase(name,)}-${toKebabCase(id,)}${props.suffix}`;


const createApp = (): App => {
  const app = new App();
  Tags.of(app,).add('project', group,);
  Tags.of(app,).add('service', name,);
  return app;
};

const createConfig = (app: App,): Config => ((): Config => {
  switch (stage(app,)) {
    case 'dev': return dev(app,);
    case 'qas': return qas(app,);
    case 'prd': return prd(app,);
    default:
      return def(app,);
  }
})();


type LogLevel = 'DEBUG' | 'INFO';

interface Config {
  env: Environment;
  suffix: string;
  terminationProtection: boolean;
  removalPolicy: RemovalPolicy;
  logLevel: LogLevel;
  logRetentionInDays: RetentionDays;
}

const def = (app: App,): Config => ({
  env: {
    account: context(app, 'account', accounts.dev,),
    region: context(app, 'region', 'us-east-1',),
  },
  suffix: `-${stage(app,)}`,
  terminationProtection: false,
  removalPolicy: RemovalPolicy.DESTROY,
  logLevel: 'DEBUG',
  logRetentionInDays: RetentionDays.ONE_DAY,
});

const dev = (app: App,): Config => ({
  env: {
    account: context(app, 'account', accounts.dev,),
    region: context(app, 'region', 'us-east-1',),
  },
  suffix: '-dev',
  terminationProtection: true,
  removalPolicy: RemovalPolicy.RETAIN,
  logLevel: 'DEBUG',
  logRetentionInDays: RetentionDays.ONE_WEEK,
});

const qas = (app: App,): Config => ({
  env: {
    account: context(app, 'account', accounts.dev,),
    region: context(app, 'region', 'us-west-2',),
  },
  suffix: '-qas',
  terminationProtection: true,
  removalPolicy: RemovalPolicy.RETAIN,
  logLevel: 'DEBUG',
  logRetentionInDays: RetentionDays.ONE_MONTH,
});

const prd = (app: App,): Config => ({
  env: {
    account: context(app, 'account', accounts.prd,),
    region: context(app, 'region', 'us-west-2',),
  },
  suffix: '',
  terminationProtection: true,
  removalPolicy: RemovalPolicy.RETAIN,
  logLevel: 'INFO',
  logRetentionInDays: RetentionDays.THIRTEEN_MONTHS,
});


export type { Config, LogLevel, };
export { createApp, createConfig, idToName, };
