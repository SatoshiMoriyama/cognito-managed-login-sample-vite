import React, { useState } from 'react';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ConfirmSignUpProps {
  username: string;
  onSuccess?: () => void;
}

function ConfirmSignUp({ username, onSuccess }: ConfirmSignUpProps) {
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // 確認コードの検証
  const handleConfirmSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 前回のメッセージをクリア
    setError('');
    setSuccess('');
    
    // 入力検証
    if (!confirmationCode.trim()) {
      setError('確認コードを入力してください');
      return;
    }
    
    setLoading(true);
    
    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username,
        confirmationCode
      });
      
      console.log('確認結果:', { isSignUpComplete, nextStep });
      
      if (isSignUpComplete) {
        setSuccess(`ユーザー「${username}」の確認が完了しました`);
        setConfirmationCode('');
        // 親コンポーネントに成功を通知
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // 追加のステップが必要な場合
        setSuccess(`次のステップ: ${nextStep.signUpStep}`);
      }
    } catch (err: any) {
      console.error('確認エラー:', err);
      setError(`確認に失敗しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 確認コードの再送信
  const handleResendCode = async () => {
    // 前回のメッセージをクリア
    setError('');
    setSuccess('');
    
    setResending(true);
    
    try {
      const { destination, deliveryMedium, attributeName } = await resendSignUpCode({
        username
      });
      
      console.log('コード再送信結果:', { destination, deliveryMedium, attributeName });
      
      setSuccess(`確認コードを${deliveryMedium === 'EMAIL' ? 'メール' : '電話'}で再送信しました。${destination}を確認してください。`);
    } catch (err: any) {
      console.error('コード再送信エラー:', err);
      setError(`確認コードの再送信に失敗しました: ${err.message}`);
    } finally {
      setResending(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mt: 4 }}>
      <Typography variant="h5" gutterBottom align="center">
        <VerifiedUserIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        アカウント確認
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        {username} に送信された確認コードを入力してください。
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleConfirmSignUp} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="confirmationCode"
          label="確認コード"
          name="confirmationCode"
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
          disabled={loading}
          helperText="メールに送信された6桁のコードを入力してください"
        />
        
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VerifiedUserIcon />}
          >
            {loading ? '処理中...' : 'アカウントを確認'}
          </Button>
          
          <Button
            type="button"
            variant="outlined"
            onClick={handleResendCode}
            disabled={resending}
            startIcon={resending ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          >
            {resending ? '送信中...' : 'コードを再送信'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

export default ConfirmSignUp;