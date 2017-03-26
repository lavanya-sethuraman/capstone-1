var origAddr =null;
var destAddr =null;

function initMap() {

  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37,lng: -95},
    zoom: 4
  });
  autocompleteLocations(map);
}


function autocompleteLocations(map){

  var orig = document.getElementById('origin');
  var dest = document.getElementById('destination');
  var autocompleteOrig = new google.maps.places.Autocomplete(orig);
  var autocompleteDest = new google.maps.places.Autocomplete(dest);

  autocompleteListener(autocompleteOrig,map,'SRC');
  autocompleteListener(autocompleteDest,map,'DEST');
}



function autocompleteListener(autocomplete,map,type){
  autocomplete.bindTo('bounds', map);
  var infowindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });
  autocomplete.addListener('place_changed', function() {
    marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }
    map.setCenter(place.geometry.location);
    map.setZoom(10);
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    if(type === 'SRC'){
      origAddr=place.place_id;
    } else{
      destAddr=place.place_id;
    }
    getTransitDetails(origAddr, destAddr);
  });
}


function getTransitDetails(origAddr, destAddr) {
  console.log(origAddr + ' '+destAddr);
  if(origAddr && destAddr)
  {
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 39.90973623453719,lng: -102.48046875},
      zoom: 4
    });
    var request = {
      origin: {'placeId': origAddr},
      destination: {'placeId': destAddr},
      travelMode: 'TRANSIT',
      provideRouteAlternatives: true
    };
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsService.route(request,function(response, status){
        var routes = null;
        if (status === 'OK') {
          directionsDisplay.setDirections(response);
          routes = response.routes;
          getDetails(routes);
        }else {
          window.alert('Directions request failed due to ' + status);
        }
      });

    }
    else{
      return;
    }
  }










  function getDetails(routes) {

    routes.forEach(function(route) {
      $('.js-directions-result').append('<div></div>');
      var opt=$('.js-directions-result div:last-child');
      var legs = route.legs;

      legs.forEach(function(leg) {

        var steps = leg.steps;

        opt.html( '<p>Route Details : </p><ul><li> Leave At : ' + leg.departure_time.text + '</li><li> Reach At : ' +
        leg.arrival_time.text + '</li><li> Transfers :' + steps.length + '</li></ul>');

        console.log(" Leave At : " + leg.departure_time.text);
        console.log(" Reach At : " + leg.arrival_time.text);
        console.log("Number of steps :" + steps.length);

        opt.append('<ol></ol>');
        var stepsList=opt.find('ol:last-child');
        steps.forEach(function(step) {

          var transit = step.transit;
          var stepOfSteps = step.steps;
          var newStep='Instructions : ' + step.instructions+
          '<ul><li>  Step Distance: ' + step.distance.text + '</li>' +
          '<li> Step Duration: ' + step.duration.text + '</li>';

          if (stepOfSteps !== undefined) {
            stepOfSteps.forEach(function(someS) {
              console.log("Route -> Leg -> Step -> Steps-> StepOfSteps Instruction : " + someS.instructions);
            });
          }

          if (transit !== undefined) {
            newStep+='<li>Board at : ' + transit.departure_stop.name + '</li>';


            console.log("Board at : " + transit.departure_stop.name);
            console.log("Get off at : " + step.transit.arrival_stop.name);
            console.log("Boarding Time : " + transit.departure_time.text);
            console.log("You will reach at : " + transit.arrival_time.text);
            console.log("Headsign : " + transit.headsign);
            console.log("Line Name  : " + transit.line.name + " & Agency : " + transit.line.agencies.map(function(item) {
              return item.name;
            }));
            console.log(" Your Stop Number is  : " + transit.num_stops);

          }
          stepsList.append('<li>' + newStep + '<ul></li>');

        });

      });
    });
  }
