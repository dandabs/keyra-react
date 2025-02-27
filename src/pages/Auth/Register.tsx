import React, { useState } from 'react';
import { IonInput, IonButton, IonModal, IonSelect, IonSelectOption } from '@ionic/react';
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import UserPool from '../../cognitoConfig';
import { useHistory } from 'react-router-dom';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { countryCodes } from '../../countryCodes'; // Assuming you have this list

const Register: React.FC = () => {
  const [countryCode, setCountryCode] = useState('+354'); // Default country code
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPhoneTouched, setIsPhoneTouched] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState<boolean | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean | null>(null);
  const [isOptValid, setIsOtpValid] = useState<boolean | null>(null);
  const [otpError, setOtpError] = useState('');
  const [fullPPhoneNumber, setFullPPhoneNumber] = useState('');
  const history = useHistory();

  const handleRegister = () => {
    setPhoneError('');
    setPasswordError('');
    
    // Combine the selected country code with the phone number
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    // Validate phone number
    const parsedNumber = parsePhoneNumberFromString(fullPhoneNumber);
    if (!parsedNumber || !parsedNumber.isValid()) {
      setPhoneError('Invalid phone number. Please check and try again.');
      setIsPhoneValid(false);
      return;
    }
    setFullPPhoneNumber(parsedNumber.format('E.164'));

    // Validate password
    if (!password) {
      setPasswordError('Password is required.');
      setIsPasswordValid(false);
      return;
    }

    setIsPhoneValid(true);
    setIsPasswordValid(true);

    const attributes = [
      new CognitoUserAttribute({ Name: 'phone_number', Value: parsedNumber.format('E.164') }),
    ];

    UserPool.signUp(parsedNumber.format('E.164'), password, attributes, [], (err, result) => {
      if (err) {
        console.error('Error signing up:', err);
        setIsPasswordValid(false);
        setPasswordError(err.message);
        return;
      }
      console.log('Sign up successful:', result);
      setShowOtpModal(true);
    });
  };

  const confirmSignUp = () => {
    const user = new CognitoUser({
      Username: fullPPhoneNumber,
      Pool: UserPool,
    });

    user.confirmRegistration(otp, true, (err, result) => {
      if (err) {
        console.error('Error confirming sign up:', err);
        setIsOtpValid(false);
        setOtpError(err);
        return;
      }
      console.log('OTP confirmed:', result);
      setShowOtpModal(false);

      user.authenticateUser(new AuthenticationDetails({
        Username: fullPPhoneNumber,
        Password: password,
      }), {
        onSuccess: (session) => {
          console.log('Login successful:', session);
          history.push('/tabs');
        },
        onFailure: (err) => {
          console.error('Error signing in:', err);
          setPasswordError(err.message);
          setIsPasswordValid(false);
        },
      });

      history.push('/auth');
    });
  };

  return (
    <>
      {/* Country Picker */}
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
        onIonChange={(e) => setPhoneNumber(e.detail.value || '')}
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

      <IonButton expand="full" onClick={handleRegister}>Register</IonButton>

      <IonModal isOpen={showOtpModal}>
        <div className="ion-padding container">
          <IonInput
            placeholder="123456"
            type="text"
            label="OTP"
            onIonChange={(e) => setOtp(e.detail.value || '')}
            errorText={otpError}
            className={`${isOptValid && 'ion-valid'} ${isOptValid === false && 'ion-invalid'} ion-touched`}
          />
          <IonButton expand="full" onClick={confirmSignUp}>Confirm</IonButton>
        </div>
      </IonModal>
    </>
  );
};

export default Register;
