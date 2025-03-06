import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { config } from './config';

const poolData = {
  UserPoolId: config.userPoolId,
  ClientId: config.clientId,
};

const userPool = new CognitoUserPool(poolData);

export default userPool;

export const getToken = async () => {
  return new Promise<string>((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject('No user is authenticated.');
      return;
    }

    cognitoUser.getSession((err: Error, session: any) => {
      if (err) {
        reject('Failed to get session: ' + err);
        return;
      }

      resolve(session.getIdToken().getJwtToken());
    });
  });
}
