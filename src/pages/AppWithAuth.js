import React from "react";
import { SignIn } from "aws-amplify-react";
import config from "../aws-exports";
import { CustomSignIn } from "./CustomSignIn";
import App from "../App";
import { Authenticator } from 'aws-amplify-react';
import { Greetings } from 'aws-amplify-react';

class AppWithAuth extends React.Component {

  render() {
    const signUpConfig = {
      header: 'My Customized Sign Up',
      hideAllDefaults: true,
      defaultCountryCode: '1',
      signUpFields: [
        {
          label: 'Email',
          key: 'username',
          required: true,
          displayOrder: 1,
          type: 'string'
        },
        {
          label: 'Confirm Email',
          key: 'email',
          required: true,
          displayOrder: 2,
          type: 'string'
        },
        {
          label: 'Password',
          key: 'password',
          required: true,
          displayOrder: 3,
          type: 'password'
        }
      ]
    };
    return (
      <div>
        <Authenticator hide={[SignIn, Greetings]} amplifyConfig={config} signUpConfig={signUpConfig}>
          <CustomSignIn />
          <App />
        </Authenticator>
      </div>
    );
  }
}

export default AppWithAuth