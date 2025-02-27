import React, { useState } from 'react';
import { IonInput, IonButton, IonSelect, IonSelectOption } from '@ionic/react';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import UserPool from '../../cognitoConfig';
import { useHistory } from 'react-router-dom';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { countryCodes } from '../../countryCodes';

const Signin: React.FC = () => {
  const [countryCode, setCountryCode] = useState('+354');
  const [rawPhoneNumber, setRawPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPhoneTouched, setIsPhoneTouched] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState<boolean | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean | null>(null);
  const history = useHistory();

  const handleSignIn = () => {
    setPhoneError('');
    setPasswordError('');

    const fullPhoneNumber = `${countryCode}${rawPhoneNumber}`;

    // Parse and validate the phone number
    const parsedNumber = parsePhoneNumberFromString(fullPhoneNumber);
    if (!parsedNumber || !parsedNumber.isValid()) {
      setPhoneError('Invalid phone number. Please check and try again.');
      setIsPhoneValid(false);
      return;
    }

    const formattedPhoneNumber = parsedNumber.format('E.164');

    if (!password) {
      setPasswordError('Password is required.');
      setIsPasswordValid(false);
      return;
    }

    setIsPhoneValid(true);
    setIsPasswordValid(true);

    const user = new CognitoUser({
      Username: formattedPhoneNumber,
      Pool: UserPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: formattedPhoneNumber,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        console.log('Login successful:', session);
        localStorage.setItem('token', session.getIdToken().getJwtToken());
        history.push('/tabs');
      },
      onFailure: (err) => {
        setPasswordError(err || "Something went wrong, try again.");
        setIsPasswordValid(false);
      },
    });
  };

  return (
    <>
      <IonSelect
        label="Country"
        value={countryCode}
        placeholder="Select Country"
        onIonChange={(e) => setCountryCode(e.detail.value)}
      >
        {countryCodes.map((country) => (
          <IonSelectOption key={country.code} value={country.code}>
            {country.label}
          </IonSelectOption>
        ))}
      </IonSelect>

      <IonInput
        placeholder="462-4478"
        type="tel"
        onIonChange={(e) => setRawPhoneNumber(e.detail.value || '')}
        onIonBlur={() => setIsPhoneTouched(true)}
        label="Phone"
        errorText={phoneError}
        className={`${isPhoneValid && 'ion-valid'} ${isPhoneValid === false && 'ion-invalid'} ${isPhoneTouched && 'ion-touched'}`}
      />

      <IonInput
        placeholder="p@ssw0rd!"
        label="Password"
        type="password"
        onIonChange={(e) => setPassword(e.detail.value || '')}
        onIonBlur={() => setIsPasswordTouched(true)}
        errorText={passwordError}
        className={`${isPasswordValid && 'ion-valid'} ${isPasswordValid === false && 'ion-invalid'} ${isPasswordTouched && 'ion-touched'}`}
      />

      <IonButton expand="full" onClick={handleSignIn}>
        Sign in
      </IonButton>
    </>
  );
};

export default Signin;
