




import React, { Component } from 'react';
import '../App.css';

import { Card, Button } from 'react-mdl';
import { Auth } from 'aws-amplify';

// import {getSecondsFromTimeString,getNiceTime} from '../helpers/TimeHelper';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import TstProfilePic from "../static/images/beach-bum.png"
var IS_UPDATE = false;

class Times extends Component {

    constructor(props) {
        super(props);
        this.state = {
            windowWidth: window.innerWidth,
            runnerLoading: true,
            timesLoading: true,
        };


        this.handleResize = this.handleResize.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.save = this.save.bind(this);
        this.delete = this.delete.bind(this);

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

        const nameRace = target.name.split("-");
        var race = nameRace[0];
        var name = nameRace[1];


        const currTime = this.state[race];

        if (name === "gender") {
            value = parseInt(value);
        }

        currTime[name] = value;

        this.setState({
            [race]: currTime
        });
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
        var currentComponent = this;

        this.getCurrentUserEmail().then((response) => {

            var unirest = require("unirest");
            unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times?runnerid=${response}`)
                .header('Accept', 'application/json')
                .end(function (res) {
                    const timesBody = JSON.parse(res.raw_body);
                    
                    const timesBodyMap = {}
                    for (const time of timesBody) {
                        const race = time.race;
                        timesBodyMap[race] = time;
                    }

                    const raceTypes = ['fivek', 'tenk', 'halfmarathon', 'marathon'];
                    for (const race of raceTypes) {
                        if (timesBodyMap[race]) {
                            currentComponent.setState({
                                [race]: timesBodyMap[race]
                            });
                        } else {
                            currentComponent.setState({
                                [race]: {

                                }
                            });
                        }
                    }

                    // for (const time of timesBody) {
                    //     const race = time.race;
                    //     currentComponent.setState({
                    //         [race]: time
                    //     });
                    // }


                    currentComponent.setState({
                        timesLoading: false,
                        runnerid: response
                    });

                    if (res.error) {
                        alert("Your subscription request failed, please try again later.");
                        return
                    }

                    // alert(JSON.stringify(currentComponent.state));
                    return
                });

        });


    }

    componentWillUnmount() {
        window.addEventListener("resize", this.handleResize);
    }


    delete(event) {
        console.log('event: ' + event.target.id);
        const raceType = event.target.id;
        const timeid = this.state[raceType].timeid;
        let currentComponent = this;
        var unirest = require("unirest");
        unirest.delete(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times?timeid=${timeid}`)
        .header('Accept', 'application/json')
        .end(function (res) {
          if (res.error) {
            alert("Failed to delete time");
            return
          }

          currentComponent.setState({
              [raceType]: {}
          });
          
          alert("Successfully deleted your race time!");
          console.log(res.raw_body);
          return
        });
    }

    save(event) {
        console.log('event: ' + event.target.id);

        const raceType = event.target.id;
        console.log(raceType);
        console.log(this.state);
        console.log(this.state[raceType]);
        const time = {
            "link": this.state[raceType].link,
            "race": raceType,
            "date": this.state[raceType].date,
            "runnerid": this.state.runnerid,
            "time": Number(this.state[raceType].time)
        }
        var unirest = require("unirest");
        
        if (this.state[raceType].timeid) {
            time['timeid'] = this.state[raceType].timeid;
            console.log('sending: ' + JSON.stringify(time));

            unirest.put(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times`)
              .header('Accept', 'application/json')
              .send(JSON.stringify(time))
              .end(function (res) {
    
    
                if (res.error) {
                  alert("Failed to save time");
                  return
                }
    
                alert("Successfully saved your race time!");
                console.log(res.raw_body);
                return
              });
    
        } else {
            time['timeid'] = "" + (new Date()).getTime();
            console.log('sending NEW: ' + JSON.stringify(time));
            unirest.post(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times`)
              .header('Accept', 'application/json')
              .send(JSON.stringify(time))
              .end(function (res) {
                if (res.error) {
                  alert("Failed to save time");
                  return
                }
    
                alert("Successfully saved your race time!");
                console.log(res.raw_body);
                return
              });
    
        }
        


    }



    renderRaceTime(race) {
        const cardStyle = { borderWidth: '5px', borderRadius: "5px", margin: '10px', marginBottom: '10px', padding: '25px' };
        console.log('here: ' + JSON.stringify(this.state));

        if (this.state[race]) {

            return (

                <Card id={race} key={race} shadow={0} style={cardStyle}>
                    <label>
                        <b>Time:</b><br />
                        <input
                            className="rounded"
                            name={`${race}-time`}
                            type="text"
                            value={this.state[race].time}
                            onChange={this.handleChange} />
                    </label><br />
                    <label>
                        <b>Date:</b><br />
                        <input
                            className="rounded"
                            name={`${race}-date`}
                            race={race}
                            type="date"
                            value={this.state[race].date}
                            onChange={this.handleChange} />
                    </label><br />
                    <label>
                        <b>Race Time Link:</b><br />
                        <input
                            className="rounded"
                            name={`${race}-link`}
                            type="text"
                            race={race}

                            value={this.state[race].link}
                            onChange={this.handleChange} />
                    </label><br />
                    <button id={race} key={race} onClick={this.save} >Save</button>
                    {this.state[race].timeid ? <button id={race} key={race} onClick={this.delete} >Delete</button> : <></>}


                </Card>);

        } else {
            return (
                <Card key={race} id={race} shadow={0} style={cardStyle}>
                </Card>
            );
        }
    }

    render() {


        const cardStyle = { borderWidth: '5px', borderRadius: "5px", margin: '10px', marginBottom: '10px', padding: '25px' };

        if (!this.state.timesLoading) {

            return (

                <div>
                    <h3><b>My Times</b></h3>

                    <h5><b>5k</b></h5>

                    {this.renderRaceTime('fivek')}

                    <h5><b>10K </b></h5>
                    {this.renderRaceTime('tenk')}

                    <h5><b>1/2 Marathon Times</b></h5>
                    {this.renderRaceTime('halfmarathon')}


                    <h5><b> Marathon Times</b></h5>
                    {this.renderRaceTime('marathon')}

                </div>
            );
        } else {
            return (

                <p>loading ....</p>
            );
        }




    }
}

export default Times;


