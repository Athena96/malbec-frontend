import React, { Component } from 'react';
import '../App.css';

import { Card } from 'react-mdl';

import { Auth } from 'aws-amplify';
import { getNiceTime } from '../helpers/TimeHelper';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import TstProfilePic from "../static/images/beach-bum.png"

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = { 
        windowWidth: window.innerWidth,
        runner: null,
        times: null
    };
    this.handleResize = this.handleResize.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    this.renderMatchesForRace = this.renderMatchesForRace.bind(this);
  }

  handleResize(e) {
    this.setState({ windowWidth: window.innerWidth });
  }

  async getCurrentUserEmail() {
    var user = await Auth.currentAuthenticatedUser();
    return user.attributes.email;
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    var currentComponent = this;

    this.getCurrentUserEmail().then((response) => {
        console.log("jared");

        console.log(JSON.stringify(response));



        var unirest = require("unirest");
    unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/runners?runnerid=${response}`)
      .header('Accept', 'application/json')
    //   .send(JSON.stringify(objToSending))
      .end(function (res) {
          const runnerBody = JSON.parse(res.raw_body);
        currentComponent.setState({
          runner: runnerBody
        });
        if (res.error) {
          alert("Your subscription request failed, please try again later.");
          return
        }
        console.log(res.raw_body);

        // alert(JSON.stringify(currentComponent.state.runner));
        return
      });


      unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times?runnerid=${response}`)
      .header('Accept', 'application/json')
    //   .send(JSON.stringify(objToSending))
      .end(function (res) {
          const timesBody = JSON.parse(res.raw_body);
        currentComponent.setState({
          times: timesBody
        });

        if (res.error) {
          alert("Your subscription request failed, please try again later.");
          return
        }
        console.log(res.raw_body);

        // alert(JSON.stringify(currentComponent.state.runner));
        return
      });


      unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/matches?runnerid=${response}`)
      .header('Accept', 'application/json')
    //   .send(JSON.stringify(objToSending))
      .end(function (res) {
          const matches = JSON.parse(res.raw_body);
        console.log("matches: " + JSON.stringify(matches));
          currentComponent.setState({
          matches: matches
        });

        if (res.error) {
          alert("Your subscription request failed, please try again later.");
          return
        }
        console.log(res.raw_body);

        // alert(JSON.stringify(currentComponent.state.runner));
        return
      });




    });
    
  }

  componentWillUnmount() {
    window.addEventListener("resize", this.handleResize);
  }

  getRaceTimes(race) {
      const rows = [];
      for (const time of this.state.times) {
          if (time.race === race) {
              rows.push(
                <li>{time.date} - {getNiceTime(time.time)} - </li>

              );
          }
      }
      return rows;
  }

  renderUserProfile() {
    const cardStyle = { borderWidth: '5px', borderRadius: "5px", margin: '10px', marginBottom: '10px', padding: '25px' };

      if (this.state.runner && this.state.times) {
          return (
                <Card shadow={0} style={cardStyle}>

                <img src={TstProfilePic} alt="Illinois Matahon 2018" style={{ maxWidth: "300px" }} border="5" />
                <h4><b>Name:</b> {this.state.runner.firstname}</h4>

                <h5><b>location:</b> {this.state.runner.location}</h5>

                <h5><b>birthday:</b> {this.state.runner.birthday}</h5>

                <h5><b>gender:</b> {this.state.runner.gender ? (this.state.runner.gender === 1 ? "Woman" : "Man") : <></> }</h5>

                <h5><b>5k Times</b></h5>
                <ul>
                    {this.getRaceTimes('fivek')}
                </ul>


                <h5><b>10K Times</b></h5>
                <ul>
                    {this.getRaceTimes('tenk')}
                </ul>


                <h5><b>1/2 Marathon Times</b></h5>
                <ul>
                    {this.getRaceTimes('halfmarathon')}
                </ul>

                <h5><b> Marathon Times</b></h5>
                <ul>
                    {this.getRaceTimes('marathon')}
                </ul>

                <h5><b> Contact Info</b></h5>
                <ul>
                    <li>phone number: {this.state.runner.phone}</li>

                    <li>email: {this.state.runner.email}</li>
                </ul>
                </Card>
          )
      }
  }


  renderMatchesForRace(race) {
    const cardStyle = { borderWidth: '5px', borderRadius: "5px", margin: '10px', marginBottom: '10px', padding: '25px' };

    if (this.state.matches) {
      console.log("ate.matches" + JSON.stringify(this.state.matches));
      console.log("race " + race);

      let matchesForRace = [];
      for(const match of this.state.matches[race]) {
        matchesForRace.push(

        <Card shadow={0} style={cardStyle}>
  
          <h5>Runner: {match.runnerid}</h5>

          <h5>time: {match.time}</h5>
          <h5>location: TOBEADDED</h5>

          <h5>date: {match.date}</h5>

          <h5>link: {match.link}</h5>
        </Card>
        );
      }
      return (matchesForRace);
    } else {

      return (
        <Card shadow={0} style={cardStyle}>
  
        </Card>
      );
    }
    
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

              {this.renderUserProfile()}

              </Col>

              <Col>
              <h3><b>Matches</b></h3>

                <h5><b>5k Matches</b></h5>
                {this.renderMatchesForRace('fivek')}

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