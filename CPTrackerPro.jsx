import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Filter, Search, TrendingUp, Calendar, Award, Target, CheckCircle, XCircle, Clock } from 'lucide-react';

const CPTrackerPro = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [problems, setProblems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newProblem, setNewProblem] = useState({
    name: '',
    difficulty: 900,
    topic: 'Arrays',
    platform: 'CodeForces',
    status: 'unsolved',
    link: '',
    notes: ''
  });

  const topics = ['Arrays', 'Strings', 'Two Pointers', 'Binary Search', 'Sorting', 'Greedy', 'Dynamic Programming', 'Graphs', 'Trees', 'Math', 'Recursion', 'Backtracking', 'Bit Manipulation', 'Stack', 'Queue', 'Heap'];
  
  const platforms = ['CodeForces', 'CodeChef', 'LeetCode', 'AtCoder', 'CSES'];

  // Load problems from storage
  useEffect(() => {
    const loadProblems = async () => {
      try {
        const result = await window.storage.get('cp-problems');
        if (result && result.value) {
          setProblems(JSON.parse(result.value));
        }
      } catch (error) {
        setProblems([]);
      }
    };
    loadProblems();
  }, []);

  // Save problems to storage
  const saveProblems = async (updatedProblems) => {
    try {
      await window.storage.set('cp-problems', JSON.stringify(updatedProblems));
      setProblems(updatedProblems);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const addProblem = async () => {
    if (!newProblem.name.trim()) return;
    
    const problem = {
      ...newProblem,
      id: Date.now(),
      dateSolved: newProblem.status === 'solved' ? new Date().toISOString().split('T')[0] : null,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    
    await saveProblems([...problems, problem]);
    setShowAddModal(false);
    setNewProblem({
      name: '',
      difficulty: 900,
      topic: 'Arrays',
      platform: 'CodeForces',
      status: 'unsolved',
      link: '',
      notes: ''
    });
  };

  const updateProblemStatus = async (id, newStatus) => {
    const updated = problems.map(p => 
      p.id === id 
        ? { ...p, status: newStatus, dateSolved: newStatus === 'solved' ? new Date().toISOString().split('T')[0] : null }
        : p
    );
    await saveProblems(updated);
  };

  const deleteProblem = async (id) => {
    await saveProblems(problems.filter(p => p.id !== id));
  };

  // Statistics calculations
  const stats = {
    total: problems.length,
    solved: problems.filter(p => p.status === 'solved').length,
    unsolved: problems.filter(p => p.status === 'unsolved').length,
    revisit: problems.filter(p => p.status === 'revisit').length
  };

  const topicStats = topics.map(topic => ({
    name: topic,
    solved: problems.filter(p => p.topic === topic && p.status === 'solved').length,
    total: problems.filter(p => p.topic === topic).length
  })).filter(t => t.total > 0);

  const difficultyStats = [
    { name: '800-1000', value: problems.filter(p => p.difficulty >= 800 && p.difficulty < 1000).length },
    { name: '1000-1200', value: problems.filter(p => p.difficulty >= 1000 && p.difficulty < 1200).length },
    { name: '1200-1400', value: problems.filter(p => p.difficulty >= 1200 && p.difficulty < 1400).length },
    { name: '1400+', value: problems.filter(p => p.difficulty >= 1400).length }
  ].filter(d => d.value > 0);

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981'];

  // Filtered problems
  const filteredProblems = problems.filter(p => {
    const matchesTopic = filterTopic === 'all' || p.topic === filterTopic;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesStatus && matchesSearch;
  });

  // Dashboard View
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Problems</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <Target className="w-12 h-12 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Solved</p>
              <p className="text-3xl font-bold mt-1">{stats.solved}</p>
            </div>
            <CheckCircle className="w-12 h-12 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Unsolved</p>
              <p className="text-3xl font-bold mt-1">{stats.unsolved}</p>
            </div>
            <XCircle className="w-12 h-12 opacity-50" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">To Revisit</p>
              <p className="text-3xl font-bold mt-1">{stats.revisit}</p>
            </div>
            <Clock className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Topic-wise Progress</h3>
          {topicStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="solved" fill="#8b5cf6" />
                <Bar dataKey="total" fill="#4b5563" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-20">No data yet. Start adding problems!</p>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Difficulty Distribution</h3>
          {difficultyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-20">No data yet. Start adding problems!</p>
          )}
        </div>
      </div>
    </div>
  );

  // Problems View
  const ProblemsView = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Topics</option>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
            <option value="revisit">Revisit</option>
          </select>
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-3">
        {filteredProblems.length > 0 ? (
          filteredProblems.map(problem => (
            <div key={problem.id} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{problem.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      problem.status === 'solved' ? 'bg-green-500/20 text-green-400' :
                      problem.status === 'unsolved' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {problem.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {problem.difficulty}
                    </span>
                    <span>•</span>
                    <span>{problem.topic}</span>
                    <span>•</span>
                    <span>{problem.platform}</span>
                    {problem.dateSolved && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {problem.dateSolved}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {problem.notes && (
                    <p className="mt-2 text-sm text-gray-400">{problem.notes}</p>
                  )}
                  
                  {problem.link && (
                    <a 
                      href={problem.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block"
                    >
                      View Problem →
                    </a>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => updateProblemStatus(problem.id, problem.status === 'solved' ? 'unsolved' : 'solved')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      problem.status === 'solved'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {problem.status === 'solved' ? 'Unsolve' : 'Mark Solved'}
                  </button>
                  <button
                    onClick={() => deleteProblem(problem.id)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-400">No problems found. Try adjusting your filters or add a new problem!</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">CP Tracker Pro</h1>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition"
            >
              <Plus className="w-5 h-5" />
              Add Problem
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-900/30 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-6 py-3 font-medium transition ${
                currentView === 'dashboard'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('problems')}
              className={`px-6 py-3 font-medium transition ${
                currentView === 'problems'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Problems ({problems.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'dashboard' ? <DashboardView /> : <ProblemsView />}
      </div>

      {/* Add Problem Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Add New Problem</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Problem Name *</label>
                <input
                  type="text"
                  value={newProblem.name}
                  onChange={(e) => setNewProblem({...newProblem, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Two Sum"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty Rating</label>
                <input
                  type="number"
                  value={newProblem.difficulty}
                  onChange={(e) => setNewProblem({...newProblem, difficulty: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Topic</label>
                <select
                  value={newProblem.topic}
                  onChange={(e) => setNewProblem({...newProblem, topic: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {topics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
                <select
                  value={newProblem.platform}
                  onChange={(e) => setNewProblem({...newProblem, platform: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={newProblem.status}
                  onChange={(e) => setNewProblem({...newProblem, status: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="unsolved">Unsolved</option>
                  <option value="solved">Solved</option>
                  <option value="revisit">Revisit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Problem Link</label>
                <input
                  type="url"
                  value={newProblem.link}
                  onChange={(e) => setNewProblem({...newProblem, link: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://codeforces.com/..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                <textarea
                  value={newProblem.notes}
                  onChange={(e) => setNewProblem({...newProblem, notes: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Your approach, learnings, etc."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={addProblem}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition"
              >
                Add Problem
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CPTrackerPro;