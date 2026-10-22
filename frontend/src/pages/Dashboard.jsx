import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, ShieldAlert, CheckCircle, Server, LogOut, Radio, 
  ArrowRight, ArrowLeft, RefreshCw, Lock, Unlock, Send, AlertTriangle, 
  ShieldCheck, Terminal, Bell, Zap 
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [permissionToggling, setPermissionToggling] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [triggeringIncident, setTriggeringIncident] = useState(false);
  const [incidentDispatchedNotice, setIncidentDispatchedNotice] = useState("");
  const [dismissedAlertId, setDismissedAlertId] = useState(null);
  
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
            ? `http://localhost:8004/dashboard/stats?client_id=${selectedClientId}` 
            : `http://localhost:8004/dashboard/stats`;

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
        }

        const newPoint = {
            time: timeStr,
            healthy: trafficDelta - attacksDelta,
            attacks: attacksDelta
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

  const togglePermission = async (key) => {
    if (!data || data.role !== 'CLIENT_VIEW' || permissionToggling) return;
    setPermissionToggling(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        allow_provider: key === 'provider_access_granted' ? !data.provider_access_granted : (data.provider_access_granted || false),
        share_signatures: key === 'share_signatures' ? !data.share_signatures : (data.share_signatures || false),
        auto_mitigation: key === 'auto_mitigation' ? !data.auto_mitigation : (data.auto_mitigation || false)
      };
      
      const response = await axios.post('http://localhost:8004/dashboard/permissions', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setData({
        ...data, 
        provider_access_granted: response.data.provider_access_granted,
        share_signatures: response.data.share_signatures,
        auto_mitigation: response.data.auto_mitigation
      });
    } catch (err) {
      console.error(err);
    } finally {
      setPermissionToggling(false);
    }
  };

  // Demo Trigger: Simulate threat detection and automatic incident response dispatch
  const handleTriggerIncident = async () => {
    if (triggeringIncident) return;
    setTriggeringIncident(true);
    setIncidentDispatchedNotice("");
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8004/dashboard/trigger-incident', {
        company_id: 1, // TechCorp
        threat_type: "SQL Injection (SQLi)"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const res = response.data;
      setIncidentDispatchedNotice(
        `Dispatched ${res.incident_code} to ${res.target_domain} - Automated Mitigation Deployed!`
      );
      
      // Update local state immediately for instant visual feedback
      if (data && data.role === 'PROVIDER') {
        setData({
          ...data,
          latest_incident: {
            incident_code: res.incident_code,
            threat_type: res.threat_type,
            status: res.response_status,
            details: `Critical threat detected on ${res.target_domain}. Mitigation agent dispatched.`,
            firewall_rule: res.firewall_rule,
            timestamp: res.timestamp
          }
        });
      }
    } catch (err) {
      console.error("Error triggering incident:", err);
    } finally {
      setTriggeringIncident(false);
    }
  };

  // Acknowledge incident alert in client view
  const handleAcknowledgeAlert = async (alertId) => {
    setDismissedAlertId(alertId);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8004/dashboard/acknowledge-incident', {
        incident_id: alertId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  if (loading && !data) {
    return <div className="flex h-screen items-center justify-center bg-zinc-950 text-white font-bold text-lg uppercase tracking-widest animate-pulse">Initializing Interface...</div>;
  }

  // Handle case where client denied access and we have an error
  if (errorMsg) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-zinc-950 text-zinc-100 p-8">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-6" strokeWidth={2} />
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Access Restricted</h1>
        <p className="text-lg font-medium text-zinc-400 mb-8">{errorMsg}</p>
        <button onClick={() => setSelectedClientId(null)} className="px-8 py-3 bg-white text-black rounded-lg font-bold tracking-wide uppercase text-sm hover:bg-zinc-200 transition-colors">
          Return to Global View
        </button>
      </div>
    );
  }

  if (!data) return null;

  const isProviderGlobal = data.role === 'PROVIDER';
  const stats = isProviderGlobal ? data.global_stats : data.stats;

  if (!stats) return <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-300 font-bold uppercase tracking-widest">Synchronizing...</div>;

  const pieData = [
    { name: 'Healthy', value: stats.healthy_requests || 0 },
    { name: 'Threats', value: stats.total_attacks || 0 },
  ];

  // Check if current user is actually the client (not provider drilling down)
  const isActualClient = data.role === 'CLIENT_VIEW' && selectedClientId === null;

  // Active alert for TechCorp / client
  const activeAlert = data.active_alert;
  const showAlert = activeAlert && dismissedAlertId !== activeAlert.id;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden relative">
      
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

      {/* Floating Minimal Navbar */}
      <nav className="mx-8 mt-8 z-10 flex items-center justify-between bg-zinc-900/80 backdrop-blur-3xl border border-white/10 rounded-2xl px-8 py-5 shadow-2xl">
        <div className="flex items-center gap-4">
          <Activity className="w-8 h-8 text-blue-400" strokeWidth={2} />
          <h1 className="text-2xl font-bold tracking-widest text-white">SENTINEL<span className="font-light text-blue-400">AI</span></h1>
          <div className="w-px h-8 bg-white/20 mx-2"></div>
          {isProviderGlobal ? (
            <span className="px-4 py-1.5 bg-blue-500/20 text-blue-300 text-sm font-bold rounded-lg uppercase tracking-wider border border-blue-500/40 flex items-center gap-2">
              Global Admin
            </span>
          ) : (
            <div className="flex items-center gap-3">
              {isActualClient ? (
                <span className="text-base font-medium text-zinc-300">Client Portal</span>
              ) : (
                <button 
                  onClick={() => setSelectedClientId(null)}
                  className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" /> Back to Global
                </button>
              )}
              <span className="text-base text-white font-bold px-4 py-1.5 bg-white/10 rounded-lg border border-white/20">{data.company_name}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-zinc-300">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" strokeWidth={2} />
            System Live
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-base font-bold text-zinc-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
            Sign Out
          </button>
        </div>
      </nav>

      <main className="flex-grow p-8 flex flex-col gap-8 relative z-10">

        {/* Client View: Flash Message from SentinelAI SOC Security Team */}
        {!isProviderGlobal && showAlert && (
          <div className="bg-gradient-to-r from-red-950/80 via-zinc-900/90 to-red-950/80 border-2 border-red-500/50 rounded-3xl p-6 shadow-2xl backdrop-blur-3xl animate-bounce-short">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="flex items-start gap-5">
                <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/40">
                  <ShieldAlert className="w-8 h-8 text-red-400 animate-pulse" strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-3 py-1 bg-red-500/30 text-red-300 text-xs font-black uppercase tracking-widest rounded-md border border-red-500/40">
                      High Priority Security Alert
                    </span>
                    <span className="text-xs text-zinc-400 font-mono font-bold">
                      ID: {activeAlert.incident_code}
                    </span>
                    <span className="text-xs text-zinc-400 font-bold">
                      {new Date(activeAlert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2 tracking-wide">
                    SentinelAI SOC Defense Team: Incident Response Executed
                  </h2>
                  <p className="text-sm text-zinc-300 font-medium mb-3">
                    <strong className="text-white">Threat Vector:</strong> {activeAlert.threat_type} — {activeAlert.details}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 font-mono text-xs bg-zinc-950/80 p-3 rounded-xl border border-white/10">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Action Applied:
                    </span>
                    <span className="text-zinc-200">{activeAlert.mitigation}</span>
                    <span className="text-zinc-500">|</span>
                    <span className="text-blue-300 font-bold">{activeAlert.firewall_rule}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  onClick={() => handleAcknowledgeAlert(activeAlert.id)}
                  className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-white/10"
                >
                  Acknowledge Notice
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Admin Panel: Threat Detected -> ID -> Automatic Incident Response Sent */}
        {isProviderGlobal && (
          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-3xl animate-slide-up">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              <div className="flex items-start gap-5">
                <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/40">
                  <Terminal className="w-8 h-8 text-blue-400" strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-black uppercase tracking-widest rounded-md border border-red-500/40 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Threat Detected
                    </span>
                    <span className="px-3 py-1 bg-zinc-800 text-white text-xs font-mono font-bold rounded-md border border-white/10">
                      ID: {data.latest_incident?.incident_code || "INC-8942"}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-md border border-emerald-500/40 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Automatic Incident Response Sent
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 tracking-wide">
                    Target: <span className="text-blue-400">techcorp.com</span> | Vector: <span className="text-red-400">{data.latest_incident?.threat_type || "SQL Injection (SQLi)"}</span>
                  </h3>
                  <div className="font-mono text-xs text-zinc-300 flex items-center gap-3">
                    <span className="text-zinc-400">Synchronized Perimeter Rule:</span>
                    <span className="px-2.5 py-1 bg-zinc-950 rounded-lg text-emerald-400 border border-white/10 font-bold">
                      {data.latest_incident?.firewall_rule || "iptables -A INPUT -s 198.51.100.42 -p tcp --dport 80,443 -j DROP"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end lg:items-center gap-4 w-full lg:w-auto">
                {incidentDispatchedNotice && (
                  <span className="text-xs text-emerald-400 font-bold font-mono bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg animate-pulse">
                    {incidentDispatchedNotice}
                  </span>
                )}
                <button
                  onClick={handleTriggerIncident}
                  disabled={triggeringIncident}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-900/50 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Zap className={`w-4 h-4 ${triggeringIncident ? 'animate-spin' : ''}`} />
                  {triggeringIncident ? "Dispatching Response..." : "Dispatch Response"}
                </button>
              </div>

            </div>
          </div>
        )}
        
        {/* Permission Toggles for Clients */}
        {isActualClient && (
          <div className="bg-zinc-900/70 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-3xl animate-slide-up">
            <h2 className="text-base font-bold text-white uppercase tracking-widest mb-8">Manage Permissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex justify-between items-center bg-zinc-800/80 p-6 rounded-2xl border border-white/10 shadow-inner">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-3 mb-2 text-lg">
                    {data.provider_access_granted ? <Unlock className="w-6 h-6 text-emerald-400" strokeWidth={2}/> : <Lock className="w-6 h-6 text-red-400" strokeWidth={2}/>}
                    Provider Monitoring
                  </h3>
                  <p className="text-sm text-zinc-400 font-medium">Allow SentinelAI to monitor traffic.</p>
                </div>
                <button 
                  onClick={() => togglePermission('provider_access_granted')} 
                  disabled={permissionToggling}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${data.provider_access_granted ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${data.provider_access_granted ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex justify-between items-center bg-zinc-800/80 p-6 rounded-2xl border border-white/10 shadow-inner">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-3 mb-2 text-lg">
                    {data.share_signatures ? <Unlock className="w-6 h-6 text-emerald-400" strokeWidth={2}/> : <Lock className="w-6 h-6 text-red-400" strokeWidth={2}/>}
                    Share Signatures
                  </h3>
                  <p className="text-sm text-zinc-400 font-medium">Contribute threat signatures globally.</p>
                </div>
                <button 
                  onClick={() => togglePermission('share_signatures')} 
                  disabled={permissionToggling}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${data.share_signatures ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${data.share_signatures ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
          <div className="bg-zinc-900/70 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-3xl flex items-center justify-between hover:bg-zinc-800/80 transition-colors">
            <div>
              <p className="text-sm text-white font-bold uppercase tracking-widest mb-2">Total Traffic</p>
              <p className="text-6xl font-black tracking-tight text-white">{stats.total_requests}</p>
            </div>
            <Server className="w-16 h-16 text-zinc-400" strokeWidth={1.5} />
          </div>
          
          <div className="bg-zinc-900/70 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-3xl flex items-center justify-between hover:bg-zinc-800/80 transition-colors">
            <div>
              <p className="text-sm text-white font-bold uppercase tracking-widest mb-2">Clean Requests</p>
              <p className="text-6xl font-black tracking-tight text-blue-400">{stats.healthy_requests}</p>
            </div>
            <CheckCircle className="w-16 h-16 text-blue-500" strokeWidth={1.5} />
          </div>

          <div className="bg-zinc-900/70 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-3xl flex items-center justify-between hover:bg-zinc-800/80 transition-colors">
            <div>
              <p className="text-sm text-white font-bold uppercase tracking-widest mb-2">Threats Blocked</p>
              <p className="text-6xl font-black tracking-tight text-red-400">{stats.total_attacks}</p>
            </div>
            <ShieldAlert className="w-16 h-16 text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Dynamic Moving Graph */}
        <div className="bg-zinc-900/70 border border-white/10 rounded-3xl shadow-2xl p-8 backdrop-blur-3xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-base font-bold text-white uppercase tracking-widest">Live Traffic Monitor</h2>
            <div className="flex items-center gap-3 text-sm text-blue-400 font-bold bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20">
              <RefreshCw className="w-4 h-4 animate-spin" /> Real-time feed
            </div>
          </div>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F87171" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#F87171" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.15} />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#a1a1aa', fontWeight: 'bold' }} stroke="#52525b" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#a1a1aa', fontWeight: 'bold' }} stroke="#52525b" axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(10px)', fontSize: '14px', fontWeight: 'bold' }} 
                  itemStyle={{ fontWeight: 'bold' }}
                  cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2 }}
                />
                <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 'bold', color: '#e4e4e7' }} iconType="circle" />
                <Area type="monotone" dataKey="healthy" stroke="#60A5FA" strokeWidth={3} fillOpacity={1} fill="url(#colorHealthy)" name="Healthy Requests" isAnimationActive={false} />
                <Area type="monotone" dataKey="attacks" stroke="#F87171" strokeWidth={3} fillOpacity={1} fill="url(#colorAttacks)" name="Threats" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lower Row: Specifics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up flex-grow" style={{ animationDelay: '0.2s' }}>
          
          {/* Left Panel: Varies based on view */}
          {isProviderGlobal ? (
            <div className="bg-zinc-900/70 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-3xl overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-zinc-800/50">
                <h2 className="text-base font-bold text-white uppercase tracking-widest">Client Organizations</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs uppercase tracking-widest text-white bg-zinc-900/50">
                      <th className="p-6 font-bold border-b border-white/10">Client / ID</th>
                      <th className="p-6 font-bold border-b border-white/10">Endpoint</th>
                      <th className="p-6 font-bold border-b border-white/10">Status</th>
                      <th className="p-6 font-bold border-b border-white/10">Requests</th>
                      <th className="p-6 font-bold border-b border-white/10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.company_breakdown?.map((client) => (
                      <tr key={client.id} className="hover:bg-zinc-800/80 border-b border-white/5 transition-colors">
                        <td className="p-6 font-bold text-white text-base">{client.company} <span className="text-zinc-500 text-sm ml-2">#{client.id}</span></td>
                        <td className="p-6 font-mono text-sm text-blue-400">{client.domain}</td>
                        <td className="p-6">
                          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-sm font-bold rounded-lg border border-emerald-500/30 flex items-center gap-2 w-max">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active
                          </span>
                        </td>
                        <td className="p-6 font-bold text-zinc-200 text-base">{client.total}</td>
                        <td className="p-6 text-center">
                          <button 
                            onClick={() => setSelectedClientId(client.id)}
                            className="p-3 text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all inline-flex items-center justify-center group shadow-lg shadow-blue-900/50 cursor-pointer"
                            title="View Dashboard"
                          >
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/70 border border-white/10 rounded-3xl shadow-2xl p-8 backdrop-blur-3xl flex flex-col items-center justify-center">
              <h2 className="text-base font-bold text-white uppercase tracking-widest mb-8 self-start w-full">Traffic Classification</h2>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#EF4444'} opacity={0.9} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(10px)', fontSize: '14px', fontWeight: 'bold' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 'bold', color: '#e4e4e7' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Right Panel: Live Logs */}
          <div className="bg-zinc-900/70 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-3xl flex flex-col overflow-hidden max-h-[500px]">
            <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-zinc-800/50">
              <h2 className="text-base font-bold text-white uppercase tracking-widest">Recent Events</h2>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {data.recent_logs.map((log) => (
                <div key={log.id} className="p-5 rounded-2xl bg-zinc-800/80 border border-white/5 hover:bg-zinc-700/80 transition-colors shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-bold text-zinc-100 bg-zinc-700/50 px-2 py-1 rounded-md">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    {log.is_attack ? (
                      <span className="text-xs bg-red-500/20 text-red-400 font-bold px-3 py-1 rounded-lg uppercase tracking-widest border border-red-500/30">Threat</span>
                    ) : (
                      <span className="text-xs bg-blue-500/20 text-blue-400 font-bold px-3 py-1 rounded-lg uppercase tracking-widest border border-blue-500/30">Clean</span>
                    )}
                  </div>
                  {isProviderGlobal && <div className="text-base font-bold text-white mb-2">{log.company}</div>}
                  <div className="flex gap-3 items-center">
                    <span className="font-mono text-xs font-bold bg-zinc-900 border border-zinc-600 px-3 py-1.5 rounded-lg text-zinc-300">{log.method}</span>
                    <span className="font-mono text-sm text-zinc-300 truncate">{log.url}</span>
                  </div>
                </div>
              ))}
              {data.recent_logs.length === 0 && (
                <div className="text-center text-zinc-400 font-bold py-16 text-lg">Awaiting Network Traffic...</div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
