import React, { Component } from 'react'
import './log.css';
export default class LoginForm extends Component {
    render() {
        return (

            <div class="continer">
                <div id="signin">
                    <div class="form-title">Sign in</div>
                    <div class="input-field">
                        <input type="email" id="email" autocomplete="off" />
                        <i class="material-icons">email</i>
                        <label for="email">Email</label>
                    </div>
                    <div class="input-field">
                        <input type="password" id="password" />
                        <i class="material-icons">lock</i>
                        <label for="password">Password</label>
                    </div>
                    <a href="" class="forgot-pw">Forgot Password ?</a>
                    <button class="login">Login</button>
                    <div class="check">
                        <i class="material-icons">check</i>
                    </div>
                </div>
                <div id="gif">
                    <a href="https://dribbble.com/shots/2197140-New-Material-Text-Fields">
                        <img src="https://d13yacurqjgara.cloudfront.net/users/472930/screenshots/2197140/efsdfsdae.gif" alt="" />
                    </a>
                </div>
            </div>
        )
    }
}