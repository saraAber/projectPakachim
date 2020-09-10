import React, { Component } from 'react'
import Axios from 'axios';

// import {Maps} from '../service/googleMaps'

class Continer extends Component {
    state = {
        tz: null
    }
    componentWillMount() {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }; 
            console.log(pos);
            Axios.get().then(x=>x.data)
            // this.setState({currentPlace: pos})    
        });
          
    }
    render() {
        // const item = this.props.selectuser ? ListTT : Login;
        return (
            <div>
            </div>
        )
    }
}

export default Continer; 