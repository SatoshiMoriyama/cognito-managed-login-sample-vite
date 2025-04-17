// ユーザーの型定義
export interface UserAttributes {
  [key: string]: string;
}

export interface User {
  username: string;
  attributes?: UserAttributes;
}

// ユーザーが管理者かどうかを判断するヘルパー関数
export const isAdmin = (user: User | null): boolean => {
  if (!user || !user.attributes) {
    return false;
  }
  
  // custom:isAdmin 属性で判断
  return user.attributes['custom:isAdmin'] === 'true';
};