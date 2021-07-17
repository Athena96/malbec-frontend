import React, { Component } from 'react';
import '../App.css';

import { Card, Button, List, ListItem, ListItemAction, ListItemContent } from 'react-mdl';
import { Link } from "react-router-dom";

import { Auth, Storage } from 'aws-amplify';
import { getNiceTime, getSecondsFromTimeString } from '../helpers/TimeHelper';
import { getDistanceFromLatLonInKm } from '../helpers/LocationHelper';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import placeholderImage from '../static/images/placeholder.png'

const RACE_MAP = {
  fivek: "5k",
  tenk: "10k",
  halfmarathon: "Half Marathon",
  marathon: "Marathon"
}
class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      windowWidth: window.innerWidth,
      matchesLoading: true,
      timesLoading: true,
      runnerProfileLoading: true,
      profilePicLoading: true,
      selectedmatch: null
    };
    this.handleResize = this.handleResize.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.renderMatchesForRace = this.renderMatchesForRace.bind(this);
    this.open = this.open.bind(this);
    this.save = this.save.bind(this);
  }

  handleResize(e) {
    this.setState({ windowWidth: window.innerWidth });
  }

  async getCurrentUserEmail() {
    var user = await Auth.currentAuthenticatedUser();
    return user.attributes.email;
  }

  componentDidMount() {
    var currentComponent = this;

    // 1. get current signed in runnerid
    this.getCurrentUserEmail().then((response) => {
      const signedInRunnerId = response;

      // 2. get their profile pic link
      Storage.list(`${signedInRunnerId}/`)
        .then(async result => {
          const signedURL = await Storage.get(result[0].key);
          currentComponent.setState({
            signedInRunnerProfilePic: signedURL,
            profilePicLoading: false
          });
        }).catch(err => console.log(err));

      // 3. get their profile
      var unirest = require("unirest");
      unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/runners?runnerid=${signedInRunnerId}`)
        .header('Accept', 'application/json')
        .end(function (res) {
          const runnerBody = JSON.parse(res.raw_body);

          // 3.5 set their location if not set
          currentComponent.setState({
            signedInRunner: runnerBody,
            signedInRunnerProfileLoading: false
          }, () => {

            // get location
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((position) => {

                // if not set for runner yet
                if (!Object.keys(runnerBody).includes('coordinates')) {
                  runnerBody['coordinates'] = `${position.coords.latitude}#${position.coords.longitude}`;
                  // get location string
                  unirest.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`)
                    .header('Accept', 'application/json')
                    .end(function (res) {
                      const locationResponse = JSON.parse(res.raw_body);
                      const cityStateString = `${locationResponse.city}, ${locationResponse.principalSubdivision}`;
                      runnerBody['location'] = cityStateString;

                      console.log('updating runner with coords');
                      console.log(JSON.stringify(runnerBody));
                      currentComponent.setState({
                        signedInRunner: runnerBody
                      }, () => {
                        currentComponent.save(false);
                      });
                    });
                } else {
                  // is set for runner... see if moved
                  const currLat = position.coords.latitude;
                  const currLon = position.coords.longitude;

                  const oldLat = runnerBody.coordinates.split("#")[0];
                  const oldLon = runnerBody.coordinates.split("#")[1];

                  const movedDist = getDistanceFromLatLonInKm(currLat, currLon, oldLat, oldLon);
                  if (movedDist > 5.0) {
                    if (window.confirm('Looks like you moved, do you want to update your location?')) {

                      runnerBody['coordinates'] = `${position.coords.latitude}#${position.coords.longitude}`;
                      // get location string
                      unirest.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`)
                        .header('Accept', 'application/json')
                        .end(function (res) {
                          const locationResponse = JSON.parse(res.raw_body);
                          const cityStateString = `${locationResponse.city}, ${locationResponse.principalSubdivision}`;
                          runnerBody['location'] = cityStateString;

                          console.log('updating runner with coords');
                          console.log(JSON.stringify(runnerBody));
                          currentComponent.setState({
                            signedInRunner: runnerBody
                          }, () => {
                            currentComponent.save(false);
                          });
                        });

                      alert(`Ok, we updated your location, you'll start receiving matches in your new location now!`);

                    } else {
                      alert(`Ok, we'll keep your same location.`);
                    }
                  }
                }
              });
            }

            // check location change
            if (!Object.keys(runnerBody).includes('coordinates')) {

              if (navigator.geolocation) {

                navigator.geolocation.getCurrentPosition((position) => {
                  runnerBody['coordinates'] = `${position.coords.latitude}#${position.coords.longitude}`;

                  // get location string
                  unirest.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`)
                    .header('Accept', 'application/json')
                    .end(function (res) {
                      const locationResponse = JSON.parse(res.raw_body);
                      const cityStateString = `${locationResponse.city}, ${locationResponse.principalSubdivision}`;
                      runnerBody['location'] = cityStateString;

                      console.log('updating runner with coords');
                      console.log(JSON.stringify(runnerBody));
                      currentComponent.setState({
                        signedInRunner: runnerBody
                      }, () => {
                        currentComponent.save(false);
                      });
                    });
                });
              }
            }
          });



          if (res.error) {
            alert("failed to get profile");
            return
          }
          return
        });

      // 4. get their race times
      unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times?runnerid=${signedInRunnerId}`)
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
          currentComponent.setState({
            userTimes: raceTimesObj,
            userTimesLoading: false,
          });

          if (res.error) {
            alert("failed to get times");
            return
          }
          return
        });

      unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/matches?runnerid=${signedInRunnerId}`)
        .header('Accept', 'application/json')
        .end(async function (res) {
          const matches = JSON.parse(res.raw_body);
          console.log('mmatches' + JSON.stringify(matches))

          for (const raceType of Object.keys(matches)) {
            if (RACE_MAP[raceType] && matches[raceType] && matches[raceType].length > 0) {
              for (const matchObj of matches[raceType]) {
                console.log('matchObj' + JSON.stringify(matchObj))

                const listPic = await Storage.list(`${matchObj.runnerid}/`);

                console.log('listPic' + JSON.stringify(listPic))
                let signedURL = null;
                if (listPic && listPic.length > 0) {
                  signedURL = await Storage.get(listPic[0].key);
                }

                //
                let id = 0;
                for (const m of matches[raceType]) {
                  if (m.runnerid === matchObj.runnerid) {
                    matches[raceType][id]['profileImageUrl'] = signedURL;
                  }
                  id += 1;
                }
                //
              }
            }
          }
          console.log("matches: " + JSON.stringify(matches));
          currentComponent.setState({
            matches: matches,
            matchesLoading: false
          });

          if (res.error) {
            alert("failed to get matches");
            return
          }
          return
        });
    });
  }

  componentWillUnmount() {
    window.addEventListener("resize", this.handleResize);
  }

  getDisplayRaceTimes(race) {
    if (this.state.selectedmatchTimesLoading === false && this.state.selectedmatchTimes[race].date && this.state.selectedmatchTimes[race].time) {
      return (
        <a href={this.state.selectedmatchTimes[race].link} rel="noopener noreferrer" target="_blank" >{this.state.selectedmatchTimes[race].time} (date: {this.state.selectedmatchTimes[race].date})</a>
      );
    }
    return (<></>);

  }

  renderProfile(profileToLoad) {
    const cardStyle = { borderWidth: '5px', borderRadius: "5px", padding: '15px' };

    if (this.state[profileToLoad]) {
      return (

        <Card shadow={0} style={cardStyle}>
          <img src={this.state.selectedmatchProfileImage !== null ? this.state.selectedmatchProfileImage : placeholderImage} alt="profile" style={{ maxWidth: "300px", borderRadius: "5px", }} border="5" />

          {this.state[profileToLoad].message ? <><b>Message</b> {this.state[profileToLoad].message}</> : <></>}

          <br /><br /><b>Name</b> {this.state[profileToLoad].firstname}<br /><br />

          <b>Location</b> {this.state[profileToLoad].location}<br /><br />

          <b>Birthday</b> {this.state[profileToLoad].birthday}<br /><br />

          <b>Gender</b> {this.state[profileToLoad].gender ? (this.state[profileToLoad].gender === 1 ? "Woman" : "Man") : <></>}<br /><br />

          <b>5k Time</b>
          {this.getDisplayRaceTimes('fivek')}<br /><br />

          <b>10K Time</b>
          {this.getDisplayRaceTimes('tenk')}<br /><br />


          <b>Half Marathon Time</b>
          {this.getDisplayRaceTimes('halfmarathon')}<br /><br />

          <b> Marathon Time</b>
          {this.getDisplayRaceTimes('marathon')}<br /><br />


          <b> Contact Info</b>
          <ul>
            <li><u>phone number</u>: {this.state[profileToLoad].phone}</li>
            <li><u>email</u>: {this.state[profileToLoad].email}</li>
          </ul>
        </Card>
      )
    } else {
      return (<Card> No match selected </Card>);
    }
  }

  open(match) {
    let currentComponent = this;
    if (match) {
      const matchId = match.runnerid;

      currentComponent.setState({
        selectedmatchProfileImage: match.profileImageUrl
      });

      var unirest = require("unirest");
      unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/runners?runnerid=${matchId}`)
        .header('Accept', 'application/json')
        .end(function (res) {

          const runnerBody = JSON.parse(res.raw_body);
          currentComponent.setState({
            selectedmatch: runnerBody,
            selectedmatchLoading: false
          });

          if (res.error) {
            alert("failed to open profile");
            return
          }
          return
        });

      unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times?runnerid=${matchId}`)
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


  }

  save(showAlert) {
    console.log("save");

    const runner = {
      "location": this.state.signedInRunner.location,
      "firstname": this.state.signedInRunner.firstname,
      "runnerid": this.state.signedInRunner.runnerid,
      "email": this.state.signedInRunner.email,
      "phone": this.state.signedInRunner.phone,
      "gender": this.state.signedInRunner.gender,
      "coordinates": this.state.signedInRunner.coordinates,
      "birthday": this.state.signedInRunner.birthday,
      "message": this.state.signedInRunner.message
    }

    console.log("SAVE RUNNER: " + JSON.stringify(runner));
    var unirest = require("unirest");
    unirest.put(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/runners`)
      .header('Accept', 'application/json')
      .send(JSON.stringify(runner))
      .end(function (res) {

        if (res.error) {
          alert("Failed to Save.");
          return
        }

        if (showAlert) {
          alert("Saved your runner profile!");
        }
        return
      });
  }

  renderMatchesForRace(race) {
    const content = { borderRadius: '5px', width: '25%', marginRight:'10px' };
    if (this.state.matchesLoading === false) {

      if (this.state.matches && this.state.matches[race] && this.state.matches[race].length > 0) {
        let matchesForRace = [];
        let i = 0;
        for (const match of this.state.matches[race]) {

          matchesForRace.push(
            <div key={match.runnerid + i} onClick={(e) => this.open(match)}>
              <ListItem className="cardclasshover" threeLine>

                {match.profileImageUrl != null ? 
                <><img src={match.profileImageUrl} alt="profile" style={content} border="5" /></>:
                <><img src={placeholderImage} alt="profile" style={content} border="5" /></>}

  
                <ListItemContent subtitle={<><b>Race Time</b><br /> {getNiceTime(match.time)} - ({RACE_MAP[match.race]})</>}>
                  {match.runnerid}              
                </ListItemContent>


              </ListItem >

            </div >

          );

          i += 1;
        }
        return (
          <List>
            {matchesForRace}
          </List>
        );
      } else {
        return (<p>no matches yet</p>);
      }

    } else {

      return (
        <ListItem className="cardclasshover">
          <ListItemContent >
          </ListItemContent>
        </ListItem >
      );
    }

  }

  render() {
    return (
      <div className="indent">

        <Container>
          <Row>
            <Col>
              <h3><b>My Matches</b></h3>

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
              <h3><b>Selected Match</b></h3>
              {this.renderProfile('selectedmatch')}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Home;
