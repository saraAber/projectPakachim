//הפונקציה ששרהלה כתבה
// בפונקציה אני קבלת את המיקום מגוגל מפס
//1=הליכה 
//2=נסיעה
//3=חריגה
//lat=אורך  lng=רוחב
//cntRest המשתנה הזה הוא בשביל לבדוק אם חריגה הסתימה או שהוא בעצירה באמצע חריגה לדוגמא רמזור

import { WarningNotification, UpdateNotification } from '../component/Notification/addNotification'
import { locations, AddMiles } from './Locations'
import React, { Component } from 'react'
import axios from 'axios';
import { connect } from 'react-redux'
import { status } from '../store/actionUser'
class ActualRun extends Component {
    state = {
        //מיקום ברירת מחדל סמינר מאיר
        //32.0900715,34.8390216
        DriverId: this.props.selectuser.Id,
        Cell_phone_mileage: 0,
        currentPlace: null,
        //המשתנים שקשורים למצב חריגה
        violation: {
            Id: 0,
            Begineviolation: null,
            maxSpeed: 0,
            sumSpeed: 0,
            cntRest: 0,
            SpeedLimit: 50,
            cnt: 0,
        },
        status: 1,
        cntGo: 0,
    }
    timer(pos) {
        this.setState({ currentPlace: "רבי עקיבא/רש''י, בני ברק" });
        console.log(this.props.selectuser.Status);
        // console.log("timer");
        // console.log(this.state.currentPlace);
        var that = this;
        var i = 0;
        setInterval(function () {/////
            if (locations[i] === undefined)
                i = 0;
            console.log(that.state.currentPlace);
            var pos = null;
            navigator.geolocation.getCurrentPosition(function (position) {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                // console.log(pos);
                if (pos.lng === that.state.currentPlace.lng || pos.lat !== that.state.currentPlace.lat) {
                    var speed = 0;
                    var distance = null;
                    //Checking the distance between two locations by interfacing with Google Maps.
                    const google = window.google;
                    var origin = that.state.currentPlace;
                    var destination = locations[i];
                    var service = new google.maps.DistanceMatrixService();
                    service.getDistanceMatrix(
                        {
                            origins: [origin],
                            destinations: [destination],
                            travelMode: 'DRIVING',
                        }, callback);
                    function callback(response, status) {
                        console.log(response);
                        distance = response.rows[0].elements[0].distance.value;
                        console.log("distance");
                        console.log(distance);
                        speed = (distance / 1000) * 60;
                        ////Check if the user has started a trip
                        if (speed > 6) {
                            const miles = { ...that.state.Cell_phone_mileage };
                            miles += (distance / 1000);
                            this.setState({ Cell_phone_mileage: miles });
                            if (that.state.status === 1) {
                                console.log("התחלת נסיעה!!!!!!!!!");
                                UpdateNotification();
                                that.setState({ status: 2 });
                            }
                            axios.get("http://localhost:52726/api/TrafficViolation").then(x => {
                                const newviolation = { ...this.state.violation };
                                newviolation.SpeedLimit = x.data;
                                this.setState({ violation: newviolation });

                                //Check whether the driver under surveillance is the driver of this trip.
                                if (that.props.selectuser.Status) {
                                    if (speed > that.state.violation.SpeedLimit) {
                                        //Check if the violation starts now.
                                        if (that.state.status !== 3) {
                                            that.BegineAviolation(speed);
                                        }
                                        else {
                                            const newviolation = { ...that.state.violation };
                                            newviolation.sumSpeed += speed;
                                            newviolation.cnt++;
                                            if (speed > that.state.violation.maxSpeed)
                                                newviolation.maxSpeed = speed;
                                            console.log(newviolation)
                                            that.setState({ violation: newviolation });
                                        }
                                    }
                                    else {
                                        that.setState({ cntGo: 0 });
                                        if (that.state.status === 3) {
                                            if (that.state.violation.cntRest > 4) {
                                                that.setState({ status: 2 });
                                                //Sending to a function that closes a violation.
                                                that.closeViolation();
                                            }
                                            else {
                                                const newviolation = { ...that.state.violation };
                                                newviolation.cntRest++;
                                                that.setState({ violation: newviolation });
                                            }
                                        }
                                        else {
                                            that.setState({ status: 2 });
                                        }
                                    }
                                }
                            });
                        }
                        else {
                            if (that.state.status === 3) {
                                if (that.state.violation.cntRest > 4) {
                                    that.setState({ status: 2 });
                                    //סגירת חריגה
                                    that.closeViolation();
                                }
                                else {
                                    const newviolation = { ...that.state.violation };
                                    newviolation.cntRest++;
                                    that.setState({ violation: newviolation });
                                }
                            }
                            else {
                                that.setState({ status: 2 });
                                that.stopORgo();
                            }

                        }

                    }
                }
                else {
                    if (this.state.cntGo > 10) {
                        this.setState({ status: 1 });
                        this.setState({ cntGo: 0 });
                    }
                    // el.stopORgo();
                }
            });
            console.log("סוף סיבוב");
            that.setState({ currentPlace: locations[i] });
            i++;
            console.log("statussssss");
            console.log(that.state.status);
            console.log("current");
            console.log(that.state.currentPlace);
            console.log("nexttttttttt");
            console.log(locations[i]);
        }, 20000)
    }
    BegineAviolation(speed) {
        this.setState({ status: 3 })
        console.log(this.state.status);
        WarningNotification();
        console.log("התחלת חריגה");
        //Save violation data
        const newviolation = { ...this.state.violation };
        newviolation.Begineviolation = this.state.currentPlace;
        newviolation.sumSpeed += speed;
        newviolation.cnt++;
        if (speed > this.state.violation.maxSpeed)
            newviolation.maxSpeed = speed;
        console.log(newviolation)
        this.setState({ violation: newviolation });
        //Obtain information about the location of the violation
        axios.post(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.state.currentPlace}&key=AIzaSyCb6jYX1j_P1alfx3_p3bMV40srf_ufGIg`).then(x => {
            var route = null;
            var district = null;
            var city = null;
            var vals = x.data.results[0].address_components;
            for (let index = 0; index < vals.length; index++) {
                if (vals[index].types[0] === "route") {
                    route = vals[index].long_name;
                }
                else {
                    if (vals[index].types[0] === "locality") {
                        city = vals[index].long_name;
                    } else {
                        if (vals[index].types[0] === "administrative_area_level_1") {
                            district = vals[index].long_name;
                        }
                    }
                }
                console.log(vals[index].types);
            }
            //If there is no city given, it is probably an interurban road.
            if (city == null)
                city = 'כביש בין עירוני';
            var hours = new Date().getHours(); //Current Hours
            var min = new Date().getMinutes(); //Current Minutes
            var sec = new Date().getSeconds(); //Current Seconds
            var time = hours + ':' + min + ':' + sec;
            const violation = {
                DriverId: this.state.DriverId,
                Date: null,
                District: district,
                city: city,
                SpeedLimit: this.state.violation.SpeedLimit,
                StartRoad: route,
                start: time
            }
            console.log(violation);
            ////שמירת חלק מהנתונים בבסיס הנתונים
            ///קוד נהג,תאריך,מחוז,מהירות מותרת,כביש
            axios.post("http://localhost:52726/api/TrafficViolation", violation).then(x => {
                console.log(x.data);
                const newviolation = { ...this.state.violation };
                newviolation.Id = x.data.Id;
                this.setState({ violation: newviolation });
            });
        }).catch(x => {
            console.log("Could not get information");
        });
    }
    stopORgo() {
        var cnt = this.state.cntGo + 1;
        this.setState({ cntGo: cnt });
        if (this.state.cntGo > 10) {
            this.setState({ status: 1 });
            this.setState({ cntGo: 0 });
            //Stop or walk situation,change the statuse of driver to true.
            if (this.props.selectuser.Status === false) {
                axios.put("http://localhost:52726/api/driver?id=" + this.state.DriverId + "&status=True").then(x => {
                    console.log(x.data);
                    this.props.StatusFalse();
                });
            }
            AddMiles(this.state.Cell_phone_mileage, this.state.DriverId);
            this.setState({ Cell_phone_mileage: 0 });
        }
    }
    ////Closing of a violation. Keeping the rest of the data in the database.
    closeViolation() {
        axios.post(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.state.currentPlace}&key=AIzaSyCb6jYX1j_P1alfx3_p3bMV40srf_ufGIg`).then(x => {
            var vals = x.data.results[0].address_components;
            var roude = null
            console.log(vals);
            for (let index = 0; index < vals.length; index++) {
                if (vals[index].types[0] == "route") {
                    roude = vals[index].types[0];
                    break;
                }

            }
            var hours = new Date().getHours(); //Current Hours
            var min = new Date().getMinutes(); //Current Minutes
            var sec = new Date().getSeconds(); //Current Seconds
            if (min < 5) {
                hours = -1;
                min -= 4;
                min = 60 + min;
            }
            var time = hours + ':' + min + ':' + sec;
            var avgspeed = this.state.violation.sumSpeed / this.state.violation.cnt;
            const violation = {
                End: time,
                SpeedMeasured: avgspeed,
                SpeedMax: this.state.violation.maxSpeed,
                EndRoad: roude
            }
            axios.put("http://localhost:52726/api/TrafficViolation?id=" + this.state.violation.Id, violation).then(x => {
                console.log("סגירת חריגההההההההה");
                console.log(x.data);
            });
        });

        //Reset all violation data stored in the local state.
        const newviolation = { ...this.state.violation };
        newviolation.Begineviolation = null;
        newviolation.maxSpeed = 0;
        newviolation.sumSpeed = 0;
        newviolation.SpeedLimit = 0;
        newviolation.cntRest = 0;
        newviolation.cnt = 0;
        this.setState({ violation: newviolation });
    }
    componentDidMount() {
        var pos = null;
        var le = this;
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            // this.setState({currentPlace:pos});
            // console.log(pos);
            le.timer(pos);
        });
    }
    render() {
        return (
            <div>
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
        StatusFalse: () => dispatc(status(true))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ActualRun);