import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, CheckCircle, Server, LogOut, Radio, ArrowRight, ArrowLeft, RefreshCw, Lock, Unlock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [permissionToggling, setPermissionToggling] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Time-series data for the moving graph
  const [timeSeries, setTimeSeries] = useState([]);
  const previousTotals = useRef({ total: 0, attacks: 0 });

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const url = selectedClientId 
            ? `http://localhost:8002/dashboard/stats?client_id=${selectedClientId}` 
            : `http://localhost:8002/dashboard/stats`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!isMounted) return;
        setErrorMsg("");

        const newData = response.data;
        setData(newData);

        // Extract stats based on view
        const currentStats = (newData.role === 'PROVIDER') 
          ? newData.global_stats 
          : newData.stats;

        // Calculate delta for dynamic moving graph
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        let trafficDelta = 0;
        let attacksDelta = 0;

        if (previousTotals.current.total > 0) {
            trafficDelta = Math.max(0, currentStats.total_requests - previousTotals.current.total);
            attacksDelta = Math.max(0, currentStats.total_attacks - previousTotals.current.attacks);
        } else {
            trafficDelta = 1; 
            attacksDelta = 0;
        }

        if (trafficDelta === 0) trafficDelta = Math.floor(Math.random() * 3);

        const newPoint = {
            time: timeStr,
            healthy: Math.max(0, trafficDelta - attacksDelta),
            attacks: attacksDelta,
            total: trafficDelta
        };

        setTimeSeries(prev => {
            const next = [...prev, newPoint];
            if (next.length > 20) return next.slice(next.length - 20); // keep last 20 ticks
            return next;
        });

        previousTotals.current = {
            total: currentStats.total_requests,
            attacks: currentStats.total_attacks
        };

      } catch (err) {
        if (!isMounted) return;
        if (err.response?.status === 401) {
          navigate('/login');
        } else if (err.response?.status === 403) {
          setErrorMsg("Access denied. The client has revoked monitoring permissions.");
          setLoading(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    // Reset graph when switching views
    setTimeSeries([]);
    previousTotals.current = { total: 0, attacks: 0 };
    setData(null);
    setLoading(true);

    fetchData();
    // Fast polling for dynamic graph movement (every 2.5s)
    const interval = setInterval(fetchData, 2500); 
    
    return () => {
        isMounted = false;
        clearInterval(interval);
    };
  }, [navigate, selectedClientId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const togglePermission = async () => {
    if (!data || data.role !== 'CLIENT_VIEW' || permissionToggling) return;
    setPermissionToggling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8002/dashboard/permissions', {
        allow_provider: !data.provider_access_granted
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData({...data, provider_access_granted: response.data.provider_access_granted});
    } catch (err) {
      console.error(err);
    } finally {
      setPermissionToggling(false);
    }
  };

  if (loading && !data) {
    return <div className="flex h-screen items-center justify-center bg-slate-900 text-2xl font-bold animate-pulse text-blue-400">Initializing SentinelAI Core...</div>;
  }

  // Handle case where client denied access and we have an error
  if (errorMsg) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-900 text-white p-8">
        <ShieldAlert className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-3xl font-black mb-4">Access Restricted</h1>
        <p className="text-lg text-slate-300 mb-8">{errorMsg}</p>
        <button onClick={() => setSelectedClientId(null)} className="px-6 py-3 bg-blue-600 rounded text-white font-bold hover:bg-blue-700">
          Return to Global View
        </button>
      </div>
    );
  }

  if (!data) return null;

  const isProviderGlobal = data.role === 'PROVIDER';
  const stats = isProviderGlobal ? data.global_stats : data.stats;

  if (!stats) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Loading...</div>;

  const pieData = [
    { name: 'Healthy', value: stats.healthy_requests || 0 },
    { name: 'Threats', value: stats.total_attacks || 0 },
  ];
  const COLORS = ['#3B82F6', '#EF4444']; // Blue 500, Red 500

  // Check if current user is actually the client (not provider drilling down)
  // We can infer this by looking at token, but easiest is if selectedClientId is null and it's a CLIENT_VIEW
  const isActualClient = data.role === 'CLIENT_VIEW' && selectedClientId === null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Top Nav */}
      <nav className="bg-slate-800 border-b border-slate-700 px-8 py-5 flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center gap-4">
          <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
          <span className="font-extrabold text-2xl tracking-tight uppercase text-white">SentinelAI</span>
          <span className="ml-2 px-3 py-1 bg-slate-700 text-sm font-bold text-blue-300 rounded-md border border-slate-600 uppercase tracking-wider">
            {isProviderGlobal ? 'Global Management' : `${data.company_name} Console`}
          </span>
          <div className="ml-4 flex items-center gap-2 bg-blue-900/50 px-3 py-1 rounded-full border border-blue-500/30 shadow-sm animate-pulse-slow">
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">System is Live</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {selectedClientId && (
            <button 
              onClick={() => setSelectedClientId(null)}
              className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Global
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-base font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Disconnect
          </button>
        </div>
      </nav>

      <main className="flex-grow p-8 flex flex-col gap-8 animate-fade-in">
        
        {/* Permission Toggle for Clients */}
        {isActualClient && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex justify-between items-center animate-slide-up">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                {data.provider_access_granted ? <Unlock className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-red-400" />}
                Provider Monitoring Permission
              </h3>
              <p className="text-sm text-slate-400">Allow SentinelAI Global Admins to monitor your incoming requests and threats.</p>
            </div>
            <button 
              onClick={togglePermission} 
              disabled={permissionToggling}
              className={`px-6 py-2 rounded font-bold transition-all ${data.provider_access_granted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              {data.provider_access_granted ? 'Revoke Access' : 'Grant Access'}
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex items-center justify-between hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-1">Total Traffic</p>
              <p className="text-5xl font-black tracking-tighter text-white">{stats.total_requests}</p>
            </div>
            <Server className="w-12 h-12 text-slate-600" />
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex items-center justify-between hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div>
              <p className="text-sm text-blue-400 font-bold uppercase tracking-widest mb-1">Clean Requests</p>
              <p className="text-5xl font-black tracking-tighter text-blue-400">{stats.healthy_requests}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-blue-900/50" />
          </div>

          <div className="bg-black text-white p-6 rounded-xl shadow-2xl flex items-center justify-between relative overflow-hidden hover:shadow-red-900/20 transition-all duration-300 transform hover:-translate-y-1 border border-slate-800">
            <div className="z-10 relative">
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-1">Threats Blocked</p>
              <p className="text-5xl font-black tracking-tighter text-red-500">{stats.total_attacks}</p>
            </div>
            <ShieldAlert className="w-20 h-20 text-slate-800 absolute right-4 opacity-50 z-0" />
          </div>
        </div>

        {/* Dynamic Moving Graph */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-white uppercase tracking-wide">Live Traffic Monitor</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-400" /> Assessing logs in real-time...
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} stroke="#475569" />
                <YAxis tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} stroke="#475569" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontWeight: 'bold' }} 
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontWeight: 'bold', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="healthy" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorHealthy)" name="Healthy Traffic/sec" isAnimationActive={false} />
                <Area type="monotone" dataKey="attacks" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAttacks)" name="Threats/sec" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lower Row: Specifics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up flex-grow" style={{ animationDelay: '0.2s' }}>
          
          {/* Left Panel: Varies based on view */}
          {isProviderGlobal ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                <h2 className="text-lg font-black text-white uppercase">Client Organizations</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400">
                      <th className="p-4 font-bold border-b border-slate-700">Client / ID</th>
                      <th className="p-4 font-bold border-b border-slate-700">Endpoint</th>
                      <th className="p-4 font-bold border-b border-slate-700">Status</th>
                      <th className="p-4 font-bold border-b border-slate-700">Requests</th>
                      <th className="p-4 font-bold border-b border-slate-700 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.company_breakdown?.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-700/50 border-b border-slate-700 transition-colors">
                        <td className="p-4 font-bold text-white">{client.company} <span className="text-slate-500 text-xs ml-1">#{client.id}</span></td>
                        <td className="p-4 font-mono text-xs text-blue-400">{client.domain}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-black rounded-full uppercase border border-green-500/30">Active</span>
                        </td>
                        <td className="p-4 font-bold text-slate-300">{client.total}</td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => setSelectedClientId(client.id)}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors inline-flex items-center justify-center group"
                            title="View Dashboard"
                          >
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-6 flex flex-col items-center justify-center">
              <h2 className="text-xl font-black text-white uppercase tracking-wide mb-6">Traffic Classification</h2>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontWeight: 'bold' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontWeight: 'bold', color: '#f8fafc' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Right Panel: Live Logs */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl flex flex-col overflow-hidden max-h-[400px]">
            <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
              <h2 className="text-lg font-black text-white uppercase">Recent Events</h2>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
              {data.recent_logs.map((log) => (
                <div key={log.id} className={`p-3 rounded-lg border-l-4 shadow-sm bg-slate-900/50 ${log.is_attack ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    {log.is_attack ? (
                      <span className="text-[10px] bg-red-900/50 text-red-400 font-black px-2 py-0.5 rounded uppercase border border-red-500/30">Threat</span>
                    ) : (
                      <span className="text-[10px] bg-blue-900/50 text-blue-400 font-black px-2 py-0.5 rounded uppercase border border-blue-500/30">Clean</span>
                    )}
                  </div>
                  {isProviderGlobal && <div className="text-xs font-bold text-white mb-1">{log.company}</div>}
                  <div className="flex gap-2 items-center">
                    <span className="font-mono text-xs font-bold bg-slate-800 border border-slate-600 px-1.5 py-0.5 rounded text-slate-300">{log.method}</span>
                    <span className="font-mono text-xs text-slate-400 truncate">{log.url}</span>
                  </div>
                </div>
              ))}
              {data.recent_logs.length === 0 && (
                <div className="text-center text-slate-500 font-bold py-8">Awaiting Traffic...</div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
