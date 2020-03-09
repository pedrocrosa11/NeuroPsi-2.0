const badgeS = document.getElementById("badge");
const map = L.map('map').setView([38.7075175, -9.1528528], 12);
const attribution = "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors";
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const tiles = L.tileLayer(tileUrl, {attribution});
tiles.addTo(map);

const options = {
  expand: "click",
  placeholder: "Procurar"
}
const geocoder = L.Control.geocoder(options).addTo(map);

const neuroId = parseInt(sessionStorage.getItem("neuroId"));
const patientsL = document.getElementById("patientsL");
const circlesS = document.getElementById("circlesS");
const heatmapS = document.getElementById("heatmapS");
const neuroCoords = JSON.parse(sessionStorage.getItem("neuroCoords"));

circlesS.onchange = circlesToggleEvent;
heatmapS.onchange = heatmapToggleEvent;

var layers = [];
var heats = [];
var mapLayers = [];
var mapHeats = [];

var testId;
var patientId;

var routeControl;

window.onload = function(){
  updateNotify("Completed")
  L.marker([neuroCoords.y, neuroCoords.x]).addTo(map);
  getNeuroTestsRoutes(neuroId);
}

function circlesToggleEvent(){
  if(circlesS.checked){
    for(l of mapLayers){
      l.addTo(map);
    }
  }else{
    for(l of mapLayers){
      map.removeLayer(l);
    }
  }
}

function heatmapToggleEvent(){
  if(heatmapS.checked){
    for(h of mapHeats){
      h.addTo(map);
    }
  }else{
    for(h of mapHeats){
      map.removeLayer(h);
    }
  }
}

/*$.getJSON("https://nominatim.openstreetmap.org/search/alges%20Portugal?format=json", function(data){

  var lat = data[0].lat;
  var lng = data[0].lon;
  L.marker([lat, lng]).addTo(map)
})*/

/*var routeControl = L.Routing.control({
  waypoints: [
    L.latLng(38.770611, -9.10697),
    L.latLng(38.720356, -9.131448)
  ],
  show: false,
  routeWhileDragging: false,
  addWaypoints: false,
  draggableWaypoints: false,
  lineOptions: {
    styles: [{color: 'black', opacity: 0.15, weight: 9},
    {color: 'white',opacity: 0.8, weight: 6},
    {color: 'orange', opacity: 1, weight: 2}]}
}).addTo(map);

routeControl.on('routesfound', function(e) {
  var routes = e.routes;
  var summary = routes[0].summary;
  var latlngs = e.routes[0].coordinates;
  var time = Math.round(summary.totalTime % 3600 / 60);
  var distance = summary.totalDistance / 1000;
  alert('Total distance is ' + distance + ' km and total time is ' + time + ' minutes');
  var waypoints = []
  for (i of latlngs){
    waypoints.push([i.lat, i.lng]);
  }
  
  $.ajax({
    url:"/api/patients/"+1+"/tests/"+1+"/routes",
    method:"post",
    data: {waypoints: JSON.stringify(waypoints), time: time, distance: distance},
    success: function(data, status){
        alert("Route guadada");
    },
    error: function(){
        console.log("Error");
    }
  })
});*/

function loadLayers(layers){
  for(l of layers){
    l.addTo(map);
  }
}

function removeLayers(layers){
  for(l of layers){
    map.removeLayer(l)
  }
}

function getNeuroTestsRoutes(neuroId){
  $.ajax({
    url:"/api/neuros/"+neuroId+"/patients/tests/routes",
    method:"get",
    success: function(result, status){
      var testsRoutes = result.testsRoutes;
      //checkIfRoutesExist(neuroCoords, testsRoutes)
      setLayers(testsRoutes);
      loadHtmlRoutes(testsRoutes);
    },
    error: function(){
        console.log("Error");
    }
  })
}

function setLayers(testsRoutes){
  var item = {color: 'blue', fillColor: 'blue', fillOpacity: 0.5, radius: 100}
  for(t of testsRoutes){
    var route = L.featureGroup();
    var layer = L.featureGroup();
    var heat = L.featureGroup();
    var points = [];
    for(p of t.patientRoutes){
      item.radius = p.repetitions*p.time*10;
      L.circle([p.coords.y, p.coords.x], item).addTo(layer).bindPopup("Tempo poupado: "+p.time+" min").on('mouseover', function(e){this.openPopup()});
      points.push([p.coords.y, p.coords.x, p.repetitions*10]);
      if(p.waypoints){
        L.polyline(JSON.parse(p.waypoints), {color: 'yellow'}).addTo(route);
      }
    }
    layers.push({patientId: t.patientId, layer: layer, route: route});
    L.heatLayer(points, {radius: 25}).addTo(heat);
    heats.push({patientId: t.patientId, heat: heat});
  }
}

function checkboxEvent(checkboxElem, patientId){
  var layer;
  var route;
  var heat;
  var index
  for(l of layers){
    if(l.patientId == patientId){
      layer = l.layer;
      route = l.route;
    }
  }
  for(h of heats){
    if(h.patientId == patientId){
      heat = h.heat;
    }
  }
  if (checkboxElem.checked) {
    mapLayers.push(layer);
    mapLayers.push(route);
    mapHeats.push(heat);
  }else{
    map.removeLayer(layer)
    map.removeLayer(route)
    map.removeLayer(heat)
    index = mapLayers.indexOf(layer);
    mapLayers.splice(index, 1);
    index = mapLayers.indexOf(route)
    mapLayers.splice(index, 1)
    index = mapHeats.indexOf(heat);
    mapHeats.splice(index, 1);
  }
  circlesToggleEvent();
  heatmapToggleEvent();
  
}

function loadHtmlRoutes(testsRoutes){
  str = "";
  for(r of testsRoutes){
    str += "<li>"+r.patientId+": "+r.name+"<input type='checkbox' onchange='checkboxEvent(this,"+r.patientId+")'></li>";
  }
  patientsL.innerHTML = str;
}

/*function checkIfRoutesExist(neuroCoords, testsRoutes){
  for(t of testsRoutes){
    for(p of t.patientRoutes){
      if(p.waypoints){
      }else{
        if(p.coords){
          testId = p.testId;
          patientId = t.patientId;
          routeControl = L.Routing.control({
            waypoints: [
              L.latLng(neuroCoords.y, neuroCoords.x),
              L.latLng(p.coords.y, p.coords.x)
            ],
            show: false,
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            lineOptions: {
              styles: [{color: 'black', opacity: 0.15, weight: 9},
              {color: 'white',opacity: 0.8, weight: 6},
              {color: 'orange', opacity: 1, weight: 2}]}
          }).addTo(map);
    
          routeControl.on('routesfound', function(e) {
            var routes = e.routes;
            var summary = routes[0].summary;
            var latlngs = e.routes[0].coordinates;
            var time = Math.round(summary.totalTime % 3600 / 60);
            var distance = summary.totalDistance / 1000;
            alert('Total distance is ' + distance + ' km and total time is ' + time + ' minutes');
            var waypoints = []
            for (i of latlngs){
              waypoints.push([i.lat, i.lng]);
            }
            saveRoute(patientId, testId, waypoints, time, distance);
          });
        }
      }
    }
  }
}*/

function saveRoute(patientId, testId, waypoints, time, distance){
  $.ajax({
    url:"/api/patients/"+patientId+"/tests/"+testId+"/routes",
    method:"post",
    data: {waypoints: JSON.stringify(waypoints), time: time, distance: distance},
    success: function(data, status){
        alert("Route guadada");
    },
    error: function(){
        console.log("Error");
    }
  })
}

function notifyHtmlInjection(num){
  badgeS.innerHTML = num;
}

function updateNotify(testState){
  $.ajax({
      url:"/api/neuros/"+neuroId+"/patients/tests/state/"+testState,
      method:"get",
      success: function(result, status){
          var teste = result.tests;
          notifyHtmlInjection(teste.length)
      },
      error: function(){
          console.log("Error");
      }
  })
}


