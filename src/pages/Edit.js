import React, { Component } from 'react';
import '../App.css';

import { Card, Button, Textfield, RadioGroup, Radio } from 'react-mdl';
import { Auth, Storage } from 'aws-amplify';

import { Link } from "react-router-dom";
import { getDistanceFromLatLonInKm } from '../helpers/LocationHelper';
import { getNiceTime, getSecondsFromTimeString } from '../helpers/TimeHelper';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import placeholderImage from '../static/images/placeholder.png'


class Edit extends Component {

    constructor(props) {
        super(props);

        this.state = {
            windowWidth: window.innerWidth,
            runnerLoading: true,
            timesLoading: true
        };


        this.handleResize = this.handleResize.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.save = this.save.bind(this);
        this.saveRaceTime = this.saveRaceTime.bind(this);
        this.deleteRaceTime = this.deleteRaceTime.bind(this);
        this.imageUpdload = this.imageUpdload.bind(this);

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
        const name = event.target.name;

        console.log(event.target);

        const updatingRunner = ['message', 'location', 'firstname', 'email', 'phone', 'gender', 'coordinates', 'birthday'].includes(name);
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
                }).catch(err => { 
                    console.log(err);

                    currentComponent.setState({
                        signedInRunnerProfilePic: null,
                        profilePicLoading: false
                    });
                });

            // 3. get their profile
            var unirest = require("unirest");
            unirest.get(`https://${process.env.REACT_APP_API_KEY}.execute-api.us-west-2.amazonaws.com/prod/runners?runnerid=${signedInRunnerId}`)
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

                        ///////////

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
            unirest.get(`https://${process.env.REACT_APP_API_KEY}.execute-api.us-west-2.amazonaws.com/prod/times?runnerid=${signedInRunnerId}`)
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

            unirest.get(`https://${process.env.REACT_APP_API_KEY}.execute-api.us-west-2.amazonaws.com/prod/matches?runnerid=${signedInRunnerId}`)
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

    getRaceTimes(race) {
        const rows = [];
        for (const time of this.state.times) {
            if (time.race === race) {
                rows.push(
                    <li> {time.date} - {time.time}</li>

                );
            }
        }
        return rows.length > 0 ? rows : null;
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
      "message": this.state.signedInRunner.message
    }

    console.log("SAVE RUNNER: " + JSON.stringify(runner));
    var unirest = require("unirest");
    unirest.put(`https://${process.env.REACT_APP_API_KEY}.execute-api.us-west-2.amazonaws.com/prod/runners`)
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
        unirest.delete(`https://${process.env.REACT_APP_API_KEY}.execute-api.us-west-2.amazonaws.com/prod/times?timeid=${timeid}`)
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
    
          unirest.put(`https://${process.env.REACT_APP_API_KEY}.execute-api.us-west-2.amazonaws.com/prod/times`)
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
    
          unirest.post(`https://${process.env.REACT_APP_API_KEY}.execute-api.us-west-2.amazonaws.com/prod/times`)
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
        const cardStyle = { padding: '15px', borderRadius: '10px', backgroundColor: 'rgb(0, 190, 120, 0.15)', margin: '10px'};
        const savebuttonStyle = {   borderRadius: '10px', border: 'solid black 1px', width: '100%',backgroundColor: 'rgb(0, 190, 120, 0.35)', paddingBottom: '10px' };
        const delbuttonStyle = {   borderRadius: '10px', border: 'solid black 1px', width: '100%',backgroundColor: 'rgb(230, 230, 230)', paddingBottom: '10px' };

        if (this.state.userTimesLoading === false) {
            return (
                <div style={cardStyle}>
                {/* <Card id={race} key={race} shadow={0} style={cardStyle}> */}
                    <label>
                        <b>Time</b><br />
                        <input
                            className="rounded"
                            name={`${race}-time`}
                            type="text"
                            value={this.state.userTimes[race].time}
                            onChange={this.handleChange} />
                    </label>
                    <label>
                        <b>Date</b><br />
                        <input
                            className="rounded"
                            name={`${race}-date`}
                            race={race}
                            type="date"
                            value={this.state.userTimes[race].date}
                            onChange={this.handleChange} />
                    </label>
                    <label>
                        <b>Race Time Link</b><br />
                        <input
                            className="rounded"
                            name={`${race}-link`}
                            type="text"
                            race={race}

                            value={this.state.userTimes[race].link}
                            onChange={this.handleChange} />
                    </label>
                    <Row>
                        <Col>
                            <Button style={savebuttonStyle} id={race} key={race} onClick={this.saveRaceTime} >Save Time</Button>
                        </Col>
                        <Col>
                            {this.state.userTimes[race].timeid ? <Button style={delbuttonStyle} id={race} key={race} onClick={this.deleteRaceTime} >Delete</Button> : <></>}
                        </Col>
                    </Row>
                {/* </Card> */}
                </div>
                );

        } else {
            return (
                <Card id={race} shadow={0} style={cardStyle}>
                </Card>
            );
        }
    }

    renderUserProfile() {
        const cardStyle = { borderWidth: '5px', borderRadius: "5px", padding: '15px' };

        if (this.state.profilePicLoading === false && this.state.signedInRunnerProfileLoading === false && this.state.userTimesLoading === false) {

            return (
                <Card shadow={0} style={cardStyle} >


{this.state.signedInRunnerProfilePic != null ? 
                  <><img src={this.state.signedInRunnerProfilePic} alt="profile" style={{ maxWidth: "300px", borderRadius: '5px' }} border="5" /><br /></>:
                  <><img src={placeholderImage} alt="profile" style={{ maxWidth: "300px", borderRadius: '5px' }} border="5" /></>}
  
                    <input
                        type="file"

                        onChange={this.imageUpdload}
                    /><br />

                    <label>
                        <b>Message</b><br />
                        <Textfield
                            
                            className="rounded"
                            name="message"
                            label="message"
                            type="text"
                            rows={3}

                            value={this.state.signedInRunner.message}
                            onChange={this.handleChange} />
                    </label>

                    <label>
                        <b>Name</b><br />
                        <Textfield
                 
                            name="firstname"
                            label="firstname"
                            value={this.state.signedInRunner.firstname}
                            onChange={this.handleChange} />
                    </label>
                    <label>
                        <b>Location</b><br />
                        <Textfield
                            className="rounded"
                            name="location"
                            label="location"

                            type="text"
                            value={this.state.signedInRunner.location}
                            onChange={this.handleChange} />
                    </label>


                    <label>
                        <b>Birthday</b><br />
                        <input
                            className="rounded"
                            name="birthday"
                            type="date"
                            value={this.state.signedInRunner.birthday}
                            onChange={this.handleChange} />
                    </label><br />

                    <b>Gender</b>

                    <RadioGroup name="gender" value={this.state.signedInRunner.gender} onChange={this.handleChange}>
                        <Radio  name='gender' value={1} ripple >Woman</Radio><> </>
                        <Radio name='gender' value={2} >Man</Radio>
                    </RadioGroup><br />

                    <b> Contact Info</b>

                    <label>
                        Phone Number
                        <Textfield
                            className="rounded"
                            name="phone"
                            type="phone"
                            label="phone"

                            value={this.state.signedInRunner.phone}
                            onChange={this.handleChange} />
                    </label>

                    <label>
                        Email
                        <Textfield
                            className="rounded"
                            name="email"
                            type="email"
                            label="email"

                            value={this.state.signedInRunner.email}
                            onChange={this.handleChange} />
                    </label>

                    <b>5k Time</b>
                    {this.renderRaceTime('fivek')}<br />
                    
                    <b>10K Time</b>
                    {this.renderRaceTime('tenk')}<br />

                    <b>1/2 Marathon Time</b>
                    {this.renderRaceTime('halfmarathon')}<br />


                    <b> Marathon Time</b>
                    {this.renderRaceTime('marathon')}<br />

                    <Button style={{ backgroundColor: 'rgb(0, 190, 120)' }} onClick={this.save}>Save Profile</Button>

                </Card>
            )
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

export default Edit;