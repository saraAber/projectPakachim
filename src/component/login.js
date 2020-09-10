import React, { Component } from 'react'
import {  Form,  Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { login,error,isValidIsraeliID } from '../store/actionUser'
import '../styling/login.css';
class LoginForm extends Component {
    state = {
        tz: '',
        regexp: /^[0-9\b]+$/,
        error: false,
        NotFound:true,
    }
    Change = (event) => {
        this.setState({ NotFound: true });
        let tz = event.target.value;
        // if value is not blank, then test the regex
        if (tz === '' || this.state.regexp.test(tz)) {
            this.setState({ [event.target.name]: tz })
        }
        this.setState({ error: false });       
    }
    Save = () => {
        console.log("hear");
        console.log("lolo");
        this.props.getLogin(this.state.tz);
    }
    componentDidUpdate() {
        console.log("did UPDATE")
        if (this.props.selectuser) {
            this.props.history.replace("/TrafficViolatios");
          }
        if (this.state.NotFound && this.props.error === true) {
            this.setState({ NotFound: false });
            this.props.ErrorFalse();
        }
    }
    check = () => {
        if (!isValidIsraeliID(this.state.tz)) {
            this.setState({ error: true });
        }
        else {
            this.setState({ error: false });
            this.Save();
        }
    }
    render() {
        const {NotFound,error}=this.state
        const worng =  !NotFound===true? <p>אינך רשום במערכת או שישנה תקלה</p> : null;
        return (
            <div className="continer">
                <div className="blurred-box">
                    <div className="user-login-box">
                        <Header as="h2" color="teal" >כניסה</Header>
                        <br />
                        <Form.Input fluid icon='user' iconPosition='left' value={this.state.tz} placeholder="מספר זהות" name="tz" onChange={(event) => this.Change(event)}
                            error={error === true ? {
                                content: 'מספר זהות לא חוקי',
                                pointing: 'below',
                            } : null}
                        />
                        {worng}
                        <div className="login-box">
                            <br /><br /><br /><br /><br /><br /><br /><br /><br />
                            <div>
                                <a href="#" onClick={this.check}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                   Login
                                   </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        error: state.user.error,
        selectuser: state.user.user,
    }
}
const mapDispatchToProps = dispatc => {
    return {
        getLogin: (tz) => dispatc(login(tz)),
        ErrorFalse: () => dispatc(error(false))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)

