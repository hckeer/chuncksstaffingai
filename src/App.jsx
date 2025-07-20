// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import StaffingApp from "./components/StaffingApp.jsx";
import GitHubSkillExtractor from "./components/GithubSkillExtractor.jsx";
import './App.css';
import {ProfileProvider} from "./components/ProfileContext.jsx";
import HRSearchPage from "./components/HRSearchPage.jsx";

function HomePage() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/github');
    };
    const handlesClick = () => {
        navigate('/staffing');
    };
    const handlessClick = () => {
        navigate('/search');
    };


    return (
        <ProfileProvider>
        <div>
            <h1>Home Page</h1>
            <button type="button" onClick={handleClick}>
                Go to GitHub Skill Extractor
            </button>
            <button type="button" onClick={handlesClick}>
                Go to HR dashboard to provide task to employees
            </button>
            <button type="button" onClick={handlessClick}>
                Go to HR search engine
            </button>
        </div>
        </ProfileProvider>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/github" element={<GitHubSkillExtractor />} />
                <Route path="/staffing" element={<StaffingApp />} />
                <Route path="/search" element={<HRSearchPage />} />
            </Routes>
        </Router>
    );
}

export default App;
