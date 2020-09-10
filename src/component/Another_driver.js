import React, { Component } from 'react'
import { Button, Form, Container, Input, Header, Message } from 'semantic-ui-react'
import axios from 'axios'
import car from '../image/cars.png'
import { isValidIsraeliID } from '../store/actionUser'
import { connect } from 'react-redux'
import { status } from '../store/actionUser'

class FromUpdate extends Component {

  state = {
    tzDriverOfDrive: '',
    numOfCar: '',
    regexp: /^[0-9\b]+$/,
    error: false,
    messageTZ: '',
    messageNumOfCar: '',
    disable:false
  }
  onHandleTelephoneChange = e => {
    console.log(e.target.name);
    this.setState({ error: false })
    let temp = e.target.value;
    // if value is not blank, then test the regex
    if (temp === '' || this.state.regexp.test(temp)) {
      this.setState({ [e.target.name]: temp });
    }
  };
  check = () => {

    this.setState({ messageTZ: '' });
    this.setState({ messageNumOfCar: '' });
    var Errors = { ...this.state.error }
    if (this.state.tzDriverOfDrive.length < 9 || !isValidIsraeliID(this.state.tzDriverOfDrive) || this.state.tzDriverOfDrive == this.props.selectuser.TZ || this.state.numOfCar.length < 7 || this.state.numOfCar.length > 8 || this.state.numOfCar == this.props.selectuser.NumberOfCar) {
      if (this.state.tzDriverOfDrive.length < 9 || !isValidIsraeliID(this.state.tzDriverOfDrive) || this.state.tzDriverOfDrive == this.props.selectuser.TZ){
        Errors = true;
        this.setState({ messageTZ: ',מספר זהות לא חוקי' });
      }
      if (this.state.numOfCar.length < 7 || this.state.numOfCar.length > 8 || this.state.numOfCar == this.props.selectuser.NumberOfCar) {
        Errors = true;
        this.setState({ messageNumOfCar: ',מספר רכב לא חוקי' });
      }
      this.setState({ error: Errors });
    }
    else{
      this.addUpdating();
    } 
     
  }
  addUpdating = () => {
    this.setState({disable:true});
    const Update = {
      Id: null,
      Date: null,
      TZUpdate: this.props.selectuser.TZ,
      TZDrive: this.state.tzDriverOfDrive,
      NumberOfCar: this.state.numOfCar,
    }
    axios.post("http://localhost:52726/api/updating", Update).then(
      x => {
        this.props.history.replace("/TrafficViolatios");
        this.props.StatusFalse();
        console.log(x.data);
      }
    ).catch(x => {

    });
  }
  render() {
    const { messageTZ, messageNumOfCar,disable } = this.state
    const input = {
      width: "70vw",
    }
    const mystyle = {
      textAlign: "centert",
      color: "teal",
    };
    const error = this.state.error === true ? <Message compact negative style={{ margin: "auto" }}>
      <p>{messageTZ} {messageNumOfCar}</p>
    </Message> : null
    return (<Container textAlign='center' style={{ marginTop: "45vw" }}>
      <Header as='h2' color="teal">אני לא הנהג</Header>
      {error}
      <Form onSubmit={this.check}>
        <Form.Field required>
          <label style={mystyle} >מספר זהות נהג</label>
          <Input
            icon="address card"
            name="tzDriverOfDrive"
            type="text"
            style={input}
            value={this.state.tzDriverOfDrive}
            placeholder="מספר זהות נהג"
            onChange={this.onHandleTelephoneChange} />

        </Form.Field >
        <Form.Field required>
          <label style={mystyle} >מספר רכב</label>
          <Input
            icon="car"
            name="numOfCar"
            value={this.state.numOfCar}
            type="text"
            style={input}
            value={this.state.numOfCar}
            placeholder="מספר רכב"
            onChange={this.onHandleTelephoneChange} />

        </Form.Field >
        <Button type='submit' color="teal" disabled={disable}>שמור</Button>
      </Form>
      <Message
        color="teal"
        info
        header='?הידעת'
        content="מספר ההרוגים בתאונות גבוה ממספר ההרוגים ממלחמות ומפיגועי הטרור"
      />
      <img src={car}></img>
      <a href="http://www.freepik.com">image by Freepik</a>
    </Container>
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
    StatusFalse: () => dispatc(status(false))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(FromUpdate);
