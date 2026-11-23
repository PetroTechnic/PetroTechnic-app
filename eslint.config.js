import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'backend-rust/**/*'],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];
