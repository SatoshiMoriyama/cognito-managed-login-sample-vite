# Cognito Simple Authentication - Vite + TypeScript版

このプロジェクトは、AWS Cognitoを使用した認証システムの実装サンプルです。元々Create React App (CRA)で作成されたプロジェクトをViteに移行し、さらにTypeScriptに対応させています。

## 機能

- AWS Cognitoを使用したマネージドログイン
- ユーザー情報の表示
- 管理者ユーザーによる新規ユーザー作成機能
- ユーザー確認機能

## 技術スタック

- React 18
- TypeScript
- Vite
- AWS Amplify (v6)
- Material-UI (MUI v5)

## セットアップ方法

1. リポジトリをクローン
```bash
git clone [リポジトリURL]
cd cognito-simple-vite
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
`.env.sample`を`.env`にコピーして必要な値を設定してください。

```
VITE_REGION=ap-northeast-1
VITE_USER_POOL_ID=ap-northeast-1_xxxxxxxxx
VITE_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=your-domain-prefix.auth.ap-northeast-1.amazoncognito.com
VITE_REDIRECT_SIGN_IN=http://localhost:3000/
VITE_REDIRECT_SIGN_OUT=http://localhost:3000/
```

4. 開発サーバーを起動
```bash
npm run dev
```

5. ビルド
```bash
npm run build
```

## CRAからViteへの移行について

このプロジェクトは元々Create React App (CRA)で作成されたものをViteに移行し、さらにTypeScriptに対応させました。主な変更点は以下の通りです：

1. 環境変数のプレフィックスを`REACT_APP_`から`VITE_`に変更
2. 環境変数の参照方法を`process.env.REACT_APP_*`から`import.meta.env.VITE_*`に変更
3. JSファイルの拡張子を`.js`から`.jsx`、そして`.tsx`に変更
4. エントリーポイントを`index.js`から`main.tsx`に変更
5. TypeScriptの型定義を追加

## AWS Cognitoの設定

このアプリケーションを動作させるには、AWS Cognitoユーザープールとアプリクライアントを設定する必要があります。詳しい設定方法はAWSのドキュメントを参照してください。

## ライセンス

[ライセンス情報]