import React, { Component } from 'react';
import '../App.css';

import { Card } from 'react-mdl';


import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import TstProfilePic from "../static/images/beach-bum.png"

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = { windowWidth: window.innerWidth };
    this.handleResize = this.handleResize.bind(this);

  }

  handleResize(e) {
    this.setState({ windowWidth: window.innerWidth });
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.addEventListener("resize", this.handleResize);
  }


  render() {
    const cardStyle = { borderWidth: '5px', borderRadius: "5px", margin: '10px', marginBottom: '10px', padding: '25px' };

    const { windowWidth } = this.state;

    if (windowWidth > 375) {
      return (

        <div className="main">

          <p><br />
          </p>
          <Container>
            <Row>
              <Col>
              <h3><b>Me</b></h3>

              <Card shadow={0} style={cardStyle}>

                <img src={TstProfilePic} alt="Illinois Matahon 2018" style={{ maxWidth: "300px" }} border="5" />
                <h4><b>FirstName LastName</b></h4>

                
                <h5><b>Birthday - Age</b></h5>
                <hr class="solid" />


                <h5><b>Sex</b></h5>
                
                <h5><b>5k Times</b></h5>
                <ul>
                    <li>date - time</li>

                    <li>date - time</li>
                </ul>


                <h5><b>10K Times</b></h5>
                <ul>
                    <li>date - time</li>

                    <li>date - time</li>
                </ul>


                <h5><b>1/2 Marathon Times</b></h5>
                <ul>
                    <li>date - time</li>

                    <li>date - time</li>
                </ul>

                <h5><b> Marathon Times</b></h5>
                <ul>
                    <li>date - time</li>

                    <li>date - time</li>
                </ul>
                <h5><b> Contact Info</b></h5>
                <ul>
                    <li>phone number: 123455666</li>

                    <li>email: dksfji@dierj</li>
                </ul>
              </Card>

              </Col>

              <Col>
              <h3><b>Matches</b></h3>

                <h5><b>5k Matches</b></h5>
                <Card shadow={0} style={cardStyle}></Card>

                <Card shadow={0} style={cardStyle}></Card>

                <h5><b>10K Matches</b></h5>
                <Card shadow={0} style={cardStyle}></Card>
                <Card shadow={0} style={cardStyle}></Card>


                <h5><b>1/2 Marathon Matches</b></h5>
                <Card shadow={0} style={cardStyle}></Card>
                <Card shadow={0} style={cardStyle}></Card>
                <Card shadow={0} style={cardStyle}></Card>

                <h5><b> Marathon Matches</b></h5>
                <Card shadow={0} style={cardStyle}></Card>
                <Card shadow={0} style={cardStyle}></Card>
              
              </Col>


              <Col>

        
              <h3><b>My Match</b></h3>
              <Card shadow={0} style={cardStyle}>

<img src={TstProfilePic} alt="Illinois Matahon 2018" style={{ maxWidth: "300px" }} border="5" />
<h4><b>FirstName LastName</b></h4>


<h5><b>Birthday - Age</b></h5>
<hr class="solid" />


<h5><b>Sex</b></h5>

<h5><b>5k Times</b></h5>
<ul>
    <li>date - time</li>

    <li>date - time</li>
</ul>


<h5><b>10K Times</b></h5>
<ul>
    <li>date - time</li>

    <li>date - time</li>
</ul>


<h5><b>1/2 Marathon Times</b></h5>
<ul>
    <li>date - time</li>

    <li>date - time</li>
</ul>

<h5><b> Marathon Times</b></h5>
<ul>
    <li>date - time</li>

    <li>date - time</li>
</ul>
<h5><b> Contact Info</b></h5>
<ul>
    <li>phone number: 123455666</li>

    <li>email: dksfji@dierj</li>
</ul>
</Card>

              </Col>


            </Row>

          </Container>

        </div>



      );
    } else {
      return (

        <div className="main">

          <p><br />
          </p>
          <Container>
            <Row>
              <Col>
             
            <div className="card-bar">
              <Card shadow={0} style={cardStyle}>

                <h4><b>Personal Records (PRs)</b></h4>

                <h5><b>Marathon</b></h5>
                <hr class="solid" />

                <p>Illinois Marathon (April 2018): <b>02:51:04</b></p>
                <p><i><a
                  href="https://hub.enmotive.com/events/2018-christie-clinic-illinois-marathon/registrants/324-jared-franzone"
                  rel="noopener noreferrer" target="_blank" style={{ wordWrap: "break-word" }} >https://hub.enmotive.com/events/2018-christie-clinic-illinois-marathon/registrants/324-jared-franzone</a></i>
                </p>
                <img src={TstProfilePic} alt="Illinois Matahon 2018" style={{ maxWidth: "300px" }} border="5" />

                
                <h5><b>5k</b></h5>
                <hr class="solid" />

                <p>Kansas City Turkey Trot 5k (November 2019): <b>17:36</b></p>
                <p><i><a
                  href="http://onlineraceresults.com/race/view_race.php?submit_action=select_result&race_id=71146&re_NO=5382#results"
                  rel="noopener noreferrer" target="_blank" style={{ wordWrap: "break-word" }} >http://onlineraceresults.com/race/view_race.php?submit_action=select_result&race_id=71146&re_NO=5382#results</a></i>
                </p>

                <p></p>
              </Card></div>
               
              </Col>

            </Row>

            <Row>
              <Col>
                <p><br />
              Col 2
            </p>
               
              </Col>

            </Row>

            <Row>
              <Col>
                <p><br />
              Col 3
            </p>
               
              </Col>

            </Row>
          </Container>

        </div>



      );
    }

  }
}

export default Home;