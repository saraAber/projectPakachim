import React, { Component } from 'react';

class AllowOnlyNumber extends Component {
    constructor(props) {
        super(props);
        this.onHandleTelephoneChange = this.onHandleTelephoneChange.bind(this);  
        this.state = {
            telephone: '',
            regexp : /^[0-9\b]+$/
        }   
    }
    
    onHandleTelephoneChange = e => {
        let telephone = e.target.value;

        // if value is not blank, then test the regex
        if (telephone === '' || this.state.regexp.test(telephone)) {
            this.setState({ [e.target.name]: telephone })
        }
    };

    render() {
        return (
            <div>
                < label >Allow only numbers in Input (React) : </ label >
                < input
                 name="telephone" placeholder="Telephone Number"
                    value={this.state.telephone}
                    onChange={this.onHandleTelephoneChange} />
            </div>
        );
    }
}
export default AllowOnlyNumber;