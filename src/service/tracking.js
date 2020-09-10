//הפונקציה ששרהלה כתבה
// בפונקציה אני קבלת את המיקום מגוגל מפס
//1=הליכה 
//2=נסיעה
//3=חריגה
//lat=אורך  lng=רוחב
//cntRest המשתנה הזה הוא בשביל לבדוק אם חריגה הסתימה או שהוא בעצירה באמצע חריגה לדוגמא רמזור

import { WarningNotification, UpdateNotification } from '../component/Notification/addNotification'
import {AddMiles } from './Locations'
import React, { Component } from 'react'
import axios from 'axios';
import { connect } from 'react-redux'
import { status } from '../store/actionUser'
console.log(Date.now())
class Trace extends Component {
    state = {
        //מיקום ברירת מחדל סמינר מאיר
        //32.0900715,34.8390216
        DriverId:this.props.selectuser.Id,
        Cell_phone_mileage:0,
        currentPlace: null,
        //המשתנים שקשורים למצב חריגה
        violation: {
            Id: 0,
            begainHour: null,
            // placeChangeviolation: { lng: 0, lat: 0 },
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
    Tracking(pos) {
        this.setState({ currentPlace: pos });
        var that = this;
        setInterval(function () {
            console.log(that.state.currentPlace);
            var pos = null;
            navigator.geolocation.getCurrentPosition(function (position) {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                //Check if there is a movement of the driver being monitored.
                if (pos.lng == that.state.currentPlace.lng || pos.lat != that.state.currentPlace.lat) {
                    var speed = 0;
                    var distance = null;
                    //Checking the distance between two locations by interfacing with Google Maps.
                    const google = window.google;
                    var origin = new google.maps.LatLng(that.state.currentPlace.lat, that.state.currentPlace.lng);
                    var destination = new google.maps.LatLng(pos.lat, pos.lng);
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
                        speed = (distance / 1000) * 60;
                        ////Check if the user has started a trip
                        if (speed > 6) {
                            const miles = { ...that.state.Cell_phone_mileage };
                            miles+=(distance/1000);
                            this.setState({Cell_phone_mileage:miles});
                            if (that.state.status === 1) {
                                UpdateNotification();
                                that.setState({ status: 2 });
                            }
                            //Check whether the driver under surveillance is the driver of this trip.
                            if (that.props.selectuser.status) {
                                if (speed > that.state.violation.SpeedLimit) {
                                    //Check if the violation starts now.
                                    if (that.state.status != 3) {
                                        that.BegineAviolation(speed,pos);
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
                }
            });
            that.setState({ currentPlace: pos });
        }, 20000)
    }
    //Stop / walk mode,status 1
    stopORgo() {
        var cnt = this.state.cntGo + 1;
        this.setState({ cntGo: cnt });
        if (this.state.cntGo > 10) {
            this.setState({ status: 1 });
            this.setState({ cntGo: 0 });
            if (!this.props.selectuser.Status) {
                axios.put("http://localhost:52726/api/driver?id=" + this.state.DriverId + "&status=True").then(x => {
                    console.log(x.data);
                });
            }
            AddMiles(this.state.Cell_phone_mileage,this.state.DriverId);
            this.setState({Cell_phone_mileage:0});
        }
    }
    ////Closing of a violation. Keeping the rest of the data in the database.
    closeViolation() {
        axios.post(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.currentPlace}&key=AIzaSyCb6jYX1j_P1alfx3_p3bMV40srf_ufGIg`).then(x => {
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
    BegineAviolation(speed,pos) {
        this.setState({ status: 3 })
        WarningNotification();
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
        axios.post(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&key=AIzaSyCb6jYX1j_P1alfx3_p3bMV40srf_ufGIg`).then(x => {
            var route = null;
            var district = null;
            var city = null;
            x.results[0].forEach(element => {
                //switch-case
                //The road where the violation begins.
                if (element.types[0] == "route") {
                    route = element.long_name;
                }
                else {
                    //The District
                    if (element.types[0] == "administrative_area_level_1") {
                        district = element.long_name;
                    }
                    else {
                        //The City
                        if (element.types[0] == "locality") {
                            city = element.long_name;
                        }
                    }
                }
            });
            //If there is no city given, it is probably an interurban road.
            if (city == null)
                city = 'כביש בין עירוני'
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
            //Saving data in the database
            axios.post("http://localhost:52726/api/TrafficTracking", violation).then(x => {
                const newviolation = { ...this.state.violation };
                newviolation.Id = x.data.Id;
                this.setState({ violation: newviolation });
            });
        }).catch(x => {
            console.log("Could not get information");
        });
    }
    componentDidMount() {
        var pos = null;
        var that = this;
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            that.Tracking(pos);
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
export default connect(mapStateToProps, mapDispatchToProps)(Trace);






            // addNotification({
            //     title: 'Warning',
            //     subtitle: 'This is a subtitle',
            //     message: 'המערכת זיהתה חריגה מהמהירות המותרת בכביש זה.',
            //     duration: 4000,
            //     theme: 'darkblue',
            //     native: true // when using native, your OS will handle theming.
            // });
            //////////
            // axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metricl&origins=${pos.lat},${pos.lng}
            // &destinations=${pos.lat},${pos.lng}&mode=travling&key=AIzaSyCb6jYX1j_P1alfx3_p3bMV40srf_ufGIg`).then(x => {
            //     alert(JSON.stringify(x))
            // }).catch(x => {
            //     alert(x)
            // });
            //////////
            //const xhr = new XMLHttpRequest();
            // res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, content-type");
            // fetch(url, {
            //     method: 'GET',
            //     headers: {
            //         "Access-Control-Allow-Headers": "X-Requested-With, content-type"
            //     }
            // }).then(res => res.json())
            //     .then(response => console.log('Success:', response))
            //     .catch(error => console.error('Error:', error));
            // var cors = require('cors');

            // use it before all route definitions
            // axios.use(cors({ origin: 'http://localhost:3000' }));
            //     var url = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metricl&origins=32.080065,34.837413&destinations=31.046051,34.851611999999996&mode=travling&key=AIzaSyCb6jYX1j_P1alfx3_p3bMV40srf_ufGIg/allow-cors";
            //     // var url = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metricl&origins=32.080065,34.837413&destinations=" + pos.lat + "," + pos.lng + "&mode=travling&key=AIzaSyCb6jYX1j_P1alfx3_p3bMV40srf_ufGIg/allow-cors";
            //     axios.post(url).then(x => {
            //         // if ((x.data.rows.elements.distance.value /1000)*60>speedLimit)
            //         // {
            //         console.log(x.data);
            //         // }
            //         speed = (x.data.rows.elements.distance.value / 1000) * 60;
            //         console.log("speed");
            //         console.log(speed);
            //     });


            // timeout(x => {
            //     navigator.geolocation.getCurrentPosition(function (position) {
            //         var pos = {
            //             lat: position.coords.latitude,
            //             lng: position.coords.longitude
            //         };
            //         console.log();
            //         this.setState({ currentPlace: pos })
            //     });
            // }, 1000);

            /////
            // חישוב האם מיקום המכשיר ישתנה

            // if (pos.lng != this.state.currentPlace.lng || pos.lat != this.state.currentPlace.lat) {
            //     //בדיקת מרחק בין שתי נקודות בגוגל מאפס
            //     axios.get("https://maps.googleapis.com/maps/api/distancematrix/json?units=metricl&origins=" + this.state.currentPlace.lng + "," + this.state.currentPlace.lat + "&destinations=" + pos.lng + "," + pos.lat + "&mode=travling&key=AIzaSyCb6jYX1j_P1alfx3_p3bMV40srf_ufGIg").then(x => {
            //         // if ((x.data.rows.elements.distance.value /1000)*60>speedLimit)
            //         // {

            //         // }
            //         speed = (x.data.rows.elements.distance.value / 1000) * 60;
            //         console.log(speed);
            //     });

            // SPEED= מהירות
            // speedLimit= מהירות מותרת בכביש הנוכחי
            // חישוב המהירות
            //     if (speed > 20) {
            //         if (this.selectuser.status == true) {
            //             //האם המשתמש כבר באמצע חריגה
            //             if (this.state.status == 3) {
            //                 if (speed > speedLimit) {
            //                     sum = this.status.violation.sumSpeed + speed;
            //                     cnt = this.status.violation.cnt + 1;
            //                     this.setState({ [this.state.violation.sumSpeed]: sum });
            //                     this.setState({ [this.state.violation.cnt]: cnt });
            //                     if (speed > this.state.violation.maxSpeed)
            //                         this.setState({ [this.state.violation.maxSpeed]: speed });
            //                     WarningNotification();
            //                 }
            //                 else {
            //                     if (this.state.violation.cntRest > 4) {
            //                         // חישוב הממוצע
            //                         avg = this.state.violation.sumSpeed / this.state.violation.cntRest;
            //                         axios.put("http://localhost:52726/api/TrafficTracking", 'שעת סיום, המהירות המקסימלית, תוצאהת, כביש, נקודות סיום').then(x => {
            //                             //ריקון המשתנה חריגה מכל הנתונים כהכנה לחריגה הבאה:)    
            //                             const newviolation = { ...this.state.violation };
            //                             newviolation.cntRest = 0;
            //                             newviolation.sumSpeed = 0;
            //                             newviolation.maxSpeed = 0;
            //                             newviolation.Begineviolation.lat = 0;
            //                             newviolation.Begineviolation.len = 0;
            //                             newviolation.Lastviolation.lat = 0;
            //                             newviolation.Lastviolation.len = 0;
            //                             this.setState({ violation: newviolation });
            //                             this.setState({ status: 2 });
            //                         });
            //                     }
            //                     else {
            //                         cnt = this.state.violation.cntRest + 1;
            //                         ///לשאול את שרהלה אם הצורה הזו טובה,לא רק םה אלא בכל המקומות שעשיתי את זה
            //                         this.setState({ [this.state.violation.cntRest]: cnt });
            //                     }
            //                 }
            //             }
            //             else {
            //                 if (speed > speedLimit) {
            //                     const newviolation = { ...this.state.violation };
            //                     newviolation.cnt = 1;
            //                     newviolation.sumSpeed = speed;
            //                     newviolation.maxSpeed = speed;
            //                     newviolation.Begineviolation.lat = lat;
            //                     newviolation.Begineviolation.len = len;
            //                     newviolation.Lastviolation.lat = lat;
            //                     newviolation.Lastviolation.len = len;
            //                     this.setState({ violation: newviolation });
            //                     this.setState({ status: 3 });
            //                     axios.post("http://localhost:52726/api/TrafficTracking", 'שעת התחלה, תאריך, מחוז, מיקום התחלתי').then(x => {
            //                     });
            //                     WarningNotification();
            //                 }
            //                 else
            //                     this.state.status = 2
            //             }
            //         }
            //         else
            //             this.state.status = 1
            //     }
            //     this.setState({ [this.state.currentPlace.lat]: lat });
            //     this.setState({ [this.state.currentPlace.len]: len });
            // }

            // axios.get("https://maps.googleapis.com/maps/api/distancematrix/json?units=metricl&origins=" + this.state.currentPlace.lng + "," + this.state.currentPlace.lat + "&destinations=" + pos.lng + "," + pos.lat + "&mode=travling&key=AIzaSyCb6jYX1j_P1alfx3_p3bMV40srf_ufGIg").then(x => {
            //     if ((x.data.rows.elements.distance.value / 1000) * 60 > speedLimit) {

            //     }
            //     speed = (x.data.rows.elements.distance.value / 1000) * 60;
            //     console.log(speed);
            // });


            ///stopORgo() {
    //     var cnt = this.state.cntGo + 1;
    //     this.setState({ cntGo: cnt });
    //     if (this.state.cntGo > 10) {
    //         this.setState({ status: 1 });
    //         if (this.props.selectuser == 0) {
    //             axios.put("http://localhost:52726/api/driver?id=" + this.this.props.selectuser.Id + "&status=1").then(x => {
    //             });
    //         }
    //     }
    //     ////צריך לבדוק מתי לשנות למצב הליכה רק אחרי לפחות 4 דקות של הליכה אז לכאורה להוסיף משתנה כזה,אבל במצב חריגה גם נסיעה רגילה נספרת כמנויחה מין החריגה
    //     if (this.state.status == 3) {
    //         if (this.violation.cntRest > 4) {
    //             this.setState({ status: 2 });
    //             //סגירת חריגה
    //             this.closeViolation();
    //         }
    //         else {
    //             const newviolation = { ...this.state.violation };
    //             newviolation.cntRest++;
    //             this.setState({ violation: newviolation });
    //         }
    //         //עידכון בסיס הנתונים בשינוי הסטטוס שהוא הנהג
    //     }
    // }

    // closeViolation() {
    //     //Closing of a violation. Keeping the rest of the data in the database.
    //      var avgspeed = this.state.violation.sumSpeed / this.state.violation.cnt;
    //      const violation = {
    //          End: null,//נחשב בC#
    //          SpeedMeasured: avgspeed,
    //          SpeedMax: this.state.violation.maxSpeed,
    //      }
    //      axios.put("http://localhost:52726/api/TrafficTracking?id=" + this.state.violation.Id, violation).then(x => {

    //      });
    //      ///איפוס כל נתוני החריגה כהכנה לחריגה הבאה....
    //      const newviolation = { ...this.state.violation };
    //      newviolation.begainHour = null;
    //      newviolation.Begineviolation = null;
    //      newviolation.Lastviolation = null;
    //      newviolation.maxSpeed = 0;
    //      newviolation.sumSpeed = 0;
    //      newviolation.cntRest = 0;
    //      newviolation.cnt = 0;
    //      this.setState({ violation: newviolation });
    //  }


    // getCurrentPlace() {
    //     var pos = null;
    //     navigator.geolocation.getCurrentPosition(function (position) {
    //         pos = {
    //             lat: position.coords.latitude,
    //             lng: position.coords.longitude
    //         };
    //         console.log();
    //         // this.setState({ currentPlace: pos })
    //         return pos;
    //     });
    // }