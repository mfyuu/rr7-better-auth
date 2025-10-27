import { createApp, createConfig, } from '../lib/config.js';
import { AccountBaseStack, } from '../lib/stack/app.js';


const app = createApp();
const config = createConfig(app,);


const appStack = new AccountBaseStack(app, 'App', config,);
