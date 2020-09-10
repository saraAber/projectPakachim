// // var platform = new H.service.Platform({
// //     'apikey': '79qt7M5BaEzWXBO7kwBzTzoKq1SzJ6-RmoN3nFxMD38'
// //   });
// getCurrentLocation() {
//   if (navigator.geolocation) {
//        navigator.geolocation.watchPosition(position => {
   
//       this.lat = position.coords.latitude;
//       this.lng = position.coords.longitude;
//       this.center=  new google.maps.LatLng(this.lat, this.lng);
//        var marker=  new google.maps.Marker({
//         position:new google.maps.LatLng(this.lat, this.lng),
//         setMap :this.map,
//         label:'marker',
//         title: 'Hello World!',
//         visible: true
//       });
//       let geocoder = new google.maps.Geocoder();
//       let latlng = new google.maps.LatLng(this.lat, this.lng);
   
//       let request = {
//         latLng: latlng
//       };   

//       geocoder.geocode(request, (results, status) => {
//         if (status == google.maps.GeocoderStatus.OK) {
//           if (results[0] != null) {
//             let city = results[0].address_components[results[0]
//                       .address_components.length-4].short_name;
//            alert(city);
//           } else {
//             alert("No address available");
//           }
//         }
//       });

//     });
//   }
// }