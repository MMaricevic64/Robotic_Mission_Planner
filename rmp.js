var map;
var markers = new Array();
var polygons = new Array();
var polylines = new Array();
var polygonID = 1;
var polylineID = 1;
var markerID = 1;

function initMap(){
  //Create map with center in the field
  var mapcenter = {lat: 46.49029682410447, lng: 16.460909796287385};
  var mapOptions = {
        zoom: 17,
        center: mapcenter,
        mapTypeId: 'satellite'
      };
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  //Create marker on map click
  google.maps.event.addListener(map, 'click', function(e) {
      var lat = e.latLng.lat(); // lat of clicked point
      var lng = e.latLng.lng(); // lng of clicked point
      var position = new google.maps.LatLng(lat,lng);
      add_marker(position);
  });

  //Create data layer for GeoJson import/export
  datalayer = new google.maps.Data();
}

function add_marker(position){
  var marker;
  var marker_label;

  //Set marker label
  if(markerID == 1) {marker_label = "H"} else {marker_label = markerID.toString()}

  //Create marker and add it to markers array
    marker = new google.maps.Marker({
      position: position,
      map: map,
      animation: google.maps.Animation.DROP,
      id: markerID,
      label: marker_label
  });
  markers.push(marker);

  //Create corresponding point and add it to data layer (for GeoJson export)
  var point = new google.maps.Data.Feature({
          geometry: new google.maps.Data.Point(position),
          id: "Point " + markerID
      });
  datalayer.add(point);

  add_marker_to_table(marker);
  markerID++;

  //Delete marker/point
  marker.addListener("rightclick", function() {
    marker.setMap(null);
    //Delete from markers array
    var index = markers.indexOf(marker);
    markers.splice(index,1);
    //Delete from table
    delete_marker_from_table(index);
    //Delete from DataLayer
    delete_from_data_layer("Point " + marker.id,"Point");
  });
}

function add_marker_to_table(marker){
  var table = document.getElementById("marker_table");
  var row = table.insertRow();
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  cell1.innerHTML = marker.label;
  cell2.innerHTML = marker.getPosition().lat();
  cell3.innerHTML = marker.getPosition().lng();
}

function delete_marker_from_table(index){
  var table = document.getElementById("marker_table");
  table.deleteRow(index+1);
}

function delete_all_markers(){
  //Delete markers from map and markers array
  for(var i=0; i < markers.length; i++){
    markers[i].setMap(null);
  }
  markers = [];

  //Delete markers from table
  var table = document.getElementById("marker_table");
  while (table.rows.length > 1) {
      table.deleteRow(1);
  }

  //Delete corresponding points from DataLayer
  datalayer.forEach(function (feature){
      if(feature.getGeometry().getType() == "Point"){
        datalayer.remove(feature);
      }
  });
}

function get_marker_coordinates(){
  var coordinates = new Array();
  var marker_coordinate;
  for(var i = 0; i < markers.length; i++){
    marker_coordinate = {lat: markers[i].getPosition().lat(), lng: markers[i].getPosition().lng()};
    coordinates.push(marker_coordinate);
  }
  return coordinates;
}

function create_polygon(){
  if(markers.length < 3){
    alert("There must be at least 3 markers to create polygon!");
    return;
  }

  //Get polygon coordinates
  var polygon_coordinates = get_marker_coordinates();
  //Create new polygon
  create_new_polygon(polygon_coordinates);
  //Remove markers
  delete_all_markers();
}

function create_new_polygon(polygon_coordinates){
  var newpolygon;
  //Create polygon and add it to map
    newpolygon = new google.maps.Polygon({
      paths: polygon_coordinates,
      strokeColor: "#FF0000",
      strokeWeight: 2,
      id: polygonID
    });
    newpolygon.setMap(map);

    //Add to polygons array
    polygons.push(newpolygon);

    //Create corresponding polygon and add it to data layer (for GeoJson export)
    var polygon = new google.maps.Data.Feature({
	     geometry: new google.maps.Data.Polygon([newpolygon.getPath().getArray()]),
	     id: "Polygon " + polygonID
	  });
    datalayer.add(polygon);

    polygonID++;

      //Function to remove polygon
      newpolygon.addListener("rightclick", function() {
      //Remove polygon from map and polygons array
      newpolygon.setMap(null);
      var index = polygons.indexOf(newpolygon);
      polygons.splice(index,1);
      //Remove polygon from DataLayer
      delete_from_data_layer("Polygon " + newpolygon.id,"Polygon")
    });

    //Used to place marker inside polygon
    google.maps.event.addListener(newpolygon, 'click', function(e) {
        var lat = e.latLng.lat(); // lat of clicked point
        var lng = e.latLng.lng(); // lng of clicked point
        var position = new google.maps.LatLng(lat,lng);
        add_marker(position);
    });
}

function delete_all_polygons(){
    //Delete polygons from map and polygons array
    for(var i=0; i < polygons.length; i++){
      polygons[i].setMap(null);
    }
    polygons = [];

    //Delete corresponding polygons from DataLayer
    datalayer.forEach(function (feature){
        if(feature.getGeometry().getType() == "Polygon"){
          datalayer.remove(feature);
        }
    });
}

function create_polyline(){
  if(markers.length < 1){
    alert("There must be at least 2 markers to create polyline!");
    return;
  }

  //Get polyline position
  var polyline_coordinates = get_marker_coordinates();
  //Create new polyline
  create_new_polyline(polyline_coordinates)
  //Remove markers
  delete_all_markers();
}

function create_new_polyline(polyline_coordinates){
  var newpolyline;
  //Create polyline and add it to map
    newpolyline = new google.maps.Polyline({
      path: polyline_coordinates,
      geodesic: true,
      strokeColor: "#00FF00",
      strokeWeight: 2,
      id: polylineID
    });
  newpolyline.setMap(map);

  //Add to polylines array
  polylines.push(newpolyline);

  //Create corresponding linestring and add it to data layer (for GeoJson export)
  var polyline = new google.maps.Data.Feature({
	  geometry: new google.maps.Data.LineString(newpolyline.getPath().getArray()),
	  id: "LineString " + polylineID
	});
  datalayer.add(polyline);

  polylineID++;

  //Function to remove polyline
  newpolyline.addListener("rightclick", function() {
    //Remove polyline from map and polylines array
    newpolyline.setMap(null);
    var index = polylines.indexOf(newpolyline);
    polylines.splice(index,1);
    //Remove linestring from DataLayer
    delete_from_data_layer("LineString " + newpolyline.id,"LineString")
  });

  //Used to place marker inside polyline (on the line)
  google.maps.event.addListener(newpolyline, 'click', function(e) {
      var lat = e.latLng.lat(); // lat of clicked point
      var lng = e.latLng.lng(); // lng of clicked point
      var position = new google.maps.LatLng(lat,lng);
      add_marker(position);
  });
}

function delete_all_polylines(){
    //Delete polylines from map and polylines array
    for(var i=0; i < polylines.length; i++){
      polylines[i].setMap(null);
    }
    polylines = [];

    //Delete corresponding LineStrings from DataLayer
    datalayer.forEach(function (feature){
        if(feature.getGeometry().getType() == "LineString"){
          datalayer.remove(feature);
        }
    });

}
// Load GeoJSON data to map
function loadGeoJsonString(geoString) {
  //Clear all elements from map and data layer
  delete_all_markers();
  delete_all_polygons();
  delete_all_polylines();
  polygonID = 1;
  polylineID = 1;
  markerID = 1;

  try {
      const geojson = JSON.parse(geoString);
      //Create tmp data layer and add all features from .json file to it
      tmplayer = new google.maps.Data();
      tmplayer.addGeoJson(geojson);
      //Create cooresponding points, polylines or polygons for each feature, add it to original data layer and show it on map
      transform_tmplayer(tmplayer);
      zoom(map);
    } catch (e) {
        alert("Not a GeoJSON file!");
        return;
      }

        function zoom(map) {
            var bounds = new google.maps.LatLngBounds();
            datalayer.forEach(function (feature) {
                processPoints(feature.getGeometry(), bounds.extend, bounds);
            });
            map.fitBounds(bounds);
        }

        function processPoints(geometry, callback, thisArg) {
            if (geometry instanceof google.maps.LatLng) {
                callback.call(thisArg, geometry);
            } else if (geometry instanceof google.maps.Data.Point) {
                callback.call(thisArg, geometry.get());
            } else {
                geometry.getArray().forEach(function (g) {
                    processPoints(g, callback, thisArg);
                });
            }
        }
}

//Get element from HTML and read the GeoJson file
    document.getElementById('add_geojson_button').onchange = function (evt) {
        try {
            let files = evt.target.files;
            if (!files.length) {
                alert('No file selected!');
                return;
            }
            let file = files[0];
            let reader = new FileReader();
            const self = this;
            reader.onload = (event) => {
                loadGeoJsonString(event.target.result)
            };
            reader.readAsText(file);
        } catch (err) {
            console.error(err);
        }
    }


function transform_tmplayer(tmplayer){
  tmplayer.forEach(function (feature){
      if(feature.getGeometry().getType() == "Point"){
        var position;
        feature.getGeometry().forEachLatLng( function(coordinate){
          position = coordinate;
          console.log(position);
        });
        add_marker(position);
      }
      if(feature.getGeometry().getType() == "Polygon"){
        var position = [];
        feature.getGeometry().forEachLatLng( function(coordinate){
          position.push(coordinate);
        });
        create_new_polygon(position);
      }
      if(feature.getGeometry().getType() == "LineString"){
        var position = [];
        feature.getGeometry().forEachLatLng( function(coordinate){
          position.push(coordinate);
        });
        create_new_polyline(position);
      }
  });
}

function delete_from_data_layer(id, type){
  datalayer.forEach(function (feature){
    if(feature.getId() == id && feature.getGeometry().getType() == type){
      datalayer.remove(feature);
    }
  });
}

//Export map to GeoJson format
function export_geojson(){
  datalayer.toGeoJson(function (data) {
    download(JSON.stringify(data, null, 2), "MissionPlaner.json", "text/plain");
  });
}

function download(content, fileName, contentType) {
 const a = document.createElement("a");
 const file = new Blob([content], { type: contentType });
 a.href = URL.createObjectURL(file);
 a.download = fileName;
 a.click();
}


function empty_data_layer(){
  datalayer.forEach(function (feature){
    datalayer.remove(feature);
        });
}
