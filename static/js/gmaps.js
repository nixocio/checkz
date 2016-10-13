var favMap;
var infoWindow = new google.maps.InfoWindow();
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer({
  polylineOptions: {
    strokeColor: "orange"
  }
});


function initFavMap() {

// set LatLng to SF
  var sfLatLng = {lat: 37.773972, lng: -122.431297};

  // create a map object and specify the DOM element for display
  // fav-map appears in favlist_page.html
  favMap = new google.maps.Map(document.getElementById('map'), {
    center: sfLatLng,
    scrollwheel: false,
    zoom: 13,
    zoomControl: true,
    panControl: false,
    streetViewControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  //var styles = [{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":57}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"lightness":24}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]}];
  // var styles = [{"featureType":"all","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#dee6f0"},{"lightness":40},{"visibility":"on"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"off"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"},{"hue":"#ff0000"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#353c44"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#1c1e25"}]},{"featureType":"landscape.man_made","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape.man_made","elementType":"labels.icon","stylers":[{"visibility":"on"},{"hue":"#e0ff00"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#1e212b"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#00cebd"},{"lightness":17},{"saturation":"11"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"hue":"#ff7a00"},{"saturation":"79"},{"visibility":"on"},{"lightness":"-33"},{"gamma":"0.63"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#256a72"},{"saturation":"61"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"gamma":"1"},{"lightness":"0"},{"color":"#2d414b"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"transit.line","elementType":"geometry.fill","stylers":[{"color":"#eb0202"}]},{"featureType":"transit.station","elementType":"geometry.fill","stylers":[{"color":"#ff1d00"},{"saturation":"-35"},{"lightness":"-47"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"hue":"#00d4ff"},{"visibility":"simplified"},{"lightness":"0"},{"saturation":"0"},{"gamma":"0.5"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}];
  // var styles = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}];
  //favMap.setOptions({styles: styles});

 // getFavoriteSpots();
  locateUser();
}


function getFavoriteSpots() {
  var userId = $('#logout-link').data('userid');

  if (userId !== undefined) {

      var userData = {
        'user_id': userId
      };

      $.get('/favorited', userData, makeMarkers);
  }
}


function makeMarkers(response) {
  var favBounds = new google.maps.LatLngBounds();

  // response is gonna look like this!
  // {'fav_spots': [{'spot_address': blah, 'regulation': blah, 'days': blah, 'hours': blah, 'hrlimit': blah}]}

  // if the list is empty
  if (response['fav_spots'].length === 0) {
      alert('You currently have no favorite spots. Go favorite some!');
    } else {
      var favLatLng, favMark;
        for (var i = 0; i < response['fav_spots'].length; i++) {

          // unpacking response data
          favLatLng = response['fav_spots'][i]['spot_address'].replace('{lat: ', '').replace('lng: ', '').replace('}', '');
          favLatLng = favLatLng.split(', ');
          regulationType = response['fav_spots'][i]['regulation'] || 'N/A';
          regulatedDays = response['fav_spots'][i]['days'] || 'N/A';
          regulatedHours = response['fav_spots'][i]['hours'] || 'N/A';
          regulatedHrLimit = response['fav_spots'][i]['hrlimit'] || 'N/A';

          // if (regulationType === '' || regulatedDays === '' || regulatedHours === '' || regulatedHrLimit === '') {

          // }

          // TODO: Better design choice. Go back and store the lat lngs as numbers in the db.

          favMark = new google.maps.Marker({
            map: favMap,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(favLatLng[0], favLatLng[1]),
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue.png'
          });

          var html = '<div class="content">'
                    + '<button type="button" onclick="deleteFavoriteSpot('
                    + '\'{lat: ' + favLatLng[0] + ', lng: ' + favLatLng[1] + '}\')" class="btn btn-primary" id="fav-button">'
                    + 'Unfavorite</button>'
                    + '<button type="button" onclick="getDirections(' + favLatLng[0] + ',' + favLatLng[1] + ')" class="btn btn-primary" id="directions-button">Get Directions to Here</button>'
                    + '<button type="button" onclick="textDirections(' + favLatLng[0] + ',' + favLatLng[1] + ')" class="btn btn-primary" id="text-directions-button">Text Directions to Me</button>'
                    + '<br><h3>Parking Details</h3>'
                    + '<h4>Regulation Type:</h4> ' + regulationType
                    + '<br><h4>Regulated Days:</h4> ' + regulatedDays
                    + '<br><h4>Regulated Hours:</h4> ' + regulatedHours
                    + '<br><h4>Regulated Hour Limit:</h4> ' + regulatedHrLimit
                    + '</div>';

          // javascript closure
          // params here
          google.maps.event.addListener(favMark, 'click', (function(favMark, html, infoWindow) {
            return function() {
              infoWindow.close();
              infoWindow.setContent(html);
              infoWindow.open(favMap, favMark);
            };
          // what you actually pass in
          })(favMark, html, infoWindow));

          var boundingFavMark = new google.maps.LatLng(favLatLng[0], favLatLng[1]);
          favBounds.extend(boundingFavMark);
        } //end for loop
      favMap.fitBounds(favBounds);
    } // end else
} // end function


function deleteFavoriteSpot(spotAddress) {

  var userId = $('#logout-link').data('userid');

    if (userId !== undefined) {

        var delData = {
          'user_id': userId,
          'spot_address': spotAddress
        };

        $.post('/unfavorited', delData, function () {
          alert('That spot has been deleted.');
          // reload page so markers are fresh
          location.reload();
        });


    }
}


function locateUser() {
  var browserSupportFlag =  new Boolean();

  if(navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      window.userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      // anything that needs to ref userLocation MUST happen before the end of this function
    }, function() {
      handleNoGeolocation(browserSupportFlag);
    });
  } // end if
  // browser doesn't support Geolocation so call the handleNoGeolocation fn
  else {
    browserSupportFlag = false;
    handleNoGeolocation(browserSupportFlag);
  }
}


function handleNoGeolocation(errorFlag) {
  if (errorFlag == true) {
    alert("Geolocation service failed.");
  } else {
    alert("Your browser does not support geolocation.");
  }
}


function getDirections(favLat, favLng) {

  $('#favright-panel').removeClass('hidden');

  var markLatLng = new google.maps.LatLng(favLat, favLng);

  directionsDisplay.setMap(favMap);
  directionsDisplay.setPanel(document.getElementById('favright-panel'));

  var request = {
    // window.userLocation is global
    origin: userLocation,
    destination: markLatLng,
    travelMode: google.maps.TravelMode.DRIVING
  };

  directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(result);
    }
  });
}


function textDirections(textLat, textLng) {

  textData = {
    'text_lat': textLat,
    'text_lng': textLng
  };

  $.get('/textuser', textData, function () {
    alert('Text has been sent to your phone.');
  });
}


function resizeMap() {
  // debugger;
  // when window changes size, map adapts
  var navheight = $('.navbar').height();
  var height = $(window).height();
  $('#map').height(height - navheight);
}


$(document).ready(function () {
  google.maps.event.addDomListener(window, 'load', initFavMap);

  //$(window).resize(resizeMap);
  //resizeMap();
});


