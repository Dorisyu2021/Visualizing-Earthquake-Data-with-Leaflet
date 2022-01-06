var baseMap=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var TopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var defaultMaps = {
    "Street Map": baseMap,
    "Topographic Map": TopoMap
  };

var myMap = L.map("map", {
    center: [34.0522, -118.2437],
    zoom: 3,
    layers:[baseMap,TopoMap]
  });

  

var tectonicP=new L.layerGroup();

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plate){
    //console.log(plate)

    L.geoJson(plate,{
       color:"green",
       weight:1
    }).addTo(tectonicP);

});
tectonicP.addTo(myMap);

var earthquake=new L.layerGroup();

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(earthquakeData){
    console.log(earthquakeData)
    
    function dataColor(depth){
        if (depth > 90)
           return "red";
        else if (depth >70)
           return "orange";
        else if (depth >50)
           return "#fca103";
        else if (depth >30)
           return "#fcdb03";
        else if (depth >10)
           return "#adfc03";
        else
           return "green";
    }

    function radiusSize(mag){
        if (mag==0)
           return 1;
        else
           return mag* 5;
    }
    
    
    function dataStyle(feature){
        return {
            opacity:0.7,
            fillopacity :1,
            fillcolor: dataColor(feature.geometry.coordinates[2]),
            color:"000000",
            radius:radiusSize(feature.properties.mag),
            weight:0.5,
            stroke:true
        
        }
    };
    //console.log(earthquakeData.features.properties.mag)
    
    L.geoJson(earthquakeData,{
        pointTolayer:function(feature, latlng){
            return L.circleMarker(latlng,{interactive: true})},
        style: dataStyle,
        onEachfeature: function(feature, layer){
            layer.bindPopup(`Mag:${feature.properties.mag}<br>
                            Depth: ${feature.geometry.coordinates[2]}<br>
                            Location:${feature.properties.place}`)
        }
    }).addTo(earthquake)
    
});

earthquake.addTo(myMap);


let overlay={
    "Tectonic Plates":tectonicP,
    "Earthquake": earthquake
}
L.control.layers(defaultMaps,overlay).addTo(myMap);

//add legend to the map
let legend=L.control({
    position:"bottomright"

});

legend.onAdd=function(){
    let div=L.DomUtil.create("div","info legend");
    let intervals=[-10,10,30,50,70,90];
    let colors=[
        "green","#adfc03","#fcdb03","#fca103","orange","red"
    ];

    for (var i=0; i<intervals.length; i++){
        div.innerHTML+= "<i style=background:"
            +colors[i]
            +"></i>"
            +intervals[i]
            +(intervals[i+1] ? "km - " +intervals[i+1] +"km<br>": "+")
    };
    return div;
}

legend.addTo(myMap);

