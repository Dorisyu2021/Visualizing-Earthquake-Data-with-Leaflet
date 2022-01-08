

var defaultMap=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var TopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

let baseMap={
    
    "Topographic Map": TopoMap,
    Default:defaultMap
};

var myMap=L.map("map",{
    center:[34.0522, -118.2437],
    zoom:4,
    layers:[TopoMap,defaultMap]
});

//get the tectonic plates
let tectonicPlates=new L.layerGroup();

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateDate){
    //console.log(plateDate)
    L.geoJson(plateDate,{
        color:"green",
        weight:1
    }).addTo(tectonicPlates);
});

tectonicPlates.addTo(myMap);

//get info for earthquake
let earthquakes=new L.layerGroup();

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
    function(earthquakeData){
        console.log(earthquakeData);
        //make function choose colors
        function dataColor(depth){
            if (depth> 90)
               return "red";
            else if (depth >70)
               return "orange";
            else if (depth >50)
               return "#fcdb03";
            else if (depth >30)
               return "#fcf403";
            else if (depth >10)
               return "#adfc03";
            else
               return "green";   
        }

        //fuction to determins the radius
        function radiusSize(mag){
            if (mag==0)
              return 1;
            else
              return mag*5;
        }

        function dataStyle(feature)
        {
            return {
                opacity: 0.5,
                fillOpacity: 0.7,
                fillColor: dataColor(feature.geometry.coordinates[2]),
                color:"000000",
                radius: radiusSize(feature.properties.mag),
                weight:0.5,
                stroke:true

            }
        }

        //add geoJson
        L.geoJson(earthquakeData,{
            pointToLayer: function(feature, latLng){
                return L.circleMarker(latLng);
            },
            style: dataStyle,
            //add popups
            onEachFeature: function(feature,layer){
                layer.bindPopup(`Mag:${feature.properties.mag}<br>
                "Depth: ${feature.geometry.coordinates[2]}<br>
                Location: ${feature.properties.place}`)
            }
        }).addTo(earthquakes);

    }
);

//add earthquake layer
earthquakes.addTo(myMap);

let overlay={
    "Tectonic Plates":tectonicPlates,
    "Earthquakes": earthquakes
};

L.control.layers(baseMap,overlay).addTo(myMap);

//add legend to the map
let legend=L.control({
    position:"bottomright"

});

legend.onAdd=function(){
    let div=L.DomUtil.create("div","info legend");
    let intervals=[-10,10,30,50,70,90];
    let colors=[
        "green","#adfc03","#fcf403","#fcdb03","orange","red"
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



