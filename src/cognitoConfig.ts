import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'eu-west-1_x2HXdT43V',
  ClientId: '6sduf0fk6ieavjrh0qj8fccbf8',
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
