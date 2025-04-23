import type { Schema } from "../../data/resource";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

export const handler: Schema["sendEmail"]["functionHandler"] = async (event) => {
  const { name, email, subject, message } = event.arguments;
  
  const authHeader = event.request.headers.authorization || '';    
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  try {
    if (email) {
      const safeSubject = subject || "挨拶メール";
      const safeMessage = message || `こんにちは、${name}さん！このメールはCognitoアプリからのテスト送信です。`;
      
      let sesClient: SESClient;      
      if (idToken) {
        try {
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
          sesClient = new SESClient({ region: "ap-northeast-1" });
          console.log("デフォルトの認証情報を使用してSESクライアントを初期化します");
        }
      } else {
        sesClient = new SESClient({ region: "ap-northeast-1" });
        console.log("IDトークンがないため、デフォルトの認証情報を使用します");
      }
      
      const params = {
        Source: "no-reply@chelky.click",
        Destination: {
          ToAddresses: [email],
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