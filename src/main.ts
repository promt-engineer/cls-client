import 'core-js/es';

import { FSM } from '@base/fsm/sources/FSM';
import { initFetchReplacer } from 'gh-client-base';
import './styles/style.scss';
import packageJson from '../package.json';

const title = `Cleo's Riches FlexiWays v${packageJson.version}`;

console.log(title);

document.title = title;

initFetchReplacer();

FSM.$instance.setCurrentState('Start');
