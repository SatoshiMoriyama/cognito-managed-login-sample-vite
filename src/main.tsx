import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';
import config from './config';

// Amplify設定
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: config.cognito.userPoolId,
      userPoolClientId: config.cognito.userPoolWebClientId,
      loginWith: {
        oauth: {
          domain: config.cognito.oauth.domain,
          scopes: config.cognito.oauth.scope,
          redirectSignIn: [config.cognito.oauth.redirectSignIn],
          redirectSignOut: [config.cognito.oauth.redirectSignOut],
          responseType: config.cognito.oauth.responseType
        }
      }
    }
  }
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);