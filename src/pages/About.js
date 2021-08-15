import React, { Component } from 'react';
import '../App.css';

import { Card, Button } from 'react-mdl';
import { Auth, Storage } from 'aws-amplify';

import { Link } from "react-router-dom";
import { getNiceTime, getSecondsFromTimeString } from '../helpers/TimeHelper';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import mainscreen from '../static/images/mainscreen.png'
import profile from '../static/images/profile.png'


class About extends Component {

    constructor(props) {
        super(props);

        this.state = {
            windowWidth: window.innerWidth,
        };


        this.handleResize = this.handleResize.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    
    handleResize(e) {
        this.setState({ windowWidth: window.innerWidth });
    }

    handleChange(event) {
        var target = event.target;
        var value = target.type === 'checkbox' ? target.checked : target.value;
        var name = target.name;
        this.setState({
            [name]: value
        });
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.addEventListener("resize", this.handleResize);
    }


    render() {
        const { windowWidth } = this.state;
        const isMobile = windowWidth <= 375;
        // if (!isMobile) {
          return (
            <div className="indent">
      
              <Container>
                <Row>
                  <Col>
                    <h1><b>Pack Finder</b></h1>
                    <h4>Don't be a lone wolf, find your pack!</h4>

                    <hr/>

                    <h3><b>Match with runners your speed.</b></h3>
                    <p>It's easy to meet runners, but it's hard to meet runners that are at a similar fitness level as you and have the same training goals.</p>

                    <p>PackFinder matches you with runners in your city who have ran similar race times as you!</p>

                    <img src={mainscreen} alt="profile" style={{ border: "2px solid black", width: "95%", borderRadius: "5px", }} border="5" />
                    
                    <br/>
                    <br/>
                    
                    <p>The app is 100% <b>FREE</b> with <b>no advertisements</b>. It was built <a
                  href="https://www.jaredfranzone.com/"
                  rel="noopener noreferrer" target="_blank" style={{ wordWrap: "break-word" }} >by a runner</a>, for runners!</p>

             
                    {/* <br/>
                    <hr/>
                    <p>When you create an account, you get a sharable profile link!</p>

*/}

                    <img src={profile} alt="profile" style={{ border: "2px solid black", width: "95%", borderRadius: "5px", }} border="5" />
 


                  </Col>
      
                </Row>
              </Container>
            </div>
          );
        // } else {
        //   return (
        //     <div className="indent">
      
        //       <Container>
        //         <Row>
        //           <Col>
        //             <h3><b>Title</b></h3>

        //           </Col>
    
        //         </Row>
        //         <Row>
        //           <Col>
        //             <h3><b>Other Col</b></h3>

        //           </Col>
    
        //         </Row>
        //       </Container>
        //     </div>
        //   );
        // }
    }
}

export default About;