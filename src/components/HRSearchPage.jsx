
import React, { useState } from 'react';

const GITHUB_PAT = process.env.REACT_APP_GITHUB_PAT; // Optional: Add GitHub token here

const SearchTalent = () => {
    const [skill, setSkill] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const headers = GITHUB_PAT
        ? { Authorization: `token ${GITHUB_PAT}` }
        : {};

    const searchGithubUsers = async () => {
        if (!skill) return;
        setLoading(true);
        setResults([]);

        try {
            const res = await fetch(
                `https://api.github.com/search/users?q=${encodeURIComponent(skill)}+in:bio`,
                { headers }
            );
            const data = await res.json();

            const users = await Promise.all(
                data.items.slice(0, 5).map(async (user) => {
                    const [detailsRes, reposRes] = await Promise.all([
                        fetch(user.url, { headers }),
                        fetch(`${user.url}/repos`, { headers }),
                    ]);
                    const userDetails = await detailsRes.json();
                    const repos = await reposRes.json();

                    // Extract top 5 repo languages as skills
                    const languageSet = new Set();
                    repos.slice(0, 10).forEach((repo) => {
                        if (repo.language) languageSet.add(repo.language);
                    });

                    const experienceYears = new Date().getFullYear() - new Date(userDetails.created_at).getFullYear();

                    return {
                        username: userDetails.login,
                        name: userDetails.name || 'Not provided',
                        avatar_url: userDetails.avatar_url,
                        html_url: userDetails.html_url,
                        bio: userDetails.bio,
                        skills: Array.from(languageSet),
                        experienceYears,
                    };
                })
            );

            setResults(users);
        } catch (err) {
            console.error("Error fetching GitHub users:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleHire = (profile) => {
        const existing = JSON.parse(localStorage.getItem('githubProfiles') || '[]');
        const alreadyExists = existing.find((p) => p.username === profile.username);
        if (alreadyExists) return alert("Already hired!");

        const newProfile = {
            username: profile.username,
            name: profile.name,
            skills: profile.skills,
            experienceYears: profile.experienceYears,
        };

        const updated = [...existing, newProfile];
        localStorage.setItem('githubProfiles', JSON.stringify(updated));
        alert(`Hired ${profile.username}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">🔍 Search Developers (GitHub)</h1>

            <div className="flex gap-3 max-w-xl mx-auto mb-8">
                <input
                    type="text"
                    className="p-3 border rounded w-full shadow-sm"
                    placeholder="Search skill like React, Python, Java..."
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                />
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                    onClick={searchGithubUsers}
                >
                    Search
                </button>
            </div>

            {loading && <p className="text-center">Loading...</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mt-6">
                {results.map((user) => (
                    <div
                        key={user.username}
                        className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-5 border flex flex-col"
                    >
                        <div className="flex items-center mb-4 gap-4">
                            <img
                                src={user.avatar_url}
                                alt="avatar"
                                className="w-16 h-16 rounded-full border-2 border-blue-500 shadow"
                            />
                            <div>
                                <p className="text-lg font-bold text-gray-800">{user.name}</p>
                                <p className="text-sm text-gray-500">@{user.username}</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{user.bio}</p>

                        <p className="text-sm font-medium text-gray-700 mb-1">Experience: <span className="text-black">{user.experienceYears} years</span></p>

                        <div className="flex flex-wrap gap-2 mb-3">
                            {user.skills.length > 0 ? (
                                user.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
                                    >
              {skill}
            </span>
                                ))
                            ) : (
                                <span className="text-xs text-gray-400">No skills detected</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t">
                            <a
                                href={user.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                GitHub Profile
                            </a>
                            <button
                                onClick={() => handleHire(user)}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1 rounded-full"
                            >
                                Hire
                            </button>
                        </div>
                    </div>
                ))}
            </div>


            {!loading && results.length === 0 && (
                <p className="text-center text-gray-500 mt-12">No results found. Try a different skill.</p>
            )}
        </div>
    );
};

export default SearchTalent;

