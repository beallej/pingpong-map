require('ol/ol.css');
// import {useGeographic} from 'ol/proj';
let useGeographic = require("ol/proj").useGeographic;
let olIndex = require("ol/index");
let {Map, View, Feature, Overlay} = olIndex
// import {Map, View, Feature, Overlay} from 'ol/index';
let olGeom = require("ol/geom");
let {Point, LineString} = olGeom;
// import {Point, LineString} from 'ol/geom';
let olLayer = require("ol/layer");
let {Tile} = olLayer;
let VectorLayer = olLayer.Vector;
let TileLayer = Tile;
let olSource = require("ol/source");
let {OSM, Vector} = olSource;
let VectorSource = Vector;
// import {Vector as VectorLayer, Tile as TileLayer} from 'ol/layer';
// import {OSM, Vector as VectorSource} from 'ol/source';
let olStyle = require("ol/style");
let {Style, Circle, Fill, Stroke, Icon} = olStyle;
// import {Style, Circle, Fill, Stroke, Icon} from 'ol/style';
let fetch = require('node-fetch');


useGeographic();

var place = [2.3522, 48.8556];

var map = new Map({
    target: 'map',
    view: new View({
        center: place,
        zoom: 5
    }),
    layers: [
        new TileLayer({
            source: new OSM()
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
    // info.innerHTML = formatCoordinate(center);
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

let styleFunction = function(feature) {
    let geometry = feature.getGeometry();
    let styles = [
        new Style({
            stroke: new Stroke({
                color: '#ffcc33',
                width: 2
            })
        })
    ];

    geometry.forEachSegment(function(start, end) {
        console.log("seg", start, end)
        let dx = end[0] - start[0];
        let dy = end[1] - start[1];
        let rotation = Math.atan2(dy, dx);
        // arrows
        styles.push(new Style({
            geometry: new Point(end),
            image: new Icon({
                src: 'data/arrow.png',
                anchor: [0.75, 0.5],
                rotateWithView: true,
                rotation: -rotation
            })
        }));
    });

    return styles;
};
function getMapData(){


    fetch('https://aqueous-dusk-24314.herokuapp.com/ip/all').then((response) => {
        response.json().then((data) => {
            let features = data.map((res) => {
                let loc = [res.longitude, res.latitude];
                return new Feature(new Point(loc))
            });

            let layer = new VectorLayer({
                source: new VectorSource({
                    features: features
                }),
                style: new Style({
                    image: new Circle({
                        radius: 11,
                        fill: new Fill({color: 'red'})
                    })
                })
            });
            map.addLayer(layer)

        })
    });

    fetch('https://aqueous-dusk-24314.herokuapp.com/traceroute/all').then((response) => {

        response.json().then((data) => {
            let features = data.map((pingDat) => {
                let src = pingDat.src.properties;
                let target = pingDat.target.properties;
                let ping = [[src.longitude, src.latitude],
                    [target.longitude, target.latitude]];
                return  new Feature(new LineString(ping));
            });

            let layer = new VectorLayer({
                source: new VectorSource({
                    features: features
                }),
                style: styleFunction
            });
            map.addLayer(layer)
        })

    });


    fetch('https://aqueous-dusk-24314.herokuapp.com/ip/intermediate/all').then((response) => {
        response.json().then((data) => {
            let features = data.map((res) => {
                let loc = [res.longitude, res.latitude];
                return new Feature(new Point(loc))
            });

            let layer = new VectorLayer({
                source: new VectorSource({
                    features: features
                }),
                style: new Style({
                    image: new Circle({
                        radius: 7,
                        fill: new Fill({color: 'blue'})
                    })
                })
            });
            map.addLayer(layer)

        })
    });
}
getMapData();
