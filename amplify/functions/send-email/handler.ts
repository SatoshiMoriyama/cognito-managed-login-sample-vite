import type { Schema } from "../../data/resource";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

export const handler: Schema["sendEmail"]["functionHandler"] = async (event) => {
  // 引数から名前とメール送信先を取得
  const { name, email, subject, message } = event.arguments;
  
  // 詳細なイベント情報をログに出力（デバッグ用）
  console.log("イベント全体:", JSON.stringify(event, null, 2));
  console.log("認証情報:", JSON.stringify(event.identity, null, 2));
  
  // リクエスト情報がある場合
  if ('request' in event) {
    console.log("リクエスト情報:", JSON.stringify((event as any).request, null, 2));
  }
  
  // Authorization ヘッダーから ID トークンを抽出
  const authHeader = event.request.headers.authorization || '';
    
  // "Bearer " の部分を除去して ID トークンを取得
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  
  console.log('ID トークン (最初の 20 文字):', idToken.substring(0, 20) + '...');
  console.log("IDトークン:", idToken ? "取得済み" : "なし");
  
  try {
    // メールの送信先が提供されている場合のみメール送信を試みる
    if (email) {
      // 文字列型に確実に変換
      const safeSubject = subject || "挨拶メール";
      const safeMessage = message || `こんにちは、${name}さん！このメールはCognitoアプリからのテスト送信です。`;
      
      // SESクライアントを初期化
      let sesClient: SESClient;
      
      if (idToken) {
        try {
          // Cognitoの認証情報から一時的なIAMロールの認証情報を取得
          const credentials = fromCognitoIdentityPool({
            clientConfig: { region: "ap-northeast-1" },
            identityPoolId: "ap-northeast-1:7c50cda8-c55b-43a7-be1b-13d25e04060e",
            logins: {
              "cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_NN5Ct2qua": idToken
            }
          });

          console.log("idtoken2:"+idToken);
          sesClient = new SESClient({ 
            region: "ap-northeast-1",
            credentials
          });
          
        } catch (credError) {
          console.error("認証情報の取得に失敗:", credError);
          // 失敗した場合は、デフォルトの認証情報を使用
          sesClient = new SESClient({ region: "ap-northeast-1" });
          console.log("デフォルトの認証情報を使用してSESクライアントを初期化します");
        }
      } else {
        // IDトークンがない場合は、デフォルトの認証情報を使用
        sesClient = new SESClient({ region: "ap-northeast-1" });
        console.log("IDトークンがないため、デフォルトの認証情報を使用します");
      }
      
      // メール送信パラメータの設定
      const params = {
        Source: "no-reply@chelky.click", // 検証済みのメールアドレス
        Destination: {
          ToAddresses: [email], // 送信先メールアドレス
        },
        Message: {
          Subject: {
            Data: safeSubject,
            Charset: "UTF-8",
          },
          Body: {
            Text: {
              Data: safeMessage,
              Charset: "UTF-8",
            },
            Html: {
              Data: `<h1>こんにちは、${name}さん！</h1><p>${safeMessage}</p>`,
              Charset: "UTF-8",
            },
          },
        },
      };

      console.log("メール送信パラメータ:", params);

      // メール送信コマンドの実行
      const command = new SendEmailCommand(params);
      const response = await sesClient.send(command);
      
      console.log(`メール送信成功: ${email}宛にメールを送信しました。`, response);
      return `${name}さん宛（${email}）にメールを送信しました。メッセージID: ${response.MessageId}`;
    } else {
      return `メール送信には email パラメータが必要です`;
    }
  } catch (error) {
    console.error("メール送信エラー:", error);
    // エラーオブジェクトを適切に処理
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `エラー: メールを送信できませんでした - ${errorMessage}`;
  }
}