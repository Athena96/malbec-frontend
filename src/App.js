import React, { Component } from 'react';
import './App.css';
import Main from './pages/main';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Nav, Navbar } from 'react-bootstrap';
import { withAuthenticator } from '@aws-amplify/ui-react'
import { Auth } from 'aws-amplify';
import { Hub } from 'aws-amplify';

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
            console.log('here...');
              console.log(JSON.stringify(res));
    
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

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { user: "" };
  }
  async signOut() {
    try {
      await Auth.signOut();
      window.location.reload();
    } catch (err) {
      console.log(err)
    }
  }


  componentDidMount() {
    Auth.currentAuthenticatedUser().then(user => {
      // console.log("USER: " + JSON.stringify(user));
      let email = user.attributes.email;
      this.setState({ user: email });
    }).catch((err) => {
      // window.alert("Encountered error fetching your username: \n", err);
    });
  }
  render() {
    return (
      <div className="main">

        <Navbar className="color-nav" variant="dark" fixed="top"  collapseOnSelect expand="lg">
          <Navbar.Brand href="/home">Pack Finder</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
          
          <Nav className="mr-auto">
            <Nav.Link href="/edit">Edit Profile</Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>

            <Nav.Link onClick={this.signOut}><b>Sign Out</b></Nav.Link>

          </Nav>
          </Navbar.Collapse>

        </Navbar>
       
          <div >

            <Main />
          </div>


      </div>

    );
  }
}

export default withAuthenticator(App)
