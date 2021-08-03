import React, { Component } from 'react';
import '../App.css';

import { Card, Button } from 'react-mdl';
import { Auth, Storage } from 'aws-amplify';

import { Link } from "react-router-dom";
import { getNiceTime, getSecondsFromTimeString } from '../helpers/TimeHelper';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'


class Profile extends Component {

  constructor(props) {
    super(props);
    const runnerid = props.history.location.pathname.split('/')[2];

    this.state = {
      windowWidth: window.innerWidth,
      runnerLoading: true,
      timesLoading: true,
      runnerid: runnerid
    };

    
    this.handleResize = this.handleResize.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  
  async getCurrentUserEmail() {
    var user = await Auth.currentAuthenticatedUser();
    return user.attributes.email;
  }
  handleResize(e) {
    this.setState({ windowWidth: window.innerWidth });
  }


  handleChange(event) {
    var target = event.target;
    var value = target.type === 'checkbox' ? target.checked : target.value;
    var name = target.name;

    console.log("name; " + name);
    console.log("value; " + value);

    if (name === "gender") {
      value = parseInt(value);
    }
    this.setState({
      [name]: value
    });
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    var currentComponent = this;

    Storage.list(`${this.state.runnerid}/`) // for listing ALL files without prefix, pass '' instead
    .then(async result => {

      console.log('result.key' + JSON.stringify(result))

      const signedURL = await Storage.get(result[0].key); // get key from Storage.list

      console.log('signedURL: ' + signedURL);
      currentComponent.setState({
        profileImage: signedURL
      });
    })
    .catch(err => console.log(err));

        var unirest = require("unirest");
        console.log("refetch///");
        unirest.get(`https://${process.env.REACT_APP_API_KEY}.execute-api.us-west-2.amazonaws.com/prod/runners?runnerid=${this.state.runnerid}`)
          .header('Accept', 'application/json')
          .end(function (res) {
            console.log(res.raw_body);

            const runnerBody = JSON.parse(res.raw_body);

            currentComponent.setState({
              signedInRunner: runnerBody,
              signedInRunnerProfileLoading: false
            });

            if (res.error) {
              alert("Your subscription request failed, please try again later.");
              return
            }

            // alert(JSON.stringify(currentComponent.state));
            return
          });

          unirest.get(`https://${process.env.REACT_APP_API_KEY}.execute-api.us-west-2.amazonaws.com/prod/times?runnerid=${this.state.runnerid}`)
          .header('Accept', 'application/json')
          .end(function (res) {
  
            // create map format
            const timesBody = JSON.parse(res.raw_body);
            const timesBodyMap = {}
            for (const time of timesBody) {
              const race = time.race;
              time.time = getNiceTime(time.time);
              timesBodyMap[race] = time;
            }
  
            const raceTypes = ['fivek', 'tenk', 'halfmarathon', 'marathon'];
            const raceTimesObj = {}
            for (const race of raceTypes) {
              if (timesBodyMap[race]) {
                raceTimesObj[race] = timesBodyMap[race];
              } else {
                raceTimesObj[race] = {}
              }
            }
            console.log("raceTimesObj: " + JSON.stringify(raceTimesObj));
            currentComponent.setState({
              selectedmatchTimes: raceTimesObj,
              selectedmatchTimesLoading: false,
            });
  
            if (res.error) {
              alert("failed to get times");
              return
            }
            return
          });
  }

  componentWillUnmount() {
    window.addEventListener("resize", this.handleResize);
  }

  getRaceTimes(race) {
    // const rows = [];
    // for (const time of this.state.times) {
    //   if (time.race === race) {
    //     rows.push(
    //       <li> {time.date} - {time.time}</li>

    //     );
    //   }
    // }
    // return rows.length > 0 ? rows : null;

    if (this.state.selectedmatchTimesLoading === false && this.state.selectedmatchTimes[race].date && this.state.selectedmatchTimes[race].time) {
      return (
        <a href={this.state.selectedmatchTimes[race].link} rel="noopener noreferrer" target="_blank" >{this.state.selectedmatchTimes[race].time} (date: {this.state.selectedmatchTimes[race].date})</a>
      );
    }
    return (<></>);

  }

  renderUserProfile() {
    const cardStyle = { borderWidth: '5px', borderRadius: "5px", padding: '15px' };
      if (this.state && this.state.profileImage && this.state.signedInRunner) {
          return (
                <Card shadow={0} style={cardStyle}>
                <img src={this.state.profileImage} alt="profile" style={{ maxWidth: "300px" }} border="5" />
                
                {this.state.signedInRunner.message ? <h5><b>Message:</b> {this.state.signedInRunner.message}</h5> : <></>}


                <b>Name</b> {this.state.signedInRunner.firstname}<br /><br />

                <b>Location</b> {this.state.signedInRunner.location}<br /><br />

                <b>Birthday</b> {this.state.signedInRunner.birthday}<br /><br />

                <b> Contact Info</b>
                <ul>
                  <li><u>phone number</u>: {this.state.signedInRunner.phone}</li>
                  <li><u>email</u>: {this.state.signedInRunner.email}</li>
                </ul>
                <hr/>



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
                    <li>phone number: {this.state.signedInRunner.phone}</li>
                    <li>email: {this.state.signedInRunner.email}</li>
                </ul>
                </Card>
          )
      } else {
       return( <Card> </Card>);
      }
  }

  render() {

    return (
      <div className="profileIndent">

<Container>
          <Row>
            <Col>
        {this.renderUserProfile()}
        </Col>


</Row>

</Container>
      </div>
    );

  }
}

export default Profile;