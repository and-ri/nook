// Hermes ships Intl.NumberFormat/DateTimeFormat but NOT Intl.PluralRules, which
// use-intl needs for ICU plural messages (e.g. Team.memberCount). Polyfill it
// before anything renders. The polyfill no-ops if the runtime already has it.
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/uk';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
