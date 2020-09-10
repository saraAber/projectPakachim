import React, { Component } from 'react'
import { List, Icon, Button, Header,Message } from 'semantic-ui-react'
import axios from 'axios'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import Load from './public/loading'
import ActualRun from '../service/ActualRun'

class ListTT extends Component {
    state = {
        mail: null,
        TrT: [],
    }
    send = () => {
        this.setState({ mail: "load" });
        axios.get("http://localhost:52726/api/driver?idDriver=" + this.props.selectuser.Id).then(x => {
            if (x.data == null) {
                this.setState({ mail: "המערכת נתקלה בבעיה,המייל לא נשלח." });
            }
            else {
                this.setState({ mail: x.data });
            }
        }).catch(x => {
            this.setState({ mail: "המערכת נתקלה בבעיה,המייל לא נשלח." });
        });
    }
    componentDidMount() {
        console.log(this.props.selectuser.TrafficViolations);
        if (this.props.selectuser.TrafficViolations.length != 0) {
            this.setState({ TrT: this.props.selectuser.TrafficViolations });
        }
        else {
            this.setState({ TrT: null });
        }
    }
    render() {
        const mail = this.state.mail === "load" ? <Load /> : this.state.mail;
        const header=this.state.TrT? <Header as="h1" color="grey">:להלן רשימת החריגות שלך</Header>:<div> <Header as="h2" color="grey">!כל הכבוד</Header><Header as="h2" color="grey">.לשמחתנו לא נמצאו חריגות על שימך</Header><br/> <img src="//www.galgalim.co.il/tpl/website/img/page_loading.gif" alt="כל הכבוד"></img></div>;
        const tt = this.state.TrT ? <List celled verticalAlign='middle'>{ this.state.TrT.map(x => <List.Item key={x.Id}><Icon circular inverted color='teal' corner='top left' name='car' /> <List.Header> חריגה ב: {x.City} {x.District}</List.Header> <List.Description> .מכביש {x.StartRoad} ועד כביש {x.EndRoad} ,מהירות ממוצעת של   {x.SpeedMeasured} קמ"ש, ומהירות מקסימלית של {x.SpeedMax} קמ"ש</List.Description></List.Item>)}</List> :null;
            
        return (
            <div style={{ marginTop: "50vw" }}>
               {header}   
                    {tt}
                <Button onClick={this.send} color="teal" disabled={this.props.selectuser.TrafficViolations == 0 ? true : false}> שלח לי למייל</Button>
                <NavLink to="/noDriver"><Button color="teal" disabled={!this.props.selectuser.Status} >אני לא הנהג</Button></NavLink><br />
                <Header as="h4" color="grey">{mail}</Header>
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        selectuser: state.user.user
    }
}
export default connect(mapStateToProps)(ListTT);