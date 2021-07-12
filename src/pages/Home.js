import React, { Component } from 'react';
import '../App.css';

import { Card, Button } from 'react-mdl';

import { Auth, Storage } from 'aws-amplify';
import { getNiceTime } from '../helpers/TimeHelper';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = { 
        windowWidth: window.innerWidth,
        myprofile: null,
        selectedmatch: null
    };
    this.handleResize = this.handleResize.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.renderMatchesForRace = this.renderMatchesForRace.bind(this);
    this.open = this.open.bind(this);
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
      


      Storage.list(`${response}/`) // for listing ALL files without prefix, pass '' instead
      .then(async result => {
  
        console.log('result.key' + JSON.stringify(result))
  
        const signedURL = await Storage.get("public/"+result[0].key); // get key from Storage.list
  
        console.log('signedURL: ' + signedURL);
        currentComponent.setState({
          myprofile: {
            profileImage: signedURL
          }
        });
      });



      this.setState({user: response});

      var unirest = require("unirest");
      unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/runners?runnerid=${response}`)
      .header('Accept', 'application/json')
      .end(function (res) {
        
        const runnerBody = JSON.parse(res.raw_body);
        currentComponent.setState({
          myprofile: runnerBody
        });
        
        if (res.error) {
          alert("Your subscription request failed, please try again later.");
          return
        }
        return
      });

    //   unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times?runnerid=${response}`)
    //   .header('Accept', 'application/json')
    // //   .send(JSON.stringify(objToSending))
    //   .end(function (res) {
    //       const timesBody = JSON.parse(res.raw_body);
    //     currentComponent.setState({
    //       times: timesBody
    //     });

    //     if (res.error) {
    //       alert("Your subscription request failed, please try again later.");
    //       return
    //     }
    //     console.log(res.raw_body);

    //     // alert(JSON.stringify(currentComponent.state.runner));
    //     return
    //   });

      unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/matches?runnerid=${response}`)
      .header('Accept', 'application/json')
      .end(function (res) {
        const matches = JSON.parse(res.raw_body);
        currentComponent.setState({
          matches: matches
        });

        if (res.error) {
          alert("Your subscription request failed, please try again later.");
          return
        }
        console.log(res.raw_body);
        return
      });
    });
  }

  componentWillUnmount() {
    window.addEventListener("resize", this.handleResize);
  }

  getRaceTimes(race, runnerid) {
    var unirest = require("unirest");

        unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times?runnerid=${runnerid}`)
          .header('Accept', 'application/json')
          //   .send(JSON.stringify(objToSending))
          .end(function (res) {
            console.log(res.raw_body);

            const times = JSON.parse(res.raw_body);

            const rows = [];
            for (const time of times) {
                if (time.race === race) {
                    rows.push(
                      <li>{time.date} - {getNiceTime(time.time)} - </li>
                    );
                }
            }
            return rows;
          });
  }
  

  renderUserProfile(profileToLoad) {
    const cardStyle = { borderWidth: '5px', borderRadius: "5px", margin: '10px', marginBottom: '10px', padding: '25px' };

      if (this.state[profileToLoad]) {
          return (
                <Card shadow={0} style={cardStyle}>


                <img src={this.state[profileToLoad].profileImage} alt="Illinois Matahon 2018" style={{ maxWidth: "300px" }} border="5" />
                <h4><b>Name:</b> {this.state[profileToLoad].firstname}</h4>

                <h5><b>location:</b> {this.state[profileToLoad].location}</h5>

                <h5><b>birthday:</b> {this.state[profileToLoad].birthday}</h5>

                <h5><b>gender:</b> {this.state[profileToLoad].gender ? (this.state[profileToLoad].gender === 1 ? "Woman" : "Man") : <></> }</h5>

                {/* <h5><b>5k Times</b></h5>
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
                </ul> */}

                <h5><b> Contact Info</b></h5>
                <ul>
                    <li>phone number: {this.state[profileToLoad].phone}</li>
                    <li>email: {this.state[profileToLoad].email}</li>
                </ul>
                </Card>
          )
      } else {
       return( <Card> </Card>);
      }
  }

  open(event) {
    console.log('open');
    console.log(event.target.id);
    let currentComponent = this;
    const matchId = event.target.id;

    if (matchId !== "") {

      console.log("matchId: " +matchId)

      Storage.list(`${matchId}/`) // for listing ALL files without prefix, pass '' instead
      .then(async result => {
  
        console.log('result.key' + result[0].key)
  
        const signedURL = await Storage.get("public/"+result[0].key); // get key from Storage.list
  
        console.log('signedURL: ' + signedURL);
        currentComponent.setState({
          selectedmatch: {
            profileImage: signedURL
          }
        });
      });
  
  
  
      var unirest = require("unirest");
      unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/runners?runnerid=${matchId}`)
      .header('Accept', 'application/json')
      .end(function (res) {
        
        const runnerBody = JSON.parse(res.raw_body);
        currentComponent.setState({
          selectedmatch: runnerBody
        });
        
        if (res.error) {
          alert("Your subscription request failed, please try again later.");
          return
        }
        return
      });
  
    }


  }

  renderMatchesForRace(race) {
    const cardStyle = { wordWrap: 'break-word', borderWidth: '5px', borderRadius: "5px", margin: '10px', marginBottom: '10px', padding: '25px' };

    if (this.state.matches && this.state.matches[race]) {
      // console.log("ate.matches" + JSON.stringify(this.state.matches));
      // console.log("this.state.matches[ace] " + JSON.stringify(this.state.matches[race]));

      let matchesForRace = [];
      for(const match of this.state.matches[race]) {
        matchesForRace.push(

          <Card id={match.runnerid} shadow={0} style={cardStyle} onClick={this.open}>
          {/* <Button  onClick={this.open}> */}
    
            <h5><b>Runner</b>: {match.runnerid}</h5>

            <h5><b>time</b>: {getNiceTime(match.time)}</h5>
            <h5><b>location</b>: {match.location}</h5>

            <h5><b>date:</b> {match.date}</h5>

            <h5><b>link</b>: <a href={match.link}>race link</a></h5>
            {/* </Button> */}

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

  renderSelectedMatch() {

    if (this.state.selectedMatch) {

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
              {this.renderUserProfile('myprofile')}
              </Col>

              <Col>
              <h3><b>Matches</b></h3>

                <h5><b>5k Matches</b></h5>
                {this.renderMatchesForRace('fivek')}

                <h5><b>10K Matches</b></h5>
                {this.renderMatchesForRace('tenk')}

                <h5><b>1/2 Marathon Matches</b></h5>
                {this.renderMatchesForRace('halfmarathon')}

                <h5><b> Marathon Matches</b></h5>

                {this.renderMatchesForRace('marathon')}
              
              </Col>


              <Col>
              <h3><b>Match</b></h3>
              {this.renderUserProfile('selectedmatch')}
              </Col>


            </Row>

          </Container>

        </div>



      );
    } 

  }
}

export default Home;