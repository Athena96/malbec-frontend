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
    this.state = { 
        windowWidth: window.innerWidth,
        runner: null,
        times: null
    };
    this.handleResize = this.handleResize.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

  }

  handleResize(e) {
    this.setState({ windowWidth: window.innerWidth });
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    var currentComponent = this;

    var unirest = require("unirest");
    unirest.get("https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/runners?runnerid=k30d3904r90")
      .header('Accept', 'application/json')
    //   .send(JSON.stringify(objToSending))
      .end(function (res) {
          const runnerBody = JSON.parse(res.raw_body);
        currentComponent.setState({
          runner: runnerBody
        });

        /*
        {"location":"Seattle, WA","runnerid":"k30d3904r90","name":"jared","coordinates":"230293489230.342232423","gender":0,"birthday":"04-25-1996"} */
        if (res.error) {
          alert("Your subscription request failed, please try again later.");
          return
        }
        console.log(res.raw_body);

        // alert(JSON.stringify(currentComponent.state.runner));
        return
      });


      unirest.get("https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times?runnerid=k30d3904r90")
      .header('Accept', 'application/json')
    //   .send(JSON.stringify(objToSending))
      .end(function (res) {
          const timesBody = JSON.parse(res.raw_body);
        currentComponent.setState({
          times: timesBody
        });

        /*
        {"location":"Seattle, WA","runnerid":"k30d3904r90","name":"jared","coordinates":"230293489230.342232423","gender":0,"birthday":"04-25-1996"} */
        if (res.error) {
          alert("Your subscription request failed, please try again later.");
          return
        }
        console.log(res.raw_body);

        // alert(JSON.stringify(currentComponent.state.runner));
        return
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
                <li>{time.date} - {time.time} - </li>

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
                <h4><b>{this.state.runner.name}</b></h4>

                <h5><b>{this.state.runner.location}</b></h5>

                <h5><b>{this.state.runner.birthday}</b></h5>


                <h5><b>{this.state.runner.gender === 0 ? "Man" : "Woman"}</b></h5>

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


  render() {

   return (

    <div>
        {this.renderUserProfile()}

    </div>

   );

  }
}

export default Home;