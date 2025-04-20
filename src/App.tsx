import React, { useState, useEffect } from 'react';
import { signInWithRedirect, signOut, getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { 
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Tabs,
  Tab
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// 新規ユーザー作成コンポーネントのインポート
import CreateUser from './CreateUser';
// 管理者判定ヘルパーのインポート
import { isAdmin, User, UserAttributes } from './isAdmin';

import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

// カスタムテーマの作成
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// Tokenの型定義
interface Tokens {
  idToken: {
    toString: () => string;
  };
  accessToken: any;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  async function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") })
  }

  // 認証状態をチェックする
  useEffect(() => {
    try{
      client.models.Todo.observeQuery().subscribe({
        next: (data) => setTodos([...data.items]),
      });        
    } catch (attrError) {
      console.error('dataの取得に失敗:', attrError);
    }    
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      console.log('currentUser:', currentUser);      
      try {
        const attributes = await fetchUserAttributes();
        const session = await fetchAuthSession();
        
        const userData: User = { 
          username: currentUser.username,
          attributes: attributes as UserAttributes
        };
        
        setUser(userData);
        
        // 管理者かどうかチェック
        setIsUserAdmin(isAdmin(userData));
        
        // トークン情報を保存
        if (session && session.tokens) {
          setTokens({
            idToken: session.tokens.idToken,
            accessToken: session.tokens.accessToken
          });
        }
        setIsAuthenticated(true);
      } catch (attrError) {
        console.error('属性の取得に失敗:', attrError);
        setUser({ username: currentUser.username, attributes: {} });
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.log('未認証状態です - ログインが必要です');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  // URLパラメータを確認し、エラーがあれば表示
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const errorDescription = queryParams.get('error_description');
    const error = queryParams.get('error');
    
    if (error) {
      setError(`認証エラー: ${error} (${errorDescription || '詳細不明'})`);
      console.error('認証エラー:', error, errorDescription);
    }
  }, []);

  // マネージドログインにリダイレクト
  async function handleSignIn() {
    try {
      console.log('マネージドログインへリダイレクトを開始します...');
      
      // エラーをクリア
      setError('');
      
      // リダイレクトを実行
      await signInWithRedirect({
        options:{
          lang : "ja"
        }
      });
    } catch (err: any) {
      console.error('サインインリダイレクトエラー:', err);
      setError(`サインインエラー: ${err.message}`);
    }
  }

  // サインアウト処理
  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsUserAdmin(false);
      console.log('サインアウト成功');
    } catch (err: any) {
      console.error('サインアウトエラー:', err);
      setError(`サインアウトエラー: ${err.message}`);
    }
  }

  // タブ切り替え処理
  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            読み込み中...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box py={4}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            マネージドログインサンプル
          </Typography>
          <Divider sx={{ mb: 4 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {!isAuthenticated ? (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Box textAlign="center">
                <Typography variant="h5" gutterBottom>
                  認証が必要です
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LoginIcon />}
                  onClick={handleSignIn}
                  sx={{ mt: 2, mb: 4 }}
                >
                  Cognitoでサインイン
                </Button>
                
                <Card variant="outlined" sx={{ mt: 3, bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      設定情報（開発用）
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Region"
                          secondary={import.meta.env.VITE_REGION || '未設定'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="User Pool ID"
                          secondary={import.meta.env.VITE_USER_POOL_ID ? '設定済み' : '未設定'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Client ID"
                          secondary={import.meta.env.VITE_USER_POOL_WEB_CLIENT_ID ? '設定済み' : '未設定'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Domain"
                          secondary={import.meta.env.VITE_COGNITO_DOMAIN ? '設定済み' : '未設定'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Redirect URL"
                          secondary={import.meta.env.VITE_REDIRECT_SIGN_IN || '未設定'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          ) : (
            <>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box textAlign="center">
                  <Typography variant="h5" gutterBottom>
                    ようこそ！{isUserAdmin && ' (管理者ユーザー)'}
                  </Typography>
                  
                  {/* タブナビゲーション - 管理者のみユーザー作成タブ表示 */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs 
                      value={activeTab} 
                      onChange={handleChangeTab} 
                      centered
                    >
                      <Tab label="ユーザー情報" icon={<AccountCircleIcon />} iconPosition="start" />
                      {isUserAdmin && (
                        <Tab label="ユーザー作成" icon={<PersonAddIcon />} iconPosition="start" />
                      )}
                    </Tabs>
                  </Box>
                  
                  {/* タブコンテンツ */}
                  {activeTab === 0 && (
                    <Card sx={{ mt: 3, mb: 4, textAlign: 'left' }}>
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom>
                          <AccountCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          ユーザー情報
                        </Typography>
                        <List>
                          {/* ユーザーIDは常に表示 */}
                          <ListItem>
                            <ListItemText
                              primary="ユーザーID"
                              secondary={user?.username}
                            />
                          </ListItem>
                          
                          {/* ユーザー種別の表示 */}
                          <ListItem>
                            <ListItemText
                              primary="ユーザー種別"
                              secondary={isUserAdmin ? '管理者' : '一般ユーザー'}
                            />
                          </ListItem>
                          
                          {/* 全ての属性を動的に表示 */}
                          <ListItem>
                            <ListItemText
                              primary="属性情報"
                            />
                          </ListItem>
                          
                          {/* 属性を動的に一覧表示 */}
                          {user?.attributes && Object.entries(user.attributes).map(([key, value]) => (
                            <ListItem key={key} sx={{ pl: 4 }}>
                              <ListItemText
                                primary={key}
                                secondary={value}
                              />
                            </ListItem>
                          ))}
                        </List>
                        
                        <Box mt={2}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                           Data
                          </Typography>
                          <button onClick={createTodo}>+ new</button>
                          <ul>
                            {todos.map((todo) => (
                              <li onClick={() => deleteTodo(todo.id)}
                              key={todo.id}>{todo.content}</li>
                            ))}
                          </ul>
                        </Box>

                        {tokens && (
                          <Box mt={2}>
                            <Typography variant="subtitle1" color="primary" gutterBottom>
                              認証トークン
                            </Typography>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => setShowToken(!showToken)}
                              sx={{ mb: 1 }}
                            >
                              {showToken ? 'トークンを隠す' : 'IDトークンを表示'}
                            </Button>
                            
                            {showToken && (
                              <Box 
                                sx={{ 
                                  mt: 1, 
                                  p: 2, 
                                  bgcolor: '#f0f0f0', 
                                  borderRadius: 1,
                                  overflowX: 'auto',
                                  fontSize: '0.75rem'
                                }}
                              >
                                <Typography variant="caption" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                  ID Token:
                                </Typography>
                                <Box component="pre" sx={{ m: 0, wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                                  {tokens.idToken.toString()}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* 管理者用ユーザー作成タブ */}
                  {activeTab === 1 && isUserAdmin && <CreateUser />}
                  
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<LogoutIcon />}
                    onClick={handleSignOut}
                  >
                    サインアウト
                  </Button>
                </Box>
              </Paper>
              
              {/* 管理者以外のユーザーへの通知 */}
              {!isUserAdmin && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  ユーザー作成機能は管理者のみが利用できます。あなたは一般ユーザーとしてログインしています。
                </Alert>
              )}
            </>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;