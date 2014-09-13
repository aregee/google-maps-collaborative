// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Mongo.Collection("players");
points = new Meteor.Collection("points");

if (Meteor.isClient) {

  Deps.autorun(function() {
    Meteor.subscribe('pointsSubscription');
  });

  Meteor.methods({
    'clear': function() {
    //  points.remove({});
    }
  });
  // Runs when Meteor is all set to start. It creates our
  // canvas out of the Canvas object we declared above and..
  Meteor.startup(function() {
    //points.remove({});
    var markPoint = function(latLng) {
      points.insert({
        lt: latLng.lat(),
        ln: latLng.lng()
      })
    }

    GoogleMaps.init({
        'sensor': true, //optional
        //'key': 'MY-GOOGLEMAPS-API-KEY', //optional
        //'language': 'de' //optional
      },
      function() {
        var mapOptions = {
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        map.setCenter(new google.maps.LatLng(27.33, 77.38));
        new google.maps.event.addListener(map, 'click', function(event) {
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(event.latLng),
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              strokeColor: "blue",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "blue",
              fillOpacity: 0.3,
              scale: 10,
              clickable: false
            },
            map: map
          });
          console.log(event.latLng);
          marker.setPosition(event.latLng);
          markPoint(event.latLng);
          Session.set('map', true);
        });
        new google.maps.event.addListener(map, 'mouseup', function(event) {
          Session.set('map', false);
        });

      }
    );


    // Creates a reactive context around us getting all points
    // out of our points collection. Fetch will turn the cursor
    // into an array. We then pass off this array to the canvas'
    // draw method to actually draw all the points.
    // (Not performant!)
    Deps.autorun(function() {

      var isMap = Session.get('map');
      if (isMap) {
        points.find().observe({
          added: function(point) {
            console.log(point);
            map.setCenter(new google.maps.LatLng(point.lt, point.ln));
            var marker = new google.maps.Marker({
              position: new google.maps.LatLng(point.lt, point.ln),
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                strokeColor: "red",
                strokeOpacity: 0.8,
                strokeWeight: 3,
                fillColor: "red",
                fillOpacity: 0.3,
                scale: 20,
                clickable: false
              },
              map: map
            });
            marker.setPosition(point.cord.B, point.cord.k);
            marker.setMap(map);
          }
        })
      }
    });

  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function() {
    Meteor.publish('pointsSubscription', function() {
      return points.find();
    });
    var myMap;
    if(!myMap) {
     points.remove({});
    }
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
        "Grace Hopper",
        "Marie Curie",
        "Carl Friedrich Gauss",
        "Nikola Tesla",
        "Claude Shannon"
      ];
      for (var i = 0; i < names.length; i++)
        Players.insert({
          name: names[i],
          score: Math.floor(Random.fraction() * 10) * 5
        });
    }
  });
}
