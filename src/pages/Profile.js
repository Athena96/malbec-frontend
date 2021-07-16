import React, { Component } from 'react';
import '../App.css';

import { Card, Button } from 'react-mdl';
import { Auth, Storage } from 'aws-amplify';

import { Link } from "react-router-dom";

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
        unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/runners?runnerid=${this.state.runnerid}`)
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


        unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times?runnerid=${this.state.runnerid}`)
          .header('Accept', 'application/json')
          //   .send(JSON.stringify(objToSending))
          .end(function (res) {
            console.log(res.raw_body);

            const timesBody = JSON.parse(res.raw_body);
            console.log(timesBody);
            currentComponent.setState({
              times: timesBody,
              timesLoading: false

            });

            if (res.error) {
              alert("Your subscription request failed, please try again later.");
              return
            }
            console.log(res.raw_body);

            // alert(JSON.stringify(currentComponent.state));
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
          <li> {time.date} - {time.time}</li>

        );
      }
    }
    return rows.length > 0 ? rows : null;
  }

  renderUserProfile() {
    const cardStyle = { borderWidth: '5px', borderRadius: "5px", padding: '15px' };
      if (this.state && this.state.profileImage) {
          return (
                <Card shadow={0} style={cardStyle}>
                <img src={this.state.profileImage} alt="profile" style={{ maxWidth: "300px" }} border="5" />
                
                {this.state.signedInRunner.message ? <h5><b>Message:</b> {this.state.signedInRunner.message}</h5> : <></>}

                <h5><b>Name:</b> {this.state.signedInRunner.firstname}</h5>

                <h5><b>Location:</b> {this.state.signedInRunner.location}</h5>

                <h5><b>Birthday:</b> {this.state.signedInRunner.birthday}</h5>

                <h5><b>Gender:</b> {this.state.signedInRunner.gender ? (this.state.signedInRunner.gender === 1 ? "Woman" : "Man") : <></> }</h5>

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