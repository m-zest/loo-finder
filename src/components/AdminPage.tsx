import { useState, useEffect, useCallback } from 'react';
import {
  LogIn, LogOut, Plus, Edit3, Trash2, Check, X, Eye, EyeOff,
  MapPin, ChevronDown, ChevronUp,
  CheckCircle, XCircle, MessageSquare, Star, RefreshCw,
  ArrowLeft, RotateCcw, Key, Settings
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Restaurant, Contribution, Feedback, ToiletDirection, ToiletStatus, ToiletAmenities } from '../lib/types';

type Tab = 'restaurants' | 'contributions' | 'feedback' | 'settings';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [tab, setTab] = useState<Tab>('restaurants');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', address: '', latitude: '', longitude: '',
    toilet_code: '', toilet_notes: '', toilet_direction: '' as string,
    toilet_status: 'unknown' as ToiletStatus, opening_hours: '', phone: '',
    has_toilet: true, verified: false,
    amenities: {
      wheelchair_accessible: false, baby_changing: false,
      free: true, gender_neutral: false, requires_purchase: false,
    } as ToiletAmenities,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  const showMsg = (text: string, type: 'success' | 'error') => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setIsLoggedIn(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'restaurants') {
        const { data } = await supabase.from('restaurants').select('*').order('name');
        setRestaurants((data || []) as Restaurant[]);
      } else if (tab === 'contributions') {
        const { data } = await supabase.from('contributions').select('*').order('created_at', { ascending: false });
        setContributions((data || []) as Contribution[]);
      } else if (tab === 'feedback') {
        const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
        setFeedbackList((data || []) as Feedback[]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn, tab, fetchData]);

  const resetForm = () => {
    setForm({
      name: '', address: '', latitude: '', longitude: '',
      toilet_code: '', toilet_notes: '', toilet_direction: '',
      toilet_status: 'unknown', opening_hours: '', phone: '',
      has_toilet: true, verified: false,
      amenities: { wheelchair_accessible: false, baby_changing: false, free: true, gender_neutral: false, requires_purchase: false },
    });
  };

  const startEdit = (r: Restaurant) => {
    setEditingRestaurant(r);
    setForm({
      name: r.name, address: r.address,
      latitude: r.latitude.toString(), longitude: r.longitude.toString(),
      toilet_code: r.toilet_code || '', toilet_notes: r.toilet_notes || '',
      toilet_direction: r.toilet_direction || '',
      toilet_status: r.toilet_status || 'unknown',
      opening_hours: r.opening_hours || '', phone: r.phone || '',
      has_toilet: r.has_toilet, verified: r.verified,
      amenities: r.amenities || { wheelchair_accessible: false, baby_changing: false, free: true, gender_neutral: false, requires_purchase: false },
    });
    setAddingNew(false);
  };

  const startAdd = () => { resetForm(); setAddingNew(true); setEditingRestaurant(null); };
  const cancelEdit = () => { setEditingRestaurant(null); setAddingNew(false); resetForm(); };

  const saveRestaurant = async () => {
    const payload = {
      name: form.name, address: form.address,
      latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude),
      has_toilet: form.has_toilet,
      toilet_code: form.toilet_code || null, toilet_notes: form.toilet_notes || null,
      toilet_direction: (form.toilet_direction || null) as ToiletDirection,
      toilet_status: form.toilet_status, opening_hours: form.opening_hours || null,
      phone: form.phone || null, verified: form.verified, amenities: form.amenities,
    };
    try {
      if (editingRestaurant) {
        await supabase.from('restaurants').update(payload).eq('id', editingRestaurant.id);
        showMsg('Location updated', 'success');
      } else {
        await supabase.from('restaurants').insert([payload] as never);
        showMsg('Location added', 'success');
      }
      cancelEdit();
      fetchData();
    } catch (err) {
      showMsg('Save failed', 'error');
      console.error('Save error:', err);
    }
  };

  const deleteRestaurant = async (id: string) => {
    if (!confirm('Delete this location? This cannot be undone.')) return;
    await supabase.from('restaurants').delete().eq('id', id);
    showMsg('Location deleted', 'success');
    fetchData();
  };

  const resetVotes = async (id: string) => {
    await supabase.from('restaurants').update({ upvotes: 0, downvotes: 0 }).eq('id', id);
    await supabase.from('votes').delete().eq('restaurant_id', id);
    showMsg('Votes reset', 'success');
    fetchData();
  };

  const resetAllVotes = async () => {
    if (!confirm('Reset ALL votes for ALL locations? This cannot be undone.')) return;
    await supabase.from('restaurants').update({ upvotes: 0, downvotes: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    showMsg('All votes reset', 'success');
    fetchData();
  };

  const approveContribution = async (c: Contribution) => {
    if (c.contribution_type === 'new_location') {
      await supabase.from('restaurants').insert([{
        name: c.name, address: c.address, latitude: c.latitude, longitude: c.longitude,
        has_toilet: true, toilet_code: c.toilet_code, toilet_notes: c.toilet_notes,
        toilet_direction: c.toilet_direction, toilet_status: c.toilet_status,
        amenities: c.amenities, verified: true,
      }] as never);
    }
    await supabase.from('contributions').update({ status: 'approved' }).eq('id', c.id);
    showMsg('Contribution approved', 'success');
    fetchData();
  };

  const rejectContribution = async (id: string) => {
    await supabase.from('contributions').update({ status: 'rejected' }).eq('id', id);
    showMsg('Contribution rejected', 'success');
    fetchData();
  };

  const resolveFeedback = async (id: string) => {
    await supabase.from('feedback').update({ is_resolved: true }).eq('id', id);
    showMsg('Feedback resolved', 'success');
    fetchData();
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-blue-200 text-sm mt-1">Budapest Loo Finder</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                required placeholder="admin@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 bg-gray-50 focus:bg-white transition-all"
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{loginError}</div>
            )}

            <button type="submit" disabled={loginLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
              <LogIn className="w-5 h-5" />
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center pt-2">
              <a href="#/" className="text-sm text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1 font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Map
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Message Toast */}
      {actionMsg && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-slideUp ${
          actionMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {actionMsg.text}
        </div>
      )}

      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-sm">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Manage locations, contributions & feedback</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="#/" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" /> Map
            </a>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-lg transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200 mb-6">
          {([
            { key: 'restaurants' as Tab, label: 'Locations', icon: MapPin, count: restaurants.length },
            { key: 'contributions' as Tab, label: 'Submissions', icon: MessageSquare, count: contributions.filter(c => c.status === 'pending').length },
            { key: 'feedback' as Tab, label: 'Feedback', icon: Star, count: feedbackList.filter(f => !f.is_resolved).length },
            { key: 'settings' as Tab, label: 'Settings', icon: Settings, count: 0 },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}>
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
              {t.count > 0 && tab !== t.key && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="space-y-6">
            {/* Supabase Keys Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" /> Supabase Configuration
              </h3>
              <p className="text-sm text-gray-500 mb-4">Your project connection details (read-only display)</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Project URL</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-700 truncate">
                      {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
                    </code>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Anon Key</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-700 truncate">
                      {(import.meta.env.VITE_SUPABASE_ANON_KEY || 'Not configured').substring(0, 20)}...
                    </code>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">To change these, update environment variables in your Vercel dashboard and redeploy.</p>
            </div>

            {/* Vote Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-500" /> Vote Management
              </h3>
              <p className="text-sm text-gray-500 mb-4">Reset community votes when information has been updated</p>

              <button onClick={resetAllVotes}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-50 text-orange-700 border border-orange-200 text-sm font-semibold rounded-xl hover:bg-orange-100 transition-colors">
                <RotateCcw className="w-4 h-4" /> Reset All Votes to Zero
              </button>
            </div>
          </div>
        )}

        {/* Refresh + Add */}
        {tab !== 'settings' && (
          <div className="flex justify-between items-center mb-4">
            <button onClick={fetchData}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            {tab === 'restaurants' && (
              <button onClick={startAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Add Location
              </button>
            )}
          </div>
        )}

        {/* Add/Edit Form */}
        {(addingNew || editingRestaurant) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">{editingRestaurant ? 'Edit Location' : 'Add New Location'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Name *', key: 'name', type: 'text', placeholder: 'e.g., McDonald\'s Oktogon' },
                { label: 'Address *', key: 'address', type: 'text', placeholder: 'Terez krt. 19, Budapest' },
                { label: 'Latitude *', key: 'latitude', type: 'number', placeholder: '47.4979' },
                { label: 'Longitude *', key: 'longitude', type: 'number', placeholder: '19.0402' },
                { label: 'Access Code', key: 'toilet_code', type: 'text', placeholder: '1234 or "Ask staff"' },
                { label: 'Opening Hours', key: 'opening_hours', type: 'text', placeholder: '08:00-22:00' },
                { label: 'Phone', key: 'phone', type: 'text', placeholder: '+36 1 234 5678' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                  <input type={f.type} value={(form as Record<string, string>)[f.key]}
                    onChange={e => setForm({...form, [f.key]: e.target.value})}
                    step={f.type === 'number' ? '0.000001' : undefined}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 text-sm bg-gray-50 focus:bg-white transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Direction</label>
                <select value={form.toilet_direction} onChange={e => setForm({...form, toilet_direction: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm bg-gray-50 focus:bg-white">
                  <option value="">Not specified</option>
                  <option value="left">Turn Left</option>
                  <option value="right">Turn Right</option>
                  <option value="straight">Straight Ahead</option>
                  <option value="upstairs">Go Upstairs</option>
                  <option value="downstairs">Go Downstairs</option>
                  <option value="basement">In Basement</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <select value={form.toilet_status} onChange={e => setForm({...form, toilet_status: e.target.value as ToiletStatus})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm bg-gray-50 focus:bg-white">
                  <option value="working">Working</option>
                  <option value="not_working">Not Working</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
                <textarea value={form.toilet_notes} onChange={e => setForm({...form, toilet_notes: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm resize-none bg-gray-50 focus:bg-white" rows={2} />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {([
                  ['wheelchair_accessible', 'Wheelchair'], ['baby_changing', 'Baby Changing'],
                  ['free', 'Free'], ['gender_neutral', 'Gender Neutral'], ['requires_purchase', 'Purchase Req.'],
                ] as const).map(([key, label]) => (
                  <button key={key} type="button"
                    onClick={() => setForm({...form, amenities: {...form.amenities, [key]: !form.amenities[key]}})}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      form.amenities[key] ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={form.verified} onChange={e => setForm({...form, verified: e.target.checked})}
                  className="w-4 h-4 rounded text-blue-600 border-gray-300" />
                Verified
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={form.has_toilet} onChange={e => setForm({...form, has_toilet: e.target.checked})}
                  className="w-4 h-4 rounded text-blue-600 border-gray-300" />
                Has Toilet
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={saveRestaurant}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                <Check className="w-4 h-4" /> Save
              </button>
              <button onClick={cancelEdit}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Restaurant List */}
        {tab === 'restaurants' && (
          <div className="space-y-2">
            {restaurants.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-gray-300 transition-colors">
                <div className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      r.toilet_status === 'working' ? 'bg-emerald-500' :
                      r.toilet_status === 'not_working' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{r.name}</p>
                      <p className="text-xs text-gray-400 truncate">{r.address}</p>
                    </div>
                    {r.verified && <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                    {(r.downvotes > 0) && (
                      <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-bold flex-shrink-0">
                        {r.downvotes} reports
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button onClick={(e) => { e.stopPropagation(); startEdit(r); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); resetVotes(r.id); }}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Reset votes">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteRestaurant(r.id); }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedId === r.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {expandedId === r.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><span className="text-gray-400 text-xs">Code:</span> <span className="font-semibold block">{r.toilet_code || '-'}</span></div>
                      <div><span className="text-gray-400 text-xs">Direction:</span> <span className="font-semibold block">{r.toilet_direction || '-'}</span></div>
                      <div><span className="text-gray-400 text-xs">Hours:</span> <span className="font-semibold block">{r.opening_hours || '-'}</span></div>
                      <div><span className="text-gray-400 text-xs">Rating:</span> <span className="font-semibold block">{r.rating ? `${r.rating}/5 (${r.rating_count})` : '-'}</span></div>
                      <div>
                        <span className="text-gray-400 text-xs">Votes:</span>
                        <span className="font-semibold block">
                          <span className="text-emerald-600">+{r.upvotes || 0}</span>
                          <span className="text-gray-300 mx-1">/</span>
                          <span className="text-red-600">-{r.downvotes || 0}</span>
                        </span>
                      </div>
                      <div><span className="text-gray-400 text-xs">Coords:</span> <span className="font-semibold block text-xs">{r.latitude}, {r.longitude}</span></div>
                      <div className="col-span-2"><span className="text-gray-400 text-xs">Notes:</span> <span className="font-medium block">{r.toilet_notes || '-'}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {restaurants.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No locations yet</p>
              </div>
            )}
          </div>
        )}

        {/* Contributions List */}
        {tab === 'contributions' && (
          <div className="space-y-3">
            {contributions.map(c => (
              <div key={c.id} className={`bg-white rounded-xl border shadow-sm p-4 ${
                c.status === 'pending' ? 'border-amber-300' : c.status === 'approved' ? 'border-emerald-200' : 'border-red-200'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                        c.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>{c.status.toUpperCase()}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] rounded-full font-medium">{c.contribution_type}</span>
                    </div>
                    <p className="font-semibold mt-1.5">{c.name || 'Update suggestion'}</p>
                    {c.address && <p className="text-sm text-gray-500 mt-0.5">{c.address}</p>}
                    {c.description && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Description / Message:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.description}</p>
                      </div>
                    )}
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {c.toilet_code && (
                        <div><span className="text-gray-400">Code:</span> <span className="font-semibold text-gray-700">{c.toilet_code}</span></div>
                      )}
                      {c.toilet_direction && (
                        <div><span className="text-gray-400">Direction:</span> <span className="font-semibold text-gray-700">{c.toilet_direction}</span></div>
                      )}
                      {c.toilet_status && (
                        <div><span className="text-gray-400">Status:</span> <span className="font-semibold text-gray-700">{c.toilet_status}</span></div>
                      )}
                      {c.latitude && c.longitude && (
                        <div><span className="text-gray-400">Coords:</span> <span className="font-semibold text-gray-700">{c.latitude}, {c.longitude}</span></div>
                      )}
                      {c.amenities && (
                        <div className="col-span-2 md:col-span-3">
                          <span className="text-gray-400">Amenities:</span>{' '}
                          <span className="font-semibold text-gray-700">
                            {[
                              c.amenities.wheelchair_accessible && 'Wheelchair',
                              c.amenities.baby_changing && 'Baby Changing',
                              c.amenities.free && 'Free',
                              c.amenities.gender_neutral && 'Gender Neutral',
                              c.amenities.requires_purchase && 'Purchase Req.',
                            ].filter(Boolean).join(', ') || 'None'}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{c.user_email || 'No email'} &middot; {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  {c.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => approveContribution(c)}
                        className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors" title="Approve">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => rejectContribution(c.id)}
                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors" title="Reject">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {contributions.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No submissions yet</p>
              </div>
            )}
          </div>
        )}

        {/* Feedback List */}
        {tab === 'feedback' && (
          <div className="space-y-3">
            {feedbackList.map(f => (
              <div key={f.id} className={`bg-white rounded-xl border shadow-sm p-4 transition-opacity ${f.is_resolved ? 'border-emerald-200 opacity-50' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                        f.feedback_type === 'not_working' ? 'bg-red-100 text-red-700' :
                        f.feedback_type === 'wrong_code' ? 'bg-orange-100 text-orange-700' :
                        f.feedback_type === 'rating' ? 'bg-amber-100 text-amber-700' :
                        f.feedback_type === 'closed' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                      }`}>{f.feedback_type.replace('_', ' ')}</span>
                      {f.is_resolved && <span className="text-[11px] text-emerald-600 font-bold">RESOLVED</span>}
                    </div>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Message:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{f.message}</p>
                    </div>
                    {f.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-gray-700">{f.rating}/5</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1.5">{f.user_email || 'Anonymous'} &middot; {new Date(f.created_at).toLocaleDateString()}</p>
                  </div>
                  {!f.is_resolved && (
                    <button onClick={() => resolveFeedback(f.id)}
                      className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors flex-shrink-0" title="Mark resolved">
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {feedbackList.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No feedback yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
