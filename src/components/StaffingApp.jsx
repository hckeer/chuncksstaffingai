import React, { useState, useEffect } from 'react';
import { Users, Brain, Briefcase, Star, Zap, User, CheckCircle } from 'lucide-react';

// Configuration for Gemini AI
const API_KEY = "AIzaSyBbG6Fkh0QIJEiW2nEq3a6SHPX6Mkvim8Q";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

// Mock data generation
const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'UI/UX', 'Testing', 'DevOps', 'Machine Learning', 'Data Analysis', 'CSS', 'HTML', 'Express.js', 'Vue.js', 'Angular'];
const names = ['Alex Chen', 'Sarah Johnson', 'Mike Rodriguez', 'Emily Davis', 'David Kim', 'Lisa Wang', 'John Smith', 'Maria Garcia', 'James Wilson', 'Anna Lee', 'Tom Brown', 'Jessica Taylor', 'Chris Anderson', 'Nicole White', 'Ryan Jones'];

const generateCandidates = (count = 15) => {
    return Array.from({ length: count }, (_, i) => {
        const candidateSkills = skills
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 8) + 3)
            .map(skill => ({
                name: skill,
                confidence: Math.floor(Math.random() * 5) + 1,
                experience: Math.floor(Math.random() * 10) + 1
            }));

        return {
            id: i + 1,
            name: names[i] || `Candidate ${i + 1}`,
            email: `${names[i]?.toLowerCase().replace(' ', '.')}@company.com` || `candidate${i + 1}@company.com`,
            skills: candidateSkills,
            overallExperience: Math.floor(Math.random() * 15) + 1,
            selectedChunks: []
        };
    });
};

const StaffingApp = () => {
    const [activeTab, setActiveTab] = useState('hr');
    const [projectTitle, setProjectTitle] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [chunks, setChunks] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [rankings, setRankings] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setCandidates(generateCandidates());
    }, []);

    // Fallback chunk generation based on common project patterns
    const generateSmartChunks = () => {
        if (!projectTitle || !projectDescription) {
            alert('Please enter project title and description');
            return;
        }

        const description = projectDescription.toLowerCase();
        let suggestedChunks = [];

        // Pattern matching for common project types
        if (description.includes('web') || description.includes('frontend') || description.includes('ui')) {
            suggestedChunks = [
                { title: 'UI/UX Design & Wireframes', description: 'Design user interface mockups and user experience flows', requiredSkills: ['UI/UX', 'JavaScript', 'React'], difficulty: 3 },
                { title: 'Frontend Development', description: 'Implement responsive web components and user interfaces', requiredSkills: ['JavaScript', 'React', 'CSS'], difficulty: 4 },
                { title: 'API Integration', description: 'Connect frontend with backend services and APIs', requiredSkills: ['JavaScript', 'React', 'APIs'], difficulty: 3 },
                { title: 'Testing & Quality Assurance', description: 'Write tests and ensure application quality', requiredSkills: ['Testing', 'JavaScript'], difficulty: 2 }
            ];
        } else if (description.includes('backend') || description.includes('api') || description.includes('server')) {
            suggestedChunks = [
                { title: 'Database Design', description: 'Design and implement database schema', requiredSkills: ['SQL', 'MongoDB', 'Database Design'], difficulty: 4 },
                { title: 'API Development', description: 'Build RESTful APIs and backend services', requiredSkills: ['Node.js', 'Python', 'Java'], difficulty: 4 },
                { title: 'Authentication & Security', description: 'Implement user authentication and security measures', requiredSkills: ['Node.js', 'Security', 'JWT'], difficulty: 5 },
                { title: 'Deployment & DevOps', description: 'Deploy application and set up CI/CD pipeline', requiredSkills: ['DevOps', 'AWS', 'Docker'], difficulty: 3 }
            ];
        } else if (description.includes('mobile') || description.includes('app')) {
            suggestedChunks = [
                { title: 'Mobile UI Development', description: 'Create mobile app user interface', requiredSkills: ['React', 'UI/UX', 'Mobile'], difficulty: 4 },
                { title: 'App Logic & Features', description: 'Implement core app functionality', requiredSkills: ['JavaScript', 'React', 'Mobile'], difficulty: 4 },
                { title: 'Data Management', description: 'Handle local storage and sync', requiredSkills: ['JavaScript', 'Database'], difficulty: 3 },
                { title: 'Testing & Optimization', description: 'Test app performance and optimize', requiredSkills: ['Testing', 'Performance'], difficulty: 3 }
            ];
        } else {
            // Generic project chunks
            suggestedChunks = [
                { title: 'Requirements Analysis', description: 'Analyze and document project requirements', requiredSkills: ['Analysis', 'Documentation'], difficulty: 2 },
                { title: 'Core Development', description: 'Implement main project functionality', requiredSkills: ['JavaScript', 'Python', 'Programming'], difficulty: 4 },
                { title: 'Integration & Testing', description: 'Integrate components and perform testing', requiredSkills: ['Testing', 'Integration'], difficulty: 3 },
                { title: 'Documentation & Deployment', description: 'Document project and deploy to production', requiredSkills: ['Documentation', 'DevOps'], difficulty: 2 }
            ];
        }

        const formattedChunks = suggestedChunks.map((chunk, index) => ({
            id: index + 1,
            ...chunk
        }));

        setChunks(formattedChunks);
    };

    // AI chunk generation using Gemini with fallback
    const generateChunksWithAI = async () => {
        if (!projectTitle || !projectDescription) {
            alert('Please enter project title and description');
            return;
        }

        setLoading(true);
        try {
            const prompt = `Break down this project into 4-6 manageable chunks/tasks:
      
Project: ${projectTitle}
Description: ${projectDescription}

For each chunk, provide:
1. A clear title
2. Brief description
3. Required skills (from: ${skills.join(', ')})
4. Estimated difficulty (1-5)

Format as JSON array with objects containing: title, description, requiredSkills, difficulty`;

            const response = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (response.status === 429) {
                throw new Error('Rate limit exceeded');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'API Error');
            }

            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (aiResponse) {
                // Extract JSON from AI response
                const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const aiChunks = JSON.parse(jsonMatch[0]);
                    const formattedChunks = aiChunks.map((chunk, index) => ({
                        id: index + 1,
                        title: chunk.title,
                        description: chunk.description,
                        requiredSkills: Array.isArray(chunk.requiredSkills) ? chunk.requiredSkills : [],
                        difficulty: chunk.difficulty || 3
                    }));
                    setChunks(formattedChunks);
                }
            }
        } catch (error) {
            console.error('AI generation failed:', error);

            if (error.message.includes('Rate limit') || error.message.includes('429')) {
                alert('⚠️ AI API rate limit reached. Using smart fallback generation instead!');
                generateSmartChunks();
            } else {
                alert('AI generation failed. Using smart fallback generation instead!');
                generateSmartChunks();
            }
        }
        setLoading(false);
    };

    const addManualChunk = () => {
        const newChunk = {
            id: chunks.length + 1,
            title: '',
            description: '',
            requiredSkills: [],
            difficulty: 3
        };
        setChunks([...chunks, newChunk]);
    };

    const updateChunk = (id, field, value) => {
        setChunks(chunks.map(chunk => {
            if (chunk.id === id) {
                if (field === 'requiredSkills') {
                    // Handle skills as comma-separated string
                    const skillsArray = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    return { ...chunk, [field]: skillsArray };
                }
                return { ...chunk, [field]: value };
            }
            return chunk;
        }));
    };

    const toggleCandidateChunk = (candidateId, chunkId) => {
        setCandidates(candidates.map(candidate => {
            if (candidate.id === candidateId) {
                const selected = candidate.selectedChunks.includes(chunkId);
                return {
                    ...candidate,
                    selectedChunks: selected
                        ? candidate.selectedChunks.filter(id => id !== chunkId)
                        : [...candidate.selectedChunks, chunkId]
                };
            }
            return candidate;
        }));
    };

    const calculateCandidateScore = (candidate, chunk) => {
        if (!candidate.selectedChunks.includes(chunk.id)) return 0;

        let score = 0;
        let matchingSkills = 0;
        const totalRequiredSkills = chunk.requiredSkills.length;

        if (totalRequiredSkills === 0) return 10; // Base score if no specific skills required

        chunk.requiredSkills.forEach(requiredSkill => {
            // Case-insensitive skill matching
            const candidateSkill = candidate.skills.find(s =>
                s.name.toLowerCase() === requiredSkill.toLowerCase()
            );
            if (candidateSkill) {
                matchingSkills++;
                score += candidateSkill.confidence * candidateSkill.experience;
            }
        });

        // If no skills match but candidate selected the chunk, give partial credit
        if (matchingSkills === 0) {
            return candidate.overallExperience / chunk.difficulty;
        }

        const skillMatchRatio = matchingSkills / totalRequiredSkills;
        const experienceBonus = candidate.overallExperience / 15;

        return (score * skillMatchRatio * (1 + experienceBonus)) / chunk.difficulty;
    };

    const generateRankings = () => {
        const newRankings = {};

        chunks.forEach(chunk => {
            const candidateScores = candidates
                .map(candidate => ({
                    candidate,
                    score: calculateCandidateScore(candidate, chunk)
                }))
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score);

            newRankings[chunk.id] = candidateScores;
        });

        setRankings(newRankings);
    };

    const HRDashboard = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Project Setup
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Project Title</label>
                        <input
                            type="text"
                            value={projectTitle}
                            onChange={(e) => setProjectTitle(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            placeholder="Enter project title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Project Description</label>
                        <textarea
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            className="w-full p-2 border rounded-md h-24"
                            placeholder="Describe the project requirements and goals"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={generateChunksWithAI}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Brain className="w-4 h-4" />
                            {loading ? 'Generating...' : 'AI Generate Chunks'}
                        </button>

                        <button
                            onClick={generateSmartChunks}
                            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                        >
                            <Zap className="w-4 h-4" />
                            Smart Generate
                        </button>

                        <button
                            onClick={addManualChunk}
                            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                        >
                            Manual Add Chunk
                        </button>
                    </div>
                </div>
            </div>

            {chunks.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Project Chunks</h3>
                    <div className="space-y-4">
                        {chunks.map(chunk => (
                            <div key={chunk.id} className="border p-4 rounded-md">
                                <input
                                    type="text"
                                    value={chunk.title}
                                    onChange={(e) => updateChunk(chunk.id, 'title', e.target.value)}
                                    className="w-full p-2 border rounded-md mb-2"
                                    placeholder="Chunk title"
                                    autoComplete="off"
                                />
                                <textarea
                                    value={chunk.description}
                                    onChange={(e) => updateChunk(chunk.id, 'description', e.target.value)}
                                    className="w-full p-2 border rounded-md mb-2"
                                    placeholder="Chunk description"
                                    autoComplete="off"
                                />
                                <input
                                    type="text"
                                    value={chunk.requiredSkills.join(', ')}
                                    onChange={(e) => updateChunk(chunk.id, 'requiredSkills', e.target.value)}
                                    className="w-full p-2 border rounded-md mb-2"
                                    placeholder="Required skills (comma-separated): JavaScript, React, Node.js, MongoDB"
                                    autoComplete="off"
                                />
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="text-sm font-medium">Difficulty:</label>
                                    <select
                                        value={chunk.difficulty}
                                        onChange={(e) => updateChunk(chunk.id, 'difficulty', parseInt(e.target.value))}
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value={1}>1 - Easy</option>
                                        <option value={2}>2 - Simple</option>
                                        <option value={3}>3 - Medium</option>
                                        <option value={4}>4 - Hard</option>
                                        <option value={5}>5 - Expert</option>
                                    </select>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {chunk.requiredSkills.map(skill => (
                                        <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={generateRankings}
                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                        <Star className="w-4 h-4" />
                        Show Chunk Rankings
                    </button>
                </div>
            )}

            {Object.keys(rankings).length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Candidate Rankings by Chunk</h3>
                    {chunks.map(chunk => (
                        <div key={chunk.id} className="mb-6">
                            <h4 className="font-medium text-lg mb-3">{chunk.title}</h4>
                            {rankings[chunk.id]?.length > 0 ? (
                                <div className="space-y-2">
                                    {rankings[chunk.id].slice(0, 5).map((item, index) => (
                                        <div key={item.candidate.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                                            <div className="font-semibold text-lg">#{index + 1}</div>
                                            <div className="flex-1">
                                                <div className="font-medium">{item.candidate.name}</div>
                                                <div className="text-sm text-gray-600">{item.candidate.email}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-green-600">Score: {item.score.toFixed(1)}</div>
                                                <div className="text-sm text-gray-500">{item.candidate.overallExperience}y exp</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No candidates selected for this chunk</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const CandidatePage = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Available Candidates ({candidates.length})
                </h2>

                <div className="grid gap-4">
                    {candidates.map(candidate => (
                        <div key={candidate.id} className="border p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                                    <p className="text-gray-600">{candidate.email}</p>
                                    <p className="text-sm text-gray-500">{candidate.overallExperience} years experience</p>
                                </div>
                                <User className="w-8 h-8 text-gray-400" />
                            </div>

                            <div className="mb-4">
                                <h4 className="font-medium mb-2">Skills:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.skills.map(skill => (
                                        <span key={skill.name} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {skill.name} (L{skill.confidence}, {skill.experience}y)
                    </span>
                                    ))}
                                </div>
                            </div>

                            {chunks.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Available Chunks:</h4>
                                    <div className="space-y-2">
                                        {chunks.map(chunk => (
                                            <label key={chunk.id} className="flex items-center gap-3 p-2 border rounded cursor-pointer hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={candidate.selectedChunks.includes(chunk.id)}
                                                    onChange={() => toggleCandidateChunk(candidate.id, chunk.id)}
                                                    className="w-4 h-4"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium">{chunk.title}</div>
                                                    <div className="text-sm text-gray-600">{chunk.description}</div>
                                                </div>
                                                {candidate.selectedChunks.includes(chunk.id) && (
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-blue-600" />
                        AI Staffing Solution
                    </h1>
                </div>
            </header>

            <nav className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('hr')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'hr'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            HR Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('candidates')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'candidates'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Candidates
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {activeTab === 'hr' && <HRDashboard />}
                {activeTab === 'candidates' && <CandidatePage />}
            </main>
        </div>
    );
};

export default StaffingApp;
