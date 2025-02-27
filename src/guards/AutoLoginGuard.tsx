import React from 'react';
import { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { SplashScreen } from '@capacitor/splash-screen';
import UserPool from '../cognitoConfig';

const AutoLoginGuard: React.FC<any> = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const user = UserPool.getCurrentUser();
    setIsAuthenticated(!!user);
  }, []);

  if (isAuthenticated === null) return null;

  SplashScreen.hide();
  return <Route {...rest} render={(props) => (!isAuthenticated ? <Component {...props} /> : <Redirect to="/tabs" />)} />;
};

export default AutoLoginGuard;