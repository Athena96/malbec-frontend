import React, { Component } from 'react';
import './App.css';
import Main from './pages/main';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Nav, Navbar } from 'react-bootstrap';
// import { withAuthenticator } from '@aws-amplify/ui-react'
import { AmplifyAuthenticator, AmplifySignOut, AmplifySignIn, AmplifySignUp } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';

import { Auth } from 'aws-amplify';
import { Hub } from 'aws-amplify';
import About from './pages/About'

import Profile from './pages/Profile'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'


// import { AmplifyTheme } from 'aws-amplify-react-native';
// const MySectionHeader = Object.assign({}, AmplifyTheme.sectionHeader, { background: 'orange' });
// const MyTheme = Object.assign({}, AmplifyTheme, { sectionHeader: MySectionHeader });

// class App extends Component {

//   constructor(props) {
//     super(props);
//     this.state = { user: "" };
//   }
//   async signOut() {
//     try {
//       await Auth.signOut();
//       window.location.reload();
//     } catch (err) {
//       console.log(err)
//     }
//   }


//   componentDidMount() {
//     Auth.currentAuthenticatedUser().then(user => {
//       // console.log("USER: " + JSON.stringify(user));
//       let email = user.attributes.email;
//       this.setState({ user: email });
//     }).catch((err) => {
//       // window.alert("Encountered error fetching your username: \n", err);
//     });
//   }
//   render() {
//     return (
//       <div className="main">

//         <Navbar className="color-nav" variant="dark" fixed="top"  collapseOnSelect expand="lg">
//           <Navbar.Brand href="/home">Pack Finder</Navbar.Brand>
//           <Navbar.Toggle aria-controls="responsive-navbar-nav" />
//           <Navbar.Collapse id="responsive-navbar-nav">

//           <Nav className="mr-auto">
//             <Nav.Link href="/edit">Edit Profile</Nav.Link>
//             <Nav.Link href="/about">About</Nav.Link>

//             <Nav.Link onClick={this.signOut}><b>Sign Out</b></Nav.Link>

//           </Nav>
//           </Navbar.Collapse>

//         </Navbar>

//           <div >

//             <Main />
//           </div>


//       </div>

//     );
//   }
// }

const AuthStateApp = () => {

  const signOut = async () => {
    try {
      await Auth.signOut();
      window.location.reload();
    } catch (err) {
      console.log(err)
    }
  }

  const listener = (data) => {

    switch (data.payload.event) {
      case 'signIn':
        console.log('user signed in');
        break;
      case 'signUp':
        console.log('user signUp');
        console.log(JSON.stringify(data.payload.data.user));

        const objToSending = {
          "createtime": new Date().getTime() + "",
          "runnerid": data.payload.data.user.username,
          "email": data.payload.data.user.username
        };
        console.log('objToSending: ' + JSON.stringify(objToSending));

        var unirest = require("unirest");
        unirest.post(`https://${process.env.REACT_APP_API_KEY}.execute-api.us-west-2.amazonaws.com/prod/runners`)
          .header('Accept', 'application/json')
          .send(JSON.stringify(objToSending))
          .end(function (res) {

            if (res.error) {
              alert("Your subscription request failed, please try again later.");
              return
            }
            console.log(res.raw_body);

            // alert(JSON.stringify(currentComponent.state.runner));
            return
          });



        break;
      case 'signOut':
        console.log('user signed out');
        break;
      case 'signIn_failure':
        console.log('user sign in failed');
        break;
      case 'tokenRefresh':
        console.log('token refresh succeeded');
        break;
      case 'tokenRefresh_failure':
        console.log('token refresh failed');
        break;
      case 'configured':
        console.log('the Auth module is configured');
        break;
      default:
        console.log('default');
        break;
    }
  }

  Hub.listen('auth', listener);

  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState();

  React.useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData)
    });
  }, []);

  const isAbout = window.location.href && window.location.href.includes('about');
  console.log("window.location.href: " + window.location.href);
  console.log("isAbout: " + isAbout);
  const isProfle = window.location.href && window.location.href.includes('profile');
  
  console.log("window.location.href: " + window.location.href);
  console.log("isProfle: " + isProfle);

  if (authState === AuthState.SignedIn && user && !isAbout) {
    return (
    <div className="main">

      <Navbar className="color-nav" variant="dark" fixed="top" collapseOnSelect expand="lg">
        <Navbar.Brand href="/home">Pack Finder</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">

          <Nav className="mr-auto">
            <Nav.Link href="/edit">Edit Profile</Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>

            <Nav.Link onClick={signOut}><b>Sign Out</b></Nav.Link>

          </Nav>
        </Navbar.Collapse>

      </Navbar>

      <div >

        <Main />
      </div>


    </div>
  )
  } else if (isAbout) {
      return (
        <div className="main">

        <About />
        </div>
      )
    } else {
      return (
        <div className="main">
          <Container>
            <Row>
              <Col>
                <AmplifyAuthenticator style={{
                  '--amplify-font-family':
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                  '--amplify-primary-color': '#00be78',
                  '--amplify-primary-tint': '#A0AEC0',
                  '--amplify-background-color': '#b9dfd0',
                  '--border-radius': '20px',
    
    
                }} >
    
    <AmplifySignUp
            slot="sign-up"
            usernameAlias="email"
            formFields={[
              {
                type: "email",
                label: "Email",
                placeholder: "email",
                inputProps: { required: true, autocomplete: "username" },
              },
              {
                type: "password",
                label: "Password",
                placeholder: "**************",
                inputProps: { required: true, autocomplete: "new-password" },
              },
              {
                type: "phone_number",
                label: "Custom Phone Label",
                placeholder: "phone number",
              },
            ]} 
          />
          <AmplifySignIn slot="sign-in" usernameAlias="email" />
    </AmplifyAuthenticator>
              </Col>
    
              <Col>
    
                <About />
              </Col>
    
            </Row>
    
          </Container>
    
        </div>
      );
    }
    
    // else if (!isAbout && isProfle) {
    //   return (
    //     <div className="main">

    //     <Profile />
    //     </div>
    //   );
    // }
}

export default AuthStateApp;


// export default App


// export default withAuthenticator(App)
