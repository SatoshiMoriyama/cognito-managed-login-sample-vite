import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';
import outputs from "../amplify_outputs.json";
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

// Amplify設定
Amplify.configure(outputs);

// IDトークンを使用するカスタムクライアントを作成する関数
export const createCustomClient = async () => {
  try {
    // 認証セッションを取得
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    
    if (!idToken) {
      throw new Error('IDトークンが見つかりません');
    }
    
    // OIDCモードでクライアントを生成し、IDトークンを認証トークンとして設定
    const client = generateClient({
      authMode: 'oidc',  // カスタム認証モード
      authToken: idToken // IDトークンを使用
    });
    
    console.log('IDトークンを使用するカスタムクライアントを作成しました');
    return client;
  } catch (error) {
    console.error('カスタムクライアントの作成に失敗しました:', error);
    throw error;
  }
};

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);