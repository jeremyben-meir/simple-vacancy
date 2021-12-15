import './App.css';
import { BrowserRouter as Router , Routes , Route } from "react-router-dom";
import React from "react";

import Home from './views/Home.js';
import NoMatch from './views/NoMatch';

const brand = { name: "simple-vacancy", to: "home" };

function App() {
  return (
    <div>
      {Home()}
    </div>
  );
}

export default App;
