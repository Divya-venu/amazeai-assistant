console.log('MAIN.JSX: SCRIPT STARTING...');
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

console.log('MAIN.JSX: ATTEMPTING RENDER...');
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
console.log('MAIN.JSX: RENDER CALLED.');
