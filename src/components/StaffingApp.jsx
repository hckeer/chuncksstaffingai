import React, { useState, useEffect, useMemo } from 'react';
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

const HRDashboard = ({
                         projectTitle,
                         setProjectTitle,
                         projectDescription,
                         setProjectDescription,
                         chunks,
                         setChunks,
                         candidates,
                         setCandidates,
                         rankings,
                         setRankings,
                         loading,
                         setLoading
                     }) => {
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

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl">
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
                            className="w-full p-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm transition-all hover:shadow-glow focus:shadow-glow focus:ring-0 focus:border-blue-400"
                            placeholder="Enter project title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Project Description</label>
                        <textarea
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm transition-all hover:shadow-glow focus:shadow-glow focus:ring-0 focus:border-blue-400 h-24"
                            placeholder="Describe the project requirements and goals"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={generateChunksWithAI}
                            disabled={loading}
                            className="btn-glow flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                        >
                            <Brain className="w-4 h-4" />
                            {loading ? 'Generating...' : 'AI Generate Chunks'}
                        </button>

                        <button
                            onClick={generateSmartChunks}
                            className="btn-glow flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-3 rounded-xl hover:from-purple-600 hover:to-indigo-700"
                        >
                            <Zap className="w-4 h-4" />
                            Smart Generate
                        </button>

                        <button
                            onClick={addManualChunk}
                            className="btn-glow flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-5 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800"
                        >
                            Manual Add Chunk
                        </button>
                    </div>
                </div>
            </div>

            {chunks.length > 0 && (
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold mb-4">Project Chunks</h3>
                    <div className="space-y-4">
                        {chunks.map(chunk => (
                            <div key={chunk.id} className="glass-card border border-white/30 p-4 rounded-xl transition-all hover:shadow-glow">
                                <input
                                    type="text"
                                    value={chunk.title}
                                    onChange={(e) => updateChunk(chunk.id, 'title', e.target.value)}
                                    className="w-full p-3 mb-2 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-300 focus:shadow-glow focus:outline-none"
                                    placeholder="Chunk title"
                                    autoComplete="off"
                                />
                                <textarea
                                    value={chunk.description}
                                    onChange={(e) => updateChunk(chunk.id, 'description', e.target.value)}
                                    className="w-full p-3 mb-2 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-300 focus:shadow-glow focus:outline-none"
                                    placeholder="Chunk description"
                                    autoComplete="off"
                                />
                                <input
                                    type="text"
                                    value={chunk.requiredSkills.join(', ')}
                                    onChange={(e) => updateChunk(chunk.id, 'requiredSkills', e.target.value)}
                                    className="w-full p-3 mb-2 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-300 focus:shadow-glow focus:outline-none"
                                    placeholder="Required skills (comma-separated): JavaScript, React, Node.js, MongoDB"
                                    autoComplete="off"
                                />
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="text-sm font-medium">Difficulty:</label>
                                    <select
                                        value={chunk.difficulty}
                                        onChange={(e) => updateChunk(chunk.id, 'difficulty', parseInt(e.target.value))}
                                        className="border rounded-xl px-3 py-2 bg-white/70 backdrop-blur-sm focus:shadow-glow focus:outline-none"
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
                                        <span key={skill} className="bg-blue-100/80 text-blue-800 px-3 py-1 rounded-xl text-sm backdrop-blur-sm">
                      {skill}
                    </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={generateRankings}
                        className="btn-glow mt-4 bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-teal-700 flex items-center gap-2"
                    >
                        <Star className="w-4 h-4" />
                        Show Chunk Rankings
                    </button>
                </div>
            )}

            {Object.keys(rankings).length > 0 && (
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold mb-4">Candidate Rankings by Chunk</h3>
                    {chunks.map(chunk => (
                        <div key={chunk.id} className="mb-6">
                            <h4 className="font-medium text-lg mb-3">{chunk.title}</h4>
                            {rankings[chunk.id]?.length > 0 ? (
                                <div className="space-y-3">
                                    {rankings[chunk.id].slice(0, 5).map((item, index) => (
                                        <div key={item.candidate.id} className="flex items-center gap-4 p-4 glass-card rounded-xl transition-all hover:shadow-glow">
                                            <div className="font-semibold text-lg text-indigo-600">#{index + 1}</div>
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
};

const CandidatePage = ({
                           chunks,
                           candidates,
                           setCandidates
                       }) => {
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

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Available Candidates ({candidates.length})
                </h2>

                <div className="grid gap-5">
                    {candidates.map(candidate => (
                        <div key={candidate.id} className="glass-card border border-white/30 p-5 rounded-2xl transition-all hover:shadow-glow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                                    <p className="text-gray-600">{candidate.email}</p>
                                    <p className="text-sm text-gray-500">{candidate.overallExperience} years experience</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-30"></div>
                                    <User className="relative w-8 h-8 text-blue-500" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <h4 className="font-medium mb-2">Skills:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.skills.map(skill => (
                                        <span key={skill.name} className="bg-green-100/80 text-green-800 px-3 py-1 rounded-xl text-sm backdrop-blur-sm">
                      {skill.name} (L{skill.confidence}, {skill.experience}y)
                    </span>
                                    ))}
                                </div>
                            </div>

                            {chunks.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Available Chunks:</h4>
                                    <div className="space-y-3">
                                        {chunks.map(chunk => (
                                            <label key={chunk.id} className="flex items-center gap-3 p-3 glass-card rounded-xl cursor-pointer transition-all hover:shadow-glow">
                                                <input
                                                    type="checkbox"
                                                    checked={candidate.selectedChunks.includes(chunk.id)}
                                                    onChange={() => toggleCandidateChunk(candidate.id, chunk.id)}
                                                    className="w-4 h-4 accent-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium">{chunk.title}</div>
                                                    <div className="text-sm text-gray-600">{chunk.description}</div>
                                                </div>
                                                {candidate.selectedChunks.includes(chunk.id) && (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
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

    // Memoize the components to prevent unnecessary re-renders
    const memoizedHRDashboard = useMemo(() => (
        <HRDashboard
            projectTitle={projectTitle}
            setProjectTitle={setProjectTitle}
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
            chunks={chunks}
            setChunks={setChunks}
            candidates={candidates}
            setCandidates={setCandidates}
            rankings={rankings}
            setRankings={setRankings}
            loading={loading}
            setLoading={setLoading}
        />
    ), [projectTitle, projectDescription, chunks, candidates, rankings, loading]);

    const memoizedCandidatePage = useMemo(() => (
        <CandidatePage
            chunks={chunks}
            candidates={candidates}
            setCandidates={setCandidates}
        />
    ), [chunks, candidates]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
            <style jsx global>{`
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.5); }
          50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.8); }
          100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.5); }
        }
        
        .glow-animation {
          animation: glow 2s infinite;
        }
        
        .hover-glow:hover {
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.6);
        }
        
        .shadow-glow {
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
        }
        
        .btn-glow {
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        
        .btn-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          transform: translateY(-3px);
        }
        
        .bg-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 400px;
          background: radial-gradient(ellipse at top, rgba(224, 231, 255, 0.6), transparent 70%);
          z-index: -1;
        }
        
        .tab-glow {
          position: relative;
        }
        
        .tab-glow::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border-radius: 3px;
          opacity: 0.8;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.8);
        }
      `}</style>

            <div className="bg-glow"></div>

            <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/50">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="glow-animation p-1 rounded-full">
                            <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        AI Staffing Solution
                    </h1>
                </div>
            </header>

            <nav className="bg-white/80 backdrop-blur-sm border-b border-white/50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('hr')}
                            className={`py-4 px-1 font-medium text-sm relative ${
                                activeTab === 'hr'
                                    ? 'text-blue-600 tab-glow'
                                    : 'text-gray-500 hover:text-blue-500'
                            }`}
                        >
                            HR Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('candidates')}
                            className={`py-4 px-1 font-medium text-sm relative ${
                                activeTab === 'candidates'
                                    ? 'text-blue-600 tab-glow'
                                    : 'text-gray-500 hover:text-blue-500'
                            }`}
                        >
                            Candidates
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {activeTab === 'hr' && memoizedHRDashboard}
                {activeTab === 'candidates' && memoizedCandidatePage}
            </main>
        </div>
    );
};

export default StaffingApp;
