// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode is temporarily disabled. It can cause issues in development
  // with libraries that are not fully compatible with its double-invocation of effects,
  // which appears to be the case with the Socket.IO connection logic.
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
);