import { referenceAuth } from '@aws-amplify/backend';

export const auth = referenceAuth({
  userPoolId: 'ap-northeast-1_NN5Ct2qua',
  identityPoolId: 'ap-northeast-1:7c50cda8-c55b-43a7-be1b-13d25e04060e',
  authRoleArn: 'arn:aws:iam::853835738220:role/service-role/managed_id_pool_role',
  unauthRoleArn: 'arn:aws:iam::853835738220:role/service-role/managed_login_pool_unauth',
  userPoolClientId: 'ar4sjg7u1g1t16cah2rjfkih3',
});