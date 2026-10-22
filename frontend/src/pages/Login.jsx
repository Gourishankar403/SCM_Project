import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, LockKeyhole, ArrowRight, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8004/auth/login', {
        username,
        password
      });
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Authentication failed. Please verify your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden flex items-center justify-center selection:bg-blue-500/30">
      
      {/* High-Contrast Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>
      
      {/* Grid Pattern overlay for tech feel */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 gap-16 p-8 relative z-10 animate-fade-in items-center">
        
        {/* Left Side: Bold Branding */}
        <div className="flex flex-col justify-center space-y-10 pr-8">
          <div className="flex items-center gap-4 bg-white/5 w-max px-6 py-3 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
            <Activity className="w-6 h-6 text-blue-400" strokeWidth={2.5} />
            <h1 className="text-xl font-bold tracking-[0.3em] text-white">SENTINEL<span className="font-light text-blue-400">AI</span></h1>
          </div>
          
          <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Secure.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Intelligent.</span><br/>
            Autonomous.
          </h2>
          
          <p className="text-zinc-300 font-medium leading-relaxed max-w-md text-lg border-l-2 border-blue-500 pl-4">
            Access the multi-agent security operations center. Enter your authorized credentials to begin monitoring network traffic.
          </p>
        </div>

        {/* Right Side: High-Visibility Premium Login Form */}
        <div className="bg-zinc-900/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

          <div className="flex items-center gap-3 mb-10">
            <ShieldCheck className="w-8 h-8 text-blue-400" strokeWidth={2} />
            <h3 className="text-2xl font-bold text-white uppercase tracking-widest">Operator Login</h3>
          </div>
          
          {error && (
            <div className="mb-8 p-5 bg-red-500/20 border border-red-500/30 rounded-xl text-red-100 font-bold text-sm flex items-center gap-3 shadow-lg">
              <LockKeyhole className="w-5 h-5 text-red-400" /> {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-white text-xs font-bold uppercase tracking-widest ml-1">Operator ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-zinc-400 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner placeholder-zinc-600"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your assigned ID"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-white text-xs font-bold uppercase tracking-widest ml-1">Passcode</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockKeyhole className="w-5 h-5 text-zinc-400 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="password"
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner placeholder-zinc-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure passcode"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-3 bg-white text-black hover:bg-zinc-200 py-5 px-6 rounded-xl transition-all mt-10 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/10 hover:shadow-white/20 hover:-translate-y-0.5"
            >
              <span className="font-bold tracking-widest uppercase text-sm">
                {loading ? 'Authenticating...' : 'Authorize Access'}
              </span>
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
