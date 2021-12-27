import {Map} from '../components/Map.js';
import disableScroll from 'disable-scroll';
import React, { useState, useEffect } from "react";
import * as LLIDPlacesJSON from "../assets/temp/llid_timeline.json";
import * as BBLPlacesJSON from "../assets/temp/bbl_timeline.json";
import * as PredictionsJSON from "../assets/temp/predictions.json";

const Home = () => {
  const [errorSig, setErrorSig] = useState(null)
  const [BBLPlaces, setBBLPlaces] = useState(false)
  const [LLIDPlaces, setLLIDPlaces] = useState(null)
  const [predictions, setPredictions] = useState(null)

  useEffect( () => disableScroll.on(), [] );
  useEffect( () => () => disableScroll.off(), [] );

  useEffect(() => {
      setBBLPlaces(BBLPlacesJSON.default)
      setLLIDPlaces(LLIDPlacesJSON.default)
      setPredictions(PredictionsJSON.default)
    },[])

  var errorStyle = {
    textAlign:"center",
    lineHeight: "300px",
    height: "100%",
    // border: "3px solid green"
  }

  var errorDisplay = (
    <p style={errorStyle}>Error retrieving data. Try again soon! In the meantime, visit our other pages to learn more!</p>
  )
  var mapDisplay = (
    <Map BBLPlaces={BBLPlaces} LLIDPlaces={LLIDPlaces}  predictions={predictions}/>
  )

  return (
    LLIDPlaces != null ? mapDisplay : (errorSig && errorDisplay)
  );
}

export default Home;