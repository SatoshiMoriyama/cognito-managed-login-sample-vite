// AWS Cognitoの設定
export interface CognitoConfig {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  oauth: {
    domain: string;
    scope: string[];
    redirectSignIn: string;
    redirectSignOut: string;
    responseType: string;
  };
}

export interface AppConfig {
  cognito: CognitoConfig;
}

const config: AppConfig = {
  cognito: {
    region: import.meta.env.VITE_REGION,
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_WEB_CLIENT_ID,
    oauth: {
      domain: import.meta.env.VITE_COGNITO_DOMAIN,
      scope: ['email', 'openid', 'aws.cognito.signin.user.admin', 'profile'],
      redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN,
      redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT,
      responseType: 'code' // authorization codeグラントタイプを使用
    }
  }
};

export default config;