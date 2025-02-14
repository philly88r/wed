import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('TEST 123 - Main.tsx is loading!')

// Create a test element
const testDiv = document.createElement('div')
testDiv.style.position = 'fixed'
testDiv.style.top = '0'
testDiv.style.left = '0'
testDiv.style.backgroundColor = 'red'
testDiv.style.color = 'white'
testDiv.style.padding = '20px'
testDiv.style.zIndex = '9999'
testDiv.textContent = 'TEST - Main.tsx loaded at ' + new Date().toLocaleTimeString()
document.body.appendChild(testDiv)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
