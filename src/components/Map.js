import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl"
import '../assets/App.css';
import {colorDict, naics_string_dict, duration_string_dict,turnover_string_dict,vacancy_string_dict,legend_style,legend_style_left,legend_h4_style,legend_div_span_style} from "../assets/MapSettings.js";

mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN

export const Map = (params) => {

    const LLIDPlaces = params["LLIDPlaces"];
    const BBLPlaces = params["BBLPlaces"];
    const mapContainer = useRef()
    const [hover, setHover] = useState({})
    const [mapFocus, setMapFocus] = useState("Vacancy")
    const [mapSet, setMapSet] = useState()

    const mapFocusDict = {
        'Duration':{
            "strings": duration_string_dict,
            "places": LLIDPlaces
        },
        'Vacancy':{
            "strings": vacancy_string_dict,
            "places": BBLPlaces
        },
        // 'NAICS':{
        //     "strings": naics_string_dict,
        //     "places": LLIDPlaces
        // },
        // 'Turnover':{
        //     "strings": turnover_string_dict,
        //     "places": BBLPlaces
        // }
    }

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

                // console.log(mapFocusDict[key]["places"].default)
                // console.log(BBLPlaces)
                // console.log(LLIDPlaces)

                map.addLayer({
                    'id': key,
                    'type': 'circle',
                    'source': 'places'+key,
                    'layout': {
                        'visibility': key==mapFocus ? 'visible' : 'none',
                    },
                    'paint': {
                        'circle-radius': {
                            'base': 1.75,
                            'stops': [
                                [12, 2],
                                [22, 50]
                            ]
                        },
                        'circle-color': [
                            'match',
                            ['get', key],
                            "0", colorDict['0'],
                            "1", colorDict['1'],
                            "2", colorDict['2'],
                            "3", colorDict['3'],
                            "4", colorDict['4'],
                            "5", colorDict['5'],
                            "6", colorDict['6'],
                            "7", colorDict['7'],
                            "8", colorDict['8'],
                            "9", colorDict['9'],
                            /* other */ colorDict['10']
                        ]
                    }
                });
                var popup = new mapboxgl.Popup({
                    offset: [0, -7],
                    closeButton: false,
                    closeOnClick: false
                });
                    
                map.on('mouseenter', key, (e) => {
                    map.getCanvas().style.cursor = 'pointer'; // Change the cursor style as a UI indicator.
                    if (key == "NAICS" || key == "Duration"){
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
                    } else {
                        const bbl = e.features[0].properties.BBL;
                        const vacancy = e.features[0].properties.vacancy;
                        const turnover = e.features[0].properties.turnover;
                        const maxbus = e.features[0].properties["Max Business"];
    
                        setHover({
                            "bbl": bbl,
                            "vacancy": vacancy,
                            "turnover": turnover,
                            "maxbus": maxbus
                        })
                    }
                    
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

    // useEffect(() => {

    //     s3.getObject({
    //         Bucket: process.env.REACT_APP_INTERNAL_BUCKET_NAME,
    //         Key: 'data/bbl_timeline.json',
    //     }, (err, data) => {
    //         if (err) {
    //             console.log(err, err.stack);
    //         } else {
    //             var response = JSON.parse(data.Body.toString())
    //             setBBLPlaces(response)
    //         }
    //     });

    //     s3.getObject({
    //         Bucket: process.env.REACT_APP_INTERNAL_BUCKET_NAME,
    //         Key: 'data/llid_timeline.json',
    //     }, (err, data) => {
    //         if (err) {
    //             console.log(err, err.stack);
    //         } else {
    //             var response = JSON.parse(data.Body.toString())
    //             setLLIDPlaces(response)
    //         }
    //     });

    //     // update_map()            
    // },[])

    useEffect(() => {
        update_map()  
    },[LLIDPlaces])

    useEffect(() => {
        if (mapSet != null){
            for(let [key, value] of Object.entries(mapFocusDict)){
                if (key != mapFocus) {
                    mapSet.setLayoutProperty(key, 'visibility', 'none');
                } else {
                    mapSet.setLayoutProperty(key, 'visibility','visible');
                }       
            }      
        }
    },[mapFocus])

    const handleChange = (event) => {
        if (mapFocus ==  "Vacancy"){
            setMapFocus("Duration");
        } else {
            setMapFocus("Vacancy");
        }
    }

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
            <b>TURNOVER: </b>{hover.turnover && hover.turnover} <br/>
            <b>MAX BUSINESS #: </b>{hover.maxbus && hover.maxbus}
        </div>
    )

    return (
        <div> 
            <div ref={mapContainer} style={{ width: "100vw", height: "100vh" }}>
                <div id="state-legend" className="legend" style={legend_style}>
                    <h4 style={legend_h4_style}>{mapFocus}</h4>
                    {Object.entries(mapFocusDict[mapFocus]["strings"]).map((item, index) => 
                        <div key={"map".concat("",index)}><span style={{...legend_div_span_style, backgroundColor: colorDict[index]}}></span>{mapFocusDict[mapFocus]["strings"][index]}</div>
                    )}
                </div>
                <div id="state-legend" className="legend" style={legend_style_left}>
                    {(mapFocus == "Vacancy" || mapFocus == "Turnover") ? bbl_htm : llid_htm}
                    <input type="checkbox" className="toggle-switch-checkbox" name="checkbox" id="checkbox" onChange={handleChange} /> Vacancy / Duration
                </div>
            </div>
        </div>
    )


    
}