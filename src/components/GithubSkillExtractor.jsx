import React, { useState } from "react";

export default function SearchGithubUser() {
    const [username, setUsername] = useState("");
    const [userData, setUserData] = useState(null);
    const [repos, setRepos] = useState([]);
    const [error, setError] = useState(null);
    const extractUsername = (input) => {
        try {
            if (input.startsWith("http")) {
                const url = new URL(input);
                return url.pathname.replace(/^\/+|\/+$/g, "");
            }
            return input;
        } catch {
            return input;
        }
    };

    const searchUser = async () => {
        setError(null);
        setUserData(null);
        setRepos([]);
        if (!username) return;

        const cleanUsername = extractUsername(username);

        try {
            const userResponse = await fetch(`https://api.github.com/users/${cleanUsername}`);
            if (!userResponse.ok) {
                throw new Error(`User not found or rate limit exceeded (${userResponse.status})`);
            }
            const user = await userResponse.json();
            setUserData(user);

            // Fetch repos
            const reposResponse = await fetch(user.repos_url);
            if (!reposResponse.ok) {
                throw new Error(`Could not fetch repos (${reposResponse.status})`);
            }
            const reposData = await reposResponse.json();

            // Fetch languages from each repo
            const languageCounts = {};
            for (const repo of reposData) {
                const langRes = await fetch(repo.languages_url);
                const langData = await langRes.json();
                for (const lang in langData) {
                    languageCounts[lang] = (languageCounts[lang] || 0) + langData[lang];
                }
            }

            // Convert to array of skills sorted by usage
            const sortedSkills = Object.entries(languageCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([lang]) => lang);

            setRepos(sortedSkills); // reusing `repos` to store skills
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <input
                type="text"
                placeholder="GitHub username"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                style={{ padding: 5, width: 200 }}
            />
            <button onClick={searchUser} style={{ marginLeft: 10, padding: 5 }}>
                Search
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {userData && (
                <div style={{ marginTop: 20 }}>
                    <h2>{userData.name || userData.login}</h2>
                    <img
                        src={userData.avatar_url}
                        alt="avatar"
                        width={100}
                        style={{ borderRadius: "50%" }}
                    />
                    <p>{userData.bio}</p>
                    <p>
                        Followers: {userData.followers} | Following: {userData.following}
                    </p>
                </div>
            )}

            {repos.length > 0 && (
                <div>
                    <h3>Skills (Languages):</h3>
                    <ul>
                        {repos.map((skill, index) => (
                            <li key={index}>{skill}</li>
                        ))}
                    </ul>
                </div>
            )}

        </div>
    );
}
