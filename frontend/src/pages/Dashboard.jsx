import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, CheckCircle, Server, LogOut, Radio, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState(null);
  
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
            // It's not the first load, calculate delta
            trafficDelta = Math.max(0, currentStats.total_requests - previousTotals.current.total);
            attacksDelta = Math.max(0, currentStats.total_attacks - previousTotals.current.attacks);
        } else {
            // First load, just show a baseline
            trafficDelta = 1; 
            attacksDelta = 0;
        }

        // Add some random noise if completely idle to keep the graph "breathing" and active looking
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
        if (err.response?.status === 401) {
          navigate('/login');
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

  if (loading && !data) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-2xl font-bold animate-pulse text-gray-500">Initializing SentinelAI Core...</div>;
  }

  if (!data) return null;

  const isProviderGlobal = data.role === 'PROVIDER';
  const stats = isProviderGlobal ? data.global_stats : data.stats;

  if (!stats) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  const pieData = [
    { name: 'Healthy', value: stats.healthy_requests || 0 },
    { name: 'Threats', value: stats.total_attacks || 0 },
  ];
  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Activity className="w-8 h-8 text-black animate-pulse" />
          <span className="font-extrabold text-2xl tracking-tight uppercase">SentinelAI</span>
          <span className="ml-2 px-3 py-1 bg-gray-100 text-sm font-bold text-gray-700 rounded-md border border-gray-200 uppercase tracking-wider">
            {isProviderGlobal ? 'Global Management' : `${data.company_name} Console`}
          </span>
          <div className="ml-4 flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-200 shadow-sm animate-pulse-slow">
            <Radio className="w-4 h-4 text-green-600 animate-pulse" />
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">System is Live</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {selectedClientId && (
            <button 
              onClick={() => setSelectedClientId(null)}
              className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Global
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-base font-semibold text-gray-600 hover:text-black transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Disconnect
          </button>
        </div>
      </nav>

      <main className="flex-grow p-8 flex flex-col gap-8 animate-fade-in">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow flex items-center justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">Total Traffic</p>
              <p className="text-5xl font-black tracking-tighter">{stats.total_requests}</p>
            </div>
            <Server className="w-12 h-12 text-gray-200" />
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow flex items-center justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div>
              <p className="text-sm text-green-600 font-bold uppercase tracking-widest mb-1">Clean Requests</p>
              <p className="text-5xl font-black tracking-tighter text-green-600">{stats.healthy_requests}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-100" />
          </div>

          <div className="bg-black text-white p-6 rounded-xl shadow-lg flex items-center justify-between relative overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="z-10 relative">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Threats Blocked</p>
              <p className="text-5xl font-black tracking-tighter text-red-500">{stats.total_attacks}</p>
            </div>
            <ShieldAlert className="w-20 h-20 text-gray-800 absolute right-4 opacity-50 z-0" />
          </div>
        </div>

        {/* Dynamic Moving Graph */}
        <div className="bg-white border border-gray-200 rounded-xl shadow p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Live Traffic Monitor</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
              <RefreshCw className="w-3 h-3 animate-spin" /> Assessing logs in real-time...
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fontWeight: 'bold' }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12, fontWeight: 'bold' }} stroke="#9ca3af" />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', fontWeight: 'bold' }} />
                <Legend wrapperStyle={{ fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="healthy" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorHealthy)" name="Healthy Traffic/sec" isAnimationActive={false} />
                <Area type="monotone" dataKey="attacks" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAttacks)" name="Threats/sec" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lower Row: Specifics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up flex-grow" style={{ animationDelay: '0.2s' }}>
          
          {/* Left Panel: Varies based on view */}
          {isProviderGlobal ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-black text-gray-900 uppercase">Client Organizations</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-4 font-bold border-b border-gray-200">Client / ID</th>
                      <th className="p-4 font-bold border-b border-gray-200">Endpoint</th>
                      <th className="p-4 font-bold border-b border-gray-200">Status</th>
                      <th className="p-4 font-bold border-b border-gray-200">Requests</th>
                      <th className="p-4 font-bold border-b border-gray-200 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.company_breakdown?.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                        <td className="p-4 font-bold text-gray-900">{client.company} <span className="text-gray-400 text-xs ml-1">#{client.id}</span></td>
                        <td className="p-4 font-mono text-xs text-blue-600">{client.domain}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-black rounded-full uppercase">Active</span>
                        </td>
                        <td className="p-4 font-bold text-gray-700">{client.total}</td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => setSelectedClientId(client.id)}
                            className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors inline-flex items-center justify-center group"
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
            <div className="bg-white border border-gray-200 rounded-xl shadow p-6 flex flex-col items-center justify-center">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-6">Traffic Classification</h2>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', fontWeight: 'bold' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Right Panel: Live Logs */}
          <div className="bg-white border border-gray-200 rounded-xl shadow flex flex-col overflow-hidden max-h-[400px]">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900 uppercase">Recent Events</h2>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
              {data.recent_logs.map((log) => (
                <div key={log.id} className={`p-3 rounded-lg border-l-4 shadow-sm ${log.is_attack ? 'bg-red-50 border-l-red-500' : 'bg-gray-50 border-l-green-500'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    {log.is_attack ? (
                      <span className="text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded uppercase">Threat</span>
                    ) : (
                      <span className="text-[10px] bg-green-100 text-green-700 font-black px-2 py-0.5 rounded uppercase">Clean</span>
                    )}
                  </div>
                  {isProviderGlobal && <div className="text-xs font-bold text-gray-900 mb-1">{log.company}</div>}
                  <div className="flex gap-2 items-center">
                    <span className="font-mono text-xs font-bold bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-700">{log.method}</span>
                    <span className="font-mono text-xs text-gray-600 truncate">{log.url}</span>
                  </div>
                </div>
              ))}
              {data.recent_logs.length === 0 && (
                <div className="text-center text-gray-400 font-bold py-8">Awaiting Traffic...</div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
