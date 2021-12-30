import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl"
import '../assets/App.css';
import { Button } from '@material-ui/core';
import {legend_style,legend_style_left,legend_h4_style,legend_div_span_style} from "../assets/MapSettings.js";

mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN

export const Map = (params) => {

    const LLIDPlaces = params["LLIDPlaces"];
    const BBLPlaces = params["BBLPlaces"];
    const predictions = params["predictions"];
    const mapContainer = useRef();
    const [hover, setHover] = useState({})
    const [mapFocus, setMapFocus] = useState("Vacancy")
    const [mapSet, setMapSet] = useState()

    const llid_htm = (
        <div>
            <b>NAME: </b>{hover.name && hover.name} <br/>
            <b>ADDRESS: </b>{hover.address && hover.address}  <br/>
            {/* <b>INDUSTRY: </b>{hover.industry && hover.industry} <br/> */}
            <b>START DATE: </b>{hover.start && hover.start}
        </div>
    )
    const bbl_htm = (
        <div>
            <b>BBL: </b>{hover.bbl && hover.bbl} <br/>
            <b>VACANCY: </b>{hover.vacancy && hover.vacancy} <br/>
            <b>MAX BUSINESS #: </b>{hover.maxbus && hover.maxbus}
        </div>
    )
    
    const set_key_bbl = (e) => {
        const bbl = e.features[0].properties.BBL;
        const vacancy = e.features[0].properties.Vacancy;
        const maxbus = e.features[0].properties["Max Business"];

        setHover({
            "bbl": bbl,
            "vacancy": vacancy,
            "maxbus": maxbus
        })
    }

    const set_key_llid = (e) => {
        const name = e.features[0].properties.Name;
        const address = e.features[0].properties.Address;
        const industry = e.features[0].properties["NAICS Title"];
        const start = e.features[0].properties["Start Date"];
        const end = e.features[0].properties["End Date"];

        setHover({
            "name": name,
            "address": address,
            "industry": industry,
            "start": start,
            "end": end,
        })
    }

    const mapFocusDict = {
        'Vacancy':{
            "strings": [0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1],
            "places": BBLPlaces,
            "htm": bbl_htm,
            "set_key": set_key_bbl,
        },
        'Duration':{
            "strings": [0,1,2,3,4,5,6,7,8,9,"10+"],
            "places": LLIDPlaces,
            "htm": llid_htm,
            "set_key": set_key_llid,
        },
        'Prediction':{
            "strings": ["Survive","Fail"],
            "places": predictions,
            "htm": llid_htm,
            "set_key": set_key_llid,
        }
    }

    function get_key_vars(focus){
        const num = mapFocusDict[focus]["strings"].length;
        const color_arr = [];
        const color_dict = {};
        const color = (num-1)/2
        var red = 0
        var green = 255
        for (let i = 0; i < num; i++) {
            const key = String(i);
            const val = "rgba("+Math.round(red)+","+Math.round(green)+","+0+",100)";
            if (i < num-1){
                color_arr.push(key)
            }
            color_arr.push(val)
            color_dict[key] = val
            if (i <= color-1){
                red += 255/color
            } else if (i > color-1 && i < color) {
                [red, green] = [green, red]
            } else {
                green -= 255/color
            }
        }
        // console.log(color_arr)
        // console.log(color_dict)
        return {
            "color_arr": color_arr,
            "color_dict": color_dict,
        }
    }

    const keyVars = get_key_vars(mapFocus);

    const update_map = () => {
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/light-v10',
            zoom: 10.5,
            maxZoom: 17.5,
            minZoom: 10,
            center: [-73.962141,40.72796],
            maxBounds: [[-74.345945,40.465065],[-73.590632,40.997314]]
        });

        map.on('load', () => {

            for(let [key, value] of Object.entries(mapFocusDict)){

                map.addSource('places'+key, {
                    type: 'geojson',
                    data: mapFocusDict[key]["places"]
                });

                map.addLayer({
                    'id': key,
                    'type': 'circle',
                    'source': 'places'+key,
                    'layout': {'visibility': key==mapFocus ? 'visible' : 'none'},
                    'paint': {
                        'circle-radius': {
                            'base': 1.75,
                            'stops': [[12, 2],[22, 50]]
                        },
                        'circle-color': ['match', ['get', "color"]].concat(keyVars["color_arr"])
                    }
                });
                var popup = new mapboxgl.Popup({
                    offset: [0, -7],
                    closeButton: false,
                    closeOnClick: false
                });
                    
                map.on('mouseenter', key, (e) => {
                    map.getCanvas().style.cursor = 'pointer'; // Change the cursor style as a UI indicator.
                    mapFocusDict[key]["set_key"](e);
                });
                    
                map.on('mouseleave', key, () => {
                    map.getCanvas().style.cursor = '';
                    popup.remove();
                });

            }
        });
        map.on('idle', () => {
            setMapSet(map)
        });
    }

    useEffect(() => {
        update_map()  
    },[])

    useEffect(() => {
        if (mapSet != null){
            for(let [key, value] of Object.entries(mapFocusDict)){
                const colors = ['match', ['get', "color"]].concat(keyVars["color_arr"])
                if (key != mapFocus) {
                    mapSet.setLayoutProperty(key, 'visibility', 'none');
                } else {
                    mapSet.setLayoutProperty(key, 'visibility','visible');
                    mapSet.setPaintProperty(key, 'circle-color',colors);
                }       
            }      
        }
    },[mapFocus])

    const handleChange = (event) => {
        if ( mapFocus ==  "Vacancy"){
            setMapFocus("Duration");
        } else if ( mapFocus ==  "Duration") {
            setMapFocus("Prediction");
        } else {
            setMapFocus("Vacancy");
        }
    }

    return (
        <div> 
            <div ref={mapContainer} style={{ width: "100vw", height: "100vh" }}>
                <div id="state-legend" className="legend" style={legend_style}>
                    <h4 style={legend_h4_style}>{mapFocus}</h4>
                    {Object.entries(mapFocusDict[mapFocus]["strings"]).map((item, index) => 
                        <div key={"map".concat("",index)}><span style={{...legend_div_span_style, backgroundColor: keyVars["color_dict"][index]}}></span>{mapFocusDict[mapFocus]["strings"][index]}</div>
                    )}
                </div>
                <div id="state-legend" className="legend" style={legend_style_left}>
                    {mapFocusDict[mapFocus]["htm"]}
                    <Button variant="outlined" onClick={handleChange}> {mapFocus} </Button>
                </div>
            </div>
        </div>
    )
}