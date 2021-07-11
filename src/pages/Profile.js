import React, { Component } from 'react';
import '../App.css';

import { Card, Button } from 'react-mdl';
import { Auth, Storage } from 'aws-amplify';

import { Link } from "react-router-dom";

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
var IS_UPDATE = false;

class Profile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      windowWidth: window.innerWidth,
      runnerLoading: true,
      timesLoading: true,
    };

    IS_UPDATE = props.history.location.pathname.split('/')[1] === "update";

    this.handleResize = this.handleResize.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.save = this.save.bind(this);
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

    this.getCurrentUserEmail().then((response) => {
      if (IS_UPDATE) {

        Storage.list(`${response}/`) // for listing ALL files without prefix, pass '' instead
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
        unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/runners?runnerid=${response}`)
          .header('Accept', 'application/json')
          .end(function (res) {
            console.log(res.raw_body);

            const runnerBody = JSON.parse(res.raw_body);

            currentComponent.setState({
              firstname: runnerBody.firstname,
              location: runnerBody.location,
              runnerid: runnerBody.runnerid,
              coordinates: runnerBody.coordinates,
              gender: runnerBody.gender,
              birthday: runnerBody.birthday,
              phone: runnerBody.phone,
              email: runnerBody.email,
              runnerLoading: false
            });
            if (res.error) {
              alert("Your subscription request failed, please try again later.");
              return
            }

            // alert(JSON.stringify(currentComponent.state));
            return
          });


        unirest.get(`https://om4pdyve0f.execute-api.us-west-2.amazonaws.com/prod/times?runnerid=${response}`)
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
          <li><Link to="/times"> (click to edit race times) {time.date} - {time.time}</Link></li>

        );
      }
    }
    return rows.length > 0 ? rows : null;
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

  renderUserProfile() {
    const cardStyle = { borderWidth: '5px', borderRadius: "5px", margin: '10px', marginBottom: '10px', padding: '25px' };

    if (this.state && !this.state.runnerLoading && !this.state.timesLoading) {
      console.log('this.state.profileImage: ' + this.state.profileImage);
      return (
        <Card shadow={0} style={cardStyle}>

          <img src={this.state.profileImage} alt="Illinois Matahon 2018" style={{ maxWidth: "300px" }} border="5" />
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
              value={this.state.firstname}
              onChange={this.handleChange} />
          </label><br />
          <label>
            <b>Location:</b><br />
            <input
              className="rounded"
              name="location"
              type="text"
              value={this.state.location}
              onChange={this.handleChange} />
          </label><br />


          <label>
            <b>Birthday:</b><br />
            <input
              className="rounded"
              name="birthday"
              type="date"
              value={this.state.birthday}
              onChange={this.handleChange} />
          </label><br />

          <b>Gender:</b>
          <div className="radio">
            <label>
              <input type="radio" name='gender' value={1}
                checked={this.state.gender === 1}
                onChange={this.handleChange} />
              Woman
            </label>
          </div>
          <div className="radio">
            <label>
              <input type="radio" name='gender' value={2}
                checked={this.state.gender === 2}
                onChange={this.handleChange} />
              Man
            </label>
          </div>


          <h5><b>5k Times</b></h5>
          <ul>
            {this.getRaceTimes('fivek') ? this.getRaceTimes('fivek') : <Link to="/times">Click to add race times</Link>}
          </ul>


          <h5><b>10K Times</b></h5>
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
          </ul>

          <h5><b> Contact Info</b></h5>
          <ul>

            <label>
              <b>Phone Number:</b><br />
              <input
                className="rounded"
                name="phone"
                type="phone"
                value={this.state.phone}
                onChange={this.handleChange} />
            </label><br />

            <label>
              <b>Email:</b><br />
              <input
                className="rounded"
                name="phone"
                type="phone"
                value={this.state.email}
                onChange={this.handleChange} />
            </label><br />

          </ul>

          <Button style={{ background: 'grey' }} onClick={this.save}>Save</Button>

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

export default Profile;