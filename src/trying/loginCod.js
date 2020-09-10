import React, { Component } from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { login,error } from '../store/actionUser'
import { connect } from 'react-redux'
import '../styling/Style.css';

class LoginForm extends Component {
    state = {
        tz: '',
        regexp : /^[0-9\b]+$/,
        error: false,
        content: 'dfsdfs',
    }
    // componentDidMount(){
    //     localStorage.setItem("id","null");
    // }
    Change = (event) => {
        let tz = event.target.value;
        // if value is not blank, then test the regex
        if (tz === '' || this.state.regexp.test(tz)) {
            this.setState({ [event.target.name]: tz })
        }
        // /this.setState({ tz: event.target.value });
        this.setState({ error: false });
    }
    Save = () => {
        console.log("hear");
        console.log("lolo");
        this.props.getLogin(this.state.tz);
    }
    check = () => {
        if (this.state.tz.length !== 9) {
            this.setState({ content: 'מספר זהות לא חוקי' });
            this.setState({ error: true });
        }

        else {
            this.setState({ error: false });
            this.Save();
            // let id="null";
            // console.log("let")
            // console.log(id);
            // console.log("localhost")
            // console.log(localStorage.getItem("id"));
            // id = localStorage.getItem("id");
            // console.log("id from localhost")
            // console.log(id);
            // if (id === "null") {
            //     this.setState({ content: 'מספר זהות לא קיים במערכת' });
            //     this.setState({ error: true });
            //     id="null";
            // }
            // else
            //     this.setState({ error: false });
        }
    }

    render() {
        let {content} = this.state.content;
        return (
            <div> 
            
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 250 }}>
                    <Header as='h2' color='teal' textAlign='center'>
                        הכנס לאזור האישי
              </Header>
                    <Form size='massive'>
                        <Segment >
                            <Form.Input fluid icon='user' iconPosition='left'  value={this.state.tz} placeholder="מספר זהות" name="tz" onChange={(event) => this.Change(event)}
                                error={this.state.error === true ? {
                                    content: 'מספר זהות לא חוקי',
                                    pointing: 'below',
                                } : null}
                            />
                            <Button color='teal' fluid size='large' onClick={this.check}> Login</Button>
                        </Segment>
                    </Form>
                </Grid.Column>
            </Grid>
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
export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)