import React from 'react';
import { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import UserPool, { getUserDetails } from '../cognitoConfig';
import SetUsername from '../pages/Auth/SetUsername';
import { SplashScreen } from '@capacitor/splash-screen';

const AuthGuard: React.FC<any> = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [attributes, setAttributes] = useState<any>(null);

  useEffect(() => {
    const user = UserPool.getCurrentUser();
    setIsAuthenticated(!!user);
  }, []);

  useEffect(() => {
    async function getUsername() {
        if (isAuthenticated) {
            const userDetails = await getUserDetails();
            setAttributes(userDetails);
        }
    }
    getUsername();
  }, [isAuthenticated]);

  if (isAuthenticated === null) return null;
  if (!isAuthenticated) {
    SplashScreen.hide();
    return <Route {...rest} render={() => <Redirect to="/auth" />} />;
  }

  if (attributes === null) return null;
  if (!attributes.preferred_username) {
    SplashScreen.hide();
    return <Route {...rest} component={SetUsername} />;
  }

  SplashScreen.hide();
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

export default AuthGuard;