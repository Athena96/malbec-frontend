import React, { Component } from 'react';
import '../App.css';

import { Card, Button } from 'react-mdl';
import { Link } from "react-router-dom";

import { Auth, Storage } from 'aws-amplify';
import { getNiceTime } from '../helpers/TimeHelper';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'


/// State
// {
//   userprofile: {
//     name: "",
//     email: "",
//     profilepic: "",
//     ....,
//     usertimes: {
//       fivek: {

//       },
//       tenk: {

//       }
//     }
//   },

//   matchprofile: {
//     name: "",
//     email: "",
//     profilepic: "",
//     ....,
//     usertimes: {
//       fivek: {

//       },
//       tenk: {

//       }
//     }
//   },


//   matches: [
//     {
//       match1...
//     },
//     {
//       match2...
//     }
//   ]
// }

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
  
        const signedURL = await Storage.get(result[0].key); // get key from Storage.list
  
        console.log('signedURL: ' + signedURL);
        currentComponent.setState({
            myprofileProfileImage: signedURL
        });
      })
      .catch(err => console.log(err));



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
  imageUpdload = async function (e) {
    const file = e.target.files[0];
    console.log('file: ' + JSON.stringify(file));

    // delete whats in user/*


    // then put

    try {

      Storage.list(this.state.runnerid + '/') // for listing ALL files without prefix, pass '' instead
    .then( async result => {
      console.log(result);
      for (const f of result) {
        console.log('deleting: ' + f.key);
        await Storage.remove(f.key);
      }
    })
    .catch(err => console.log(err));


      await Storage.put(this.state.runnerid + '/' + file.name, file, {
        contentType: 'image/png' // contentType is optional
      });

      const signedurl = await Storage.get(this.state.runnerid + '/' + file.name); // get key from Storage.list


      this.setState({
        profileImage: signedurl
      });

      this.save();

    } catch (error) {
      console.log('Error uploading file: ', error);
    }  
  }


  save() {
    console.log("save");

    const runner = {
      "location": this.state.location,
      "firstname": this.state.firstname,
      "runnerid": this.state.runnerid,
      "email": this.state.email,
      "phone": this.state.phone,
      "gender": this.state.gender,
      "coordinates": this.state.coordinates,
      "birthday": this.state.birthday,
      "profilepic": this.state.profileImage
    }


    var unirest = require("unirest");
    unirest.put(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/runners`)
      .header('Accept', 'application/json')
      .send(JSON.stringify(runner))
      .end(function (res) {


        if (res.error) {
          alert("Your subscription request failed, please try again later.");
          return
        }

        alert("Saved your runner profile!");

        console.log(res.raw_body);
        return
      });

  }


  // getRaceTimes(race, runnerid) {
  //   var unirest = require("unirest");
  //   unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times?runnerid=${runnerid}`)
  //     .header('Accept', 'application/json')
  //     .end(function (res) {
  //       console.log('HERRR');
  //       console.log('runnerid ' + runnerid);

  //       console.log(res.raw_body);
        
  //       const times = JSON.parse(res.raw_body);

  //       const rows = [];
  //       for (const time of times) {
  //           if (time.race === race) {
  //               rows.push(
  //                 <li>{time.date} - {getNiceTime(time.time)} - </li>
  //               );
  //           }
  //       }
  //       return rows;
  //     });
  // }

  deleteRaceTime(event) {
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

  saveRaceTime(event) {
    console.log('event: ' + event.target.id);

    const raceType = event.target.id;
    console.log(raceType);
    console.log(this.state);
    const time = {
        "link": this.state[raceType].link,
        "race": raceType,
        "location": this.state.location,
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
                <button id={race} key={race} onClick={this.saveRaceTime} >Save</button>
                {this.state[race].timeid ? <button id={race} key={race} onClick={this.deleteRaceTime} >Delete</button> : <></>}

            </Card>);

    } else {
        return (
            <Card key={race} id={race} shadow={0} style={cardStyle}>
            </Card>
        );
    }
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

  renderUserProfile() {
    const cardStyle = { borderWidth: '5px', borderRadius: "5px", margin: '10px', marginBottom: '10px', padding: '25px' };

    if (this.state['myprofile']) {
      console.log(`this.state['myprofile'] ` + this.state['myprofile'].runnerid);
      return (
        <Card shadow={0} style={cardStyle}>

          <img src={this.state.myprofileProfileImage} alt="Illinois Matahon 2018" style={{ maxWidth: "300px" }} border="5" />
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
              value={this.state['myprofile'].firstname}
              onChange={this.handleChange} />
          </label><br />
          <label>
            <b>Location:</b><br />
            <input
              className="rounded"
              name="location"
              type="text"
              value={this.state['myprofile'].location}
              onChange={this.handleChange} />
          </label><br />


          <label>
            <b>Birthday:</b><br />
            <input
              className="rounded"
              name="birthday"
              type="date"
              value={this.state['myprofile'].birthday}
              onChange={this.handleChange} />
          </label><br />

          <b>Gender:</b>
          <div className="radio">
            <label>
              <input type="radio" name='gender' value={1}
                checked={this.state['myprofile'].gender === 1}
                onChange={this.handleChange} />
              Woman
            </label>
          </div>
          <div className="radio">
            <label>
              <input type="radio" name='gender' value={2}
                checked={this.state['myprofile'].gender === 2}
                onChange={this.handleChange} />
              Man
            </label>
          </div>


          <h5><b>5k Time</b></h5>
          {this.renderRaceTime('fivek')}


          <h5><b>10K Time</b></h5>
                    {this.renderRaceTime('tenk')}

                    <h5><b>1/2 Marathon Time</b></h5>
                    {this.renderRaceTime('halfmarathon')}


                    <h5><b> Marathon Time</b></h5>
                    {this.renderRaceTime('marathon')}

          {/* <h5><b>10K Times</b></h5>
          <ul>
          {this.getRaceTimes('tenk') ? this.getRaceTimes('tenk') : <Link to="/times">Click to add race times</Link>}
          </ul>


          <h5><b>1/2 Marathon Times</b></h5>
          <ul>

          {this.getRaceTimes('halfmarathon') ? this.getRaceTimes('halfmarathon') : <Link to="/times">Click to add race times</Link>}

          </ul>

          <h5><b> Marathon Times</b></h5>
          <ul>
          {this.getRaceTimes('marathon') ? this.getRaceTimes('marathon') : <Link to="/times">Click to add race times</Link>}
          </ul> */}

          <h5><b> Contact Info</b></h5>
          <ul>

            <label>
              <b>Phone Number:</b><br />
              <input
                className="rounded"
                name="phone"
                type="phone"
                value={this.state['myprofile'].phone}
                onChange={this.handleChange} />
            </label><br />

            <label>
              <b>Email:</b><br />
              <input
                className="rounded"
                name="phone"
                type="phone"
                value={this.state['myprofile'].email}
                onChange={this.handleChange} />
            </label><br />

          </ul>

          <Button style={{ background: 'grey' }} onClick={this.save}>Save</Button>

        </Card>
      )
    }
  }

  renderProfile(profileToLoad) {
    const cardStyle = { borderWidth: '5px', borderRadius: "5px", margin: '10px', marginBottom: '10px', padding: '25px' };

    console.log("(this.state.myprofileProfileImage && profileToLoad === 'myprofile'): " + (this.state.myprofileProfileImage && profileToLoad === 'myprofile'));
      if (this.state[profileToLoad] && ((this.state.myprofileProfileImage && profileToLoad === 'myprofile') || (this.state.selectedmatchProfileImage && profileToLoad === 'selectedmatch'))) {
          return (
                <Card shadow={0} style={cardStyle}>
                <img src={profileToLoad === 'myprofile' ? this.state.myprofileProfileImage : this.state.selectedmatchProfileImage} alt="profile" style={{ maxWidth: "300px" }} border="5" />
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
  
        const signedURL = await Storage.get(result[0].key); // get key from Storage.list
  
        console.log('signedURL: ' + signedURL);
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
    const cardStyle = { wordWrap: 'break-word',  borderRadius: "5px",   padding: '25px' };

    if (this.state.matches && this.state.matches[race]) {
      // console.log("ate.matches" + JSON.stringify(this.state.matches));
      // console.log("this.state.matches[ace] " + JSON.stringify(this.state.matches[race]));

      let matchesForRace = [];
      let i = 0;
      for(const match of this.state.matches[race]) {
        matchesForRace.push(

          <Card id={match.runnerid} key={match.runnerid+i} shadow={0} style={cardStyle} onClick={this.open}>
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
                {this.renderMatchesForRace('tenk')}

                <h5><b>1/2 Marathon Matches</b></h5>
                {this.renderMatchesForRace('halfmarathon')}

                <h5><b> Marathon Matches</b></h5>

                {this.renderMatchesForRace('marathon')}
              
              </Col>


              <Col>
              <h3><b>Match</b></h3>
              {this.renderProfile('selectedmatch')}
              </Col>


            </Row>

          </Container>

        </div>



      );
    

  }
}

export default Home;
