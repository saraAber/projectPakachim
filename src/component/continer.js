import React, { Component } from 'react'
import { login } from '../store/actionUser'
import { connect } from 'react-redux'
import ListTT from './TrafficAnomalies'
import Login from './login'
import { Route, Switch, Redirect } from 'react-router-dom'
import Another_driver from './Another_driver'
import logo from '../image/Logo.png'
class Continer extends Component {
    state = {
        tz: null
    }
    componentWillMount() {
        let id = localStorage.getItem("id");
        if (id != null) {
            this.state.tz = id
            this.props.getLogin(this.state.tz);
        }
    }
    render() {
        const nameStyle = {
            color: "teal",
            // marginLeft: "6vw",
            marginTop: "0",
        }
        const fixed = {
            position: "fixed",
            width: "100%",
            top: "0",
            backgroundColor: "white",
            zIndex: "3",
        }
        let route = null;
        if (this.props.selectuser != null) {
          route = (<Switch >
            <Route path="/noDriver" component={Another_driver} /> 
            <Route path="/TrafficViolatios" component={ListTT} /> 
            <Redirect exact from="/" to="/TrafficViolatios" />
            <Redirect path="**" to="/TrafficViolatios" />
          </Switch >)
        }
        else {
          route = (<Switch >
            <Route path="/login" component={Login} />
            <Redirect exact from="/" to="/login" />
            <Redirect path="**" to="/login" />
          </Switch >)
        }
        const name = this.props.selectuser ? <div style={fixed}> <img src={logo} alt="פקח וסע" /> <h1 style={nameStyle}> שלום {this.props.selectuser.Name}</h1> </div> : null
        const item = this.props.selectuser !== null ? ListTT : Login;
        return (
            <div>
                {name}
               {route}
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        selectuser: state.user.user
    }
}
const mapDispatchToProps = dispatc => {
    return {
        getLogin: (tz) => dispatc(login(tz))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Continer)