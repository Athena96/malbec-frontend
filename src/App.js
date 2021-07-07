import React, { Component } from 'react';
import './App.css';
import Main from './pages/main';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Nav, Navbar } from 'react-bootstrap';

class App extends Component {

  render() {

    return (
      <div className="main">

        <Navbar className="color-nav" variant="dark" fixed="top"  collapseOnSelect expand="lg">
          <Navbar.Brand href="/home">AppName</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
          
          <Nav className="mr-auto">
            <Nav.Link href="/profile">Edit Profile</Nav.Link>
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

export default App;