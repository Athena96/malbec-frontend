import React from "react";
import { SignIn } from "aws-amplify-react";
import '../App.css';
import Logo from "../static/images/logo192.png"

export class CustomSignIn extends SignIn {
  constructor(props) {
    super(props);
    this._validAuthStates = ["signIn", "signedOut", "signedUp"];
  }

  showComponent(theme) {
    return (
      <div className="signIn">
        <div className="mx-auto w-full max-w-xs" style={{ padding: '5px', backgroundColor: 'rgb(0, 190, 120)', borderRadius: "20px" }}>
          <div className="indentsignin">
            <h1 style={{ color: 'white' }}>Pack Finder<img alt="img" src={Logo} width="100" height="100"></img></h1>

            <h4 style={{ color: 'white' }}>Don't be a lone wolf<br />find your <b><i>pack</i></b>.</h4>
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4" style={{ padding: '5px'}}>
                <label
                  className="block text-grey-darker text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  <b>Username</b>
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline"
                  style={{ width: '100%' }}
                  id="username"
                  key="username"
                  name="username"
                  onChange={this.handleInputChange}
                  type="text"
                  placeholder="Username"
                />
              </div>
              <div className="mb-6" style={{ padding: '5px'}}>
                <label
                  className="block text-grey-darker text-sm font-bold mb-2"
                  htmlFor="password"
                >
                  <b>Password</b>
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{ width: '100%' }}
                  id="password"
                  key="password"
                  name="password"
                  onChange={this.handleInputChange}
                  type="password"
                  placeholder="******************"
                />
                <p className="text-grey-dark text-xs">
                  Forgot your password?{" "}
                  <a
                    className="text-indigo cursor-pointer hover:text-indigo-darker"
                    onClick={() => super.changeState("forgotPassword")}
                    style={{ color: 'blue' }}
                  >
                    Reset Password
              </a>
                </p>
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="login"
                  type="button"
                  onClick={() => super.signIn()}
                  
                >
                  <h5>Login</h5>
                </button>

                <button
                  className="create"
                  type="button"
                  onClick={() => super.changeState("signUp")}
                >
                  <h5>Create Account</h5>
                </button>

              </div>
            </form>
          </div>
        </div>
      </div>

    );
  }
}