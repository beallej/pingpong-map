import 'ol/ol.css';
import {useGeographic} from 'ol/proj';
import {Map, View, Feature, Overlay} from 'ol/index';
import {Point} from 'ol/geom';
import {Vector as VectorLayer, Tile as TileLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Style, Circle, Fill} from 'ol/style';


var neo4j = require('neo4j');
console.log(process.env['GRAPHENEDB_URL']);
var db = new neo4j.GraphDatabase(process.env['GRAPHENEDB_URL']);

useGeographic();

var place = [2.3522, 48.8556];
var point = new Point(place);

var map = new Map({
    target: 'map',
    view: new View({
        center: place,
        zoom: 8
    }),
    layers: [
        new TileLayer({
            source: new OSM()
        }),
        new VectorLayer({
            source: new VectorSource({
                features: [
                    new Feature(point)
                ]
            }),
            style: new Style({
                image: new Circle({
                    radius: 9,
                    fill: new Fill({color: 'blue'})
                })
            })
        })
    ]
});

var element = document.getElementById('popup');

var popup = new Overlay({
    element: element,
    positioning: 'bottom-center',
    stopEvent: false,
    offset: [0, -10]
});
map.addOverlay(popup);

function formatCoordinate(coordinate) {
    return ("\n    <table>\n      <tbody>\n        <tr><th>lon</th><td>" + (coordinate[0].toFixed(2)) + "</td></tr>\n        <tr><th>lat</th><td>" + (coordinate[1].toFixed(2)) + "</td></tr>\n      </tbody>\n    </table>");
}

var info = document.getElementById('info');
map.on('moveend', function() {
    var view = map.getView();
    var center = view.getCenter();
    info.innerHTML = formatCoordinate(center);
});

map.on('click', function(event) {
    var feature = map.getFeaturesAtPixel(event.pixel)[0];
    if (feature) {
        var coordinate = feature.getGeometry().getCoordinates();
        popup.setPosition(coordinate);
        $(element).popover({
            placement: 'top',
            html: true,
            content: formatCoordinate(coordinate)
        });
        $(element).popover('show');
    } else {
        $(element).popover('destroy');
    }
});

map.on('pointermove', function(event) {
    if (map.hasFeatureAtPixel(event.pixel)) {
        map.getViewport().style.cursor = 'pointer';
    } else {
        map.getViewport().style.cursor = 'inherit';
    }
});


// getMapData();
// async function getMapData(){
//
//     db.cypher({
//         query: "MATCH (n:IP) RETURN n",
//     }, (err, batchResults) => {
//         if (batchResults){
//             console.log("RESULTS - IP", JSON.stringify(batchResults))
//             batchResults.map((res) => {
//                 let loc = [res.longitude, res.latitude]
//                 let layer = new VectorLayer({
//                     source: new VectorSource({
//                         features: [
//                             new Feature(loc)
//                         ]
//                     }),
//                     style: new Style({
//                         image: new Circle({
//                             radius: 9,
//                             fill: new Fill({color: 'blue'})
//                         })
//                     })
//                 });
//                 map.addLayer(layer)
//             })
//         }
//         if (err){
//             console.log("ERR", err)
//         }
//     });
//
// }
