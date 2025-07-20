import { StrictMode } from 'react'
import React from "react"
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ProfileProvider} from "./components/ProfileContext.jsx";


createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ProfileProvider>
            <App />
        </ProfileProvider>
    </React.StrictMode>,
)
