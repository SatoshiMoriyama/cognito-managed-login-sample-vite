import React, { useState } from 'react';
import { signUp } from 'aws-amplify/auth';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// 確認コードコンポーネントのインポート
import ConfirmSignUp from './ConfirmSignUp';

function CreateUser() {
  // フォーム入力状態
  const [email, setEmail] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [createdUser, setCreatedUser] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  
  // パスワードの表示切替
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // フォーム入力検証
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('メールアドレスを入力してください');
      return false;
    }
    if (!email.includes('@')) {
      setError('有効なメールアドレスを入力してください');
      return false;
    }
    if (!displayName.trim()) {
      setError('表示名を入力してください');
      return false;
    }
    if (!password.trim() || password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return false;
    }
    return true;
  };

  // ユーザー作成処理
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 前回のメッセージをクリア
    setError('');
    setSuccess('');
    
    // 入力検証
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // メールアドレスをユーザー名として使用
      const username = email;
      
      // Amplify v6 の signUp APIを使用
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
            name: displayName,
            'custom:isAdmin': isAdmin ? 'true' : 'false',
            'custom:tenant_id': 'wellnet',
          },
          autoSignIn: false
        }
      });
      
      console.log('サインアップ結果:', { isSignUpComplete, userId, nextStep });
      
      if (isSignUpComplete) {
        // 完全に完了した場合
        setSuccess(`ユーザー「${username}」を作成しました`);
        // フォームをリセット
        setEmail('');
        setDisplayName('');
        setPassword('');
        setIsAdmin(false);
      } else {
        // 確認コードが必要な場合
        console.log('確認コードが必要です:', nextStep);
        setCreatedUser(username);
        setShowConfirmation(true);
        setSuccess(`ユーザー「${username}」を作成しました。確認コードを入力してください。`);
      }
    } catch (err: any) {
      console.error('ユーザー作成エラー:', err);
      setError(`ユーザー作成に失敗しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 確認コード入力後の処理
  const handleConfirmationSuccess = () => {
    // 確認完了後の処理
    setShowConfirmation(false);
    setCreatedUser(null);
    setSuccess('ユーザーの確認が完了しました。このユーザーはこれでログイン可能になりました。');
    // 入力フォームをリセット
    setEmail('');
    setDisplayName('');
    setPassword('');
    setIsAdmin(false);
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mt: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          新規ユーザー作成
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          メールアドレスをユーザー名として使用して新規アカウントを作成します。
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
        
        {!showConfirmation ? (
          <Box component="form" onSubmit={handleCreateUser} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              helperText="このメールアドレスがユーザー名として使用されます"
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="displayName"
              label="表示名"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
              helperText="ユーザーの表示名を入力してください"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  name="isAdmin"
                  color="primary"
                  disabled={loading}
                />
              }
              label="管理者権限を付与する"
              sx={{ mt: 2, mb: 1 }}
            />
            
            <FormControl 
              variant="outlined" 
              fullWidth 
              margin="normal"
              required
            >
              <InputLabel htmlFor="password">パスワード</InputLabel>
              <OutlinedInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="パスワード"
              />
              <FormHelperText>パスワードは8文字以上必要です</FormHelperText>
            </FormControl>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
            >
              {loading ? '処理中...' : 'ユーザーを作成'}
            </Button>
          </Box>
        ) : null}
      </Paper>

      {/* 確認コード入力コンポーネント */}
      {showConfirmation && createdUser && (
        <ConfirmSignUp 
          username={createdUser} 
          onSuccess={handleConfirmationSuccess} 
        />
      )}
    </>
  );
}

export default CreateUser;