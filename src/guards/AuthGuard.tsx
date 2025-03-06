import React from 'react';
import { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import UserPool from '../cognitoConfig';
import { SplashScreen } from '@capacitor/splash-screen';

const AuthGuard: React.FC<any> = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const user = UserPool.getCurrentUser();
    setIsAuthenticated(!!user);
  }, []);

  if (isAuthenticated === null) { SplashScreen.hide(); return null; }
  if (!isAuthenticated) {
    SplashScreen.hide();
    return <Route {...rest} render={() => <Redirect to="/auth" />} />;
  }

  SplashScreen.hide();
  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

export default AuthGuard;