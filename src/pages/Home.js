import React, { Component } from 'react';
import '../App.css';

import { Card, Button } from 'react-mdl';
import { Link } from "react-router-dom";

import { Auth, Storage } from 'aws-amplify';
import { getNiceTime, getSecondsFromTimeString } from '../helpers/TimeHelper';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import placeholderImage from '../static/images/placeholder.png'

var LAT = null;
var LON = null;
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
    this.saveRaceTime = this.saveRaceTime.bind(this);
    this.deleteRaceTime = this.deleteRaceTime.bind(this);
    this.imageUpdload = this.imageUpdload.bind(this);
    this.handleChange = this.handleChange.bind(this);
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


    function success(pos) {
      var crd = pos.coords;
    
      console.log('Your current position is:');
      console.log(`Latitude : ${crd.latitude}`);
      console.log(`Longitude: ${crd.longitude}`);
      console.log(`More or less ${crd.accuracy} meters.`);

      LAT = crd.latitude;
      LON = crd.longitude;
      console.log(currentComponent);
      currentComponent.setState({
        lat: LAT,
        lon: LON
      })
    }
    
    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }
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
        .end(function (res) {
          const matches = JSON.parse(res.raw_body);
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


  imageUpdload = async function (e) {
    const file = e.target.files[0];
    console.log('file: ' + JSON.stringify(file));
    try {
      await Storage.list(this.state.signedInRunner.runnerid + '/') // for listing ALL files without prefix, pass '' instead
        .then(async result => {
          for (const f of result) {
            console.log('deleting: ' + f.key);
            await Storage.remove(f.key);
          }
        }).catch(err => console.log(err));

      await Storage.put(this.state.signedInRunner.runnerid + '/' + file.name, file, {
        contentType: 'image/png' // contentType is optional
      });

      const signedurl = await Storage.get(this.state.runnerid + '/' + file.name);
      this.setState({
        signedInRunnerProfilePic: signedurl
      }, () => {
        window.location.reload();
      });

    } catch (error) {
      console.log('Error uploading file: ', error);
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

  deleteRaceTime(event) {
    const raceType = event.target.id;
    console.log('raceType ' + raceType);
    console.log('this.userTimes ' + JSON.stringify(this.userTimes));
    const timeid = this.state.userTimes[raceType].timeid;
    var unirest = require("unirest");
    unirest.delete(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times?timeid=${timeid}`)
      .header('Accept', 'application/json')
      .end(function (res) {
        if (res.error) {
          alert("Failed to delete time");
          return
        }

        
        window.location.reload();

        alert("Successfully deleted your race time!");
        return
      });
  }

  saveRaceTime(event) {
    const raceType = event.target.id;
    const formattedTime = getSecondsFromTimeString(this.state.userTimes[raceType].time);
    const time = {
      "link": this.state.userTimes[raceType].link,
      "race": raceType,
      "coordinates": this.state.signedInRunner.coordinates,
      "location": this.state.signedInRunner.location,
      "date": this.state.userTimes[raceType].date,
      "runnerid": this.state.signedInRunner.runnerid,
      "time": formattedTime
    }
    var unirest = require("unirest");

    if (this.state.userTimes[raceType].timeid) {

      time['timeid'] = this.state.userTimes[raceType].timeid;

      console.log("savinghere: " + JSON.stringify(time));

      unirest.put(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times`)
        .header('Accept', 'application/json')
        .send(JSON.stringify(time))
        .end(function (res) {


          if (res.error) {
            alert("Failed to save time");
            return
          }

          alert("Successfully saved your race time!");

          return
        });

    } else {
      time['timeid'] = "" + (new Date()).getTime();

      console.log("savingthere: " + JSON.stringify(time));

      unirest.post(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times`)
        .header('Accept', 'application/json')
        .send(JSON.stringify(time))
        .end(function (res) {
          if (res.error) {
            alert("Failed to save time");
            return
          }

          alert("Successfully saved your race time!");

          return
        });
    }
  }

  renderRaceTime(race) {
    const cardStyle = {  padding: '15px' };

    if (this.state.userTimesLoading === false) {
      return (
        
        <Card id={race} key={race} shadow={0} style={cardStyle}>
          <label>
            <b>Time:</b><br />
            <input
              className="rounded"
              name={`${race}-time`}
              type="text"
              value={this.state.userTimes[race].time}
              onChange={this.handleChange} />
          </label>
          <label>
            <b>Date:</b><br />
            <input
              className="rounded"
              name={`${race}-date`}
              race={race}
              type="date"
              value={this.state.userTimes[race].date}
              onChange={this.handleChange} />
          </label>
          <label>
            <b>Race Time Link:</b><br />
            <input
              className="rounded"
              name={`${race}-link`}
              type="text"
              race={race}

              value={this.state.userTimes[race].link}
              onChange={this.handleChange} />
          </label>
          <button id={race} key={race} onClick={this.saveRaceTime} >Save</button>
          {this.state.userTimes[race].timeid ? <button id={race} key={race} onClick={this.deleteRaceTime} >Delete</button> : <></>}

        </Card>);

    } else {
      return (
        <Card id={race} shadow={0} style={cardStyle}>
        </Card>
      );
    }
  }

  handleChange(event) {
    var target = event.target;
    var value = target.type === 'checkbox' ? target.checked : target.value;
    const name = event.target.name;

    console.log(event.target);

    const updatingRunner = ['location', 'firstname', 'email', 'phone', 'gender', 'coordinates', 'birthday'].includes(name);
    if (updatingRunner) {
      console.log('udpating runner: ' + name);
      const runner = this.state.signedInRunner;

      if (name === "gender") {
        value = parseInt(value);
      }
      runner[name] = value;

      this.setState({
        signedInRunner: runner
      });
    } else {
      console.log('udpating time: ' + name);
      const nameRace = target.name.split("-");
      var race = nameRace[0];
      var field = nameRace[1];

      const times = this.state.userTimes;
      times[race][field] = value;

      this.setState({
        userTimes: times
      });
    }
  }

  renderUserProfile() {
    const cardStyle = { borderWidth: '5px', borderRadius: "5px", padding: '15px' };

    if (this.state.profilePicLoading === false && this.state.signedInRunnerProfileLoading === false && this.state.userTimesLoading === false) {

      return (
        <Card shadow={0} style={cardStyle}>

          <img src={this.state.signedInRunnerProfilePic} alt="Illinois Matahon 2018" style={{ maxWidth: "300px" }} border="5" />
          <input
            type="file"
            onChange={this.imageUpdload}
          />

          <label>
            <b>Name:</b><br />
            <input
              className="rounded"
              name="firstname"
              type="text"
              value={this.state.signedInRunner.firstname}
              onChange={this.handleChange} />
          </label>
          <label>
            <b>Location:</b><br />
            <input
              className="rounded"
              name="location"
              type="text"
              value={this.state.signedInRunner.location}
              onChange={this.handleChange} />
          </label>


          <label>
            <b>Birthday:</b><br />
            <input
              className="rounded"
              name="birthday"
              type="date"
              value={this.state.signedInRunner.birthday}
              onChange={this.handleChange} />
          </label>

          <b>Gender:</b>
          <div className="radio">
            <label>
              <input type="radio" name='gender' value={1}
                checked={this.state.signedInRunner.gender === 1}
                onChange={this.handleChange} />
              Woman
            </label>
          </div>
          <div className="radio">
            <label>
              <input type="radio" name='gender' value={2}
                checked={this.state.signedInRunner.gender === 2}
                onChange={this.handleChange} />
              Man
            </label>
          </div>

          <b> Contact Info</b>

          <label>
            Phone Number:<br />
            <input
              className="rounded"
              name="phone"
              type="phone"
              value={this.state.signedInRunner.phone}
              onChange={this.handleChange} />
          </label>

          <label>
            Email:<br />
            <input
              className="rounded"
              name="phone"
              type="phone"
              value={this.state.signedInRunner.email}
              onChange={this.handleChange} />
          </label>


          <b>5k Time</b>
          {this.renderRaceTime('fivek')}


          <b>10K Time</b>
          {this.renderRaceTime('tenk')}

          <b>1/2 Marathon Time</b>
          {this.renderRaceTime('halfmarathon')}


          <b> Marathon Time</b>
          {this.renderRaceTime('marathon')}

          <Button style={{ background: 'grey' }} onClick={this.save}>Save</Button>

        </Card>
      )
    }
  }

  getDisplayRaceTimes(race) {
    if (this.state.selectedmatchTimesLoading === false && this.state.selectedmatchTimes[race].date && this.state.selectedmatchTimes[race].time) {
      return (
         <>{this.state.selectedmatchTimes[race].time} (date: {this.state.selectedmatchTimes[race].date})</>
      );
    }
    return (<></>);

  }


  renderProfile(profileToLoad) {
    const cardStyle = { borderWidth: '5px', borderRadius: "5px", margin: '10px', marginBottom: '10px', padding: '25px' };

    if (this.state[profileToLoad]) {
      return (
        <Card shadow={0} style={cardStyle}>
          <img src={this.state.selectedmatchProfileImage !== null ? this.state.selectedmatchProfileImage : placeholderImage} alt="profile" style={{ maxWidth: "300px" }} border="5" />
          <b>Name:</b> {this.state[profileToLoad].firstname}<br/><br/>

          <b>Location:</b> {this.state[profileToLoad].location}<br/><br/>

          <b>Birthday:</b> {this.state[profileToLoad].birthday}<br/><br/>

          <b>Gender:</b> {this.state[profileToLoad].gender ? (this.state[profileToLoad].gender === 1 ? "Woman" : "Man") : <></>}<br/><br/>

          <b>5k Time</b>
          {this.getDisplayRaceTimes('fivek')}<br/><br/>

          <b>10K Time</b>
          {this.getDisplayRaceTimes('tenk')}<br/><br/>


          <b>Half Marathon Time</b>
          {this.getDisplayRaceTimes('halfmarathon')}<br/><br/>

          <b> Marathon Time</b>
          {this.getDisplayRaceTimes('marathon')}<br/><br/>


          <b> Contact Info</b>
          <ul>
            <li><u>phone number</u>: {this.state[profileToLoad].phone}</li>
            <li><u>email</u>: {this.state[profileToLoad].email}</li>
          </ul>
        </Card>
      )
    } else {
      return (<Card> </Card>);
    }
  }

  open(event) {
    let currentComponent = this;
    const matchId = event.target.id;

    if (matchId !== "") {

      console.log("matchId: " + matchId)

      Storage.list(`${matchId}/`) // for listing ALL files without prefix, pass '' instead
        .then(async result => {

          let signedURL = null;
          if (result.length > 0) {
            console.log('result.key' + result[0].key)
            signedURL = await Storage.get(result[0].key); // get key from Storage.list
          }
          currentComponent.setState({
            selectedmatchProfileImage: signedURL
          });
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

  renderMatchesForRace(race) {
    const cardStyle = { wordWrap: 'break-word', borderRadius: "5px", padding: '25px' };
    if (this.state.matchesLoading === false) {
      
      if (this.state.matches && this.state.matches[race] && this.state.matches[race].length > 0) {
        let matchesForRace = [];
        let i = 0;
        for (const match of this.state.matches[race]) {
          matchesForRace.push(
            <Card id={match.runnerid} key={match.runnerid + i} shadow={0} style={cardStyle} onClick={this.open}>
  
              <h5>{match.runnerid}
              <hr/>
              <b>Race Time</b>: {getNiceTime(match.time)} - ({RACE_MAP[match.race]})<br/>
              <b>Race Date:</b> {match.date}<br/>

              <b>Location</b>: {match.location}<br/>
              <b>Link</b>: <a href={match.link}>race link</a></h5>
  
            </Card>
          );
  
          i += 1;
        }
        return (matchesForRace);
      } else {
        return (<></>);
      }

    } else {

      return (
        <Card shadow={0} style={cardStyle}>

        </Card>
      );
    }

  }

  render() {
    return (
      <div className="indent">
   
        <Container>
          <Row>
            <Col>
              <h3><b>Me</b></h3>
              {this.renderUserProfile()}
            </Col>

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
