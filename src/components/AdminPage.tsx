import { useState, useEffect, useCallback } from 'react';
import {
  LogIn, LogOut, Plus, Edit3, Trash2, Check, X, Eye, EyeOff,
  MapPin, ChevronDown, ChevronUp,
  CheckCircle, XCircle, MessageSquare, Star, RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Restaurant, Contribution, Feedback, ToiletDirection, ToiletStatus, ToiletAmenities } from '../lib/types';

type Tab = 'restaurants' | 'contributions' | 'feedback';

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

  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state for add/edit
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

  // Check existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

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
      } else {
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

  const startAdd = () => {
    resetForm();
    setAddingNew(true);
    setEditingRestaurant(null);
  };

  const cancelEdit = () => {
    setEditingRestaurant(null);
    setAddingNew(false);
    resetForm();
  };

  const saveRestaurant = async () => {
    const payload = {
      name: form.name,
      address: form.address,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      has_toilet: form.has_toilet,
      toilet_code: form.toilet_code || null,
      toilet_notes: form.toilet_notes || null,
      toilet_direction: (form.toilet_direction || null) as ToiletDirection,
      toilet_status: form.toilet_status,
      opening_hours: form.opening_hours || null,
      phone: form.phone || null,
      verified: form.verified,
      amenities: form.amenities,
    };

    try {
      if (editingRestaurant) {
        await supabase.from('restaurants').update(payload).eq('id', editingRestaurant.id);
      } else {
        await supabase.from('restaurants').insert([payload] as never);
      }
      cancelEdit();
      fetchData();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const deleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    await supabase.from('restaurants').delete().eq('id', id);
    fetchData();
  };

  const approveContribution = async (c: Contribution) => {
    if (c.contribution_type === 'new_location') {
      await supabase.from('restaurants').insert([{
        name: c.name, address: c.address,
        latitude: c.latitude, longitude: c.longitude,
        has_toilet: true,
        toilet_code: c.toilet_code,
        toilet_notes: c.toilet_notes,
        toilet_direction: c.toilet_direction,
        toilet_status: c.toilet_status,
        amenities: c.amenities,
        verified: true,
      }] as never);
    }
    await supabase.from('contributions').update({ status: 'approved' }).eq('id', c.id);
    fetchData();
  };

  const rejectContribution = async (id: string) => {
    await supabase.from('contributions').update({ status: 'rejected' }).eq('id', id);
    fetchData();
  };

  const resolveFeedback = async (id: string) => {
    await supabase.from('feedback').update({ is_resolved: true }).eq('id', id);
    fetchData();
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Budapest Loo Finder</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{loginError}</div>
            )}

            <button type="submit" disabled={loginLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#/" className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Map
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Budapest Loo Finder</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#/" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Map
            </a>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-6">
          {([
            { key: 'restaurants' as Tab, label: 'Locations', icon: MapPin, count: restaurants.length },
            { key: 'contributions' as Tab, label: 'Contributions', icon: MessageSquare, count: contributions.filter(c => c.status === 'pending').length },
            { key: 'feedback' as Tab, label: 'Feedback', icon: Star, count: feedbackList.filter(f => !f.is_resolved).length },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count > 0 && tab !== t.key && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Refresh + Add */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={fetchData} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          {tab === 'restaurants' && (
            <button onClick={startAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Add Location
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {(addingNew || editingRestaurant) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">{editingRestaurant ? 'Edit Location' : 'Add New Location'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                <input type="number" step="0.000001" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                <input type="number" step="0.000001" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Code</label>
                <input type="text" value={form.toilet_code} onChange={e => setForm({...form, toilet_code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., 1234 or 'Ask staff'" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                <select value={form.toilet_direction} onChange={e => setForm({...form, toilet_direction: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.toilet_status} onChange={e => setForm({...form, toilet_status: e.target.value as ToiletStatus})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="working">Working</option>
                  <option value="not_working">Not Working</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
                <input type="text" value={form.opening_hours} onChange={e => setForm({...form, opening_hours: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., 08:00-22:00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.toilet_notes} onChange={e => setForm({...form, toilet_notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  rows={2} />
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {([
                  ['wheelchair_accessible', 'Wheelchair'],
                  ['baby_changing', 'Baby Changing'],
                  ['free', 'Free'],
                  ['gender_neutral', 'Gender Neutral'],
                  ['requires_purchase', 'Purchase Req.'],
                ] as const).map(([key, label]) => (
                  <button key={key} type="button"
                    onClick={() => setForm({...form, amenities: {...form.amenities, [key]: !form.amenities[key]}})}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                      form.amenities[key]
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="mt-4 flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.verified} onChange={e => setForm({...form, verified: e.target.checked})}
                  className="w-4 h-4 rounded text-blue-600" />
                Verified
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.has_toilet} onChange={e => setForm({...form, has_toilet: e.target.checked})}
                  className="w-4 h-4 rounded text-blue-600" />
                Has Toilet
              </label>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button onClick={saveRestaurant}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Check className="w-4 h-4" /> Save
              </button>
              <button onClick={cancelEdit}
                className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Restaurant List */}
        {tab === 'restaurants' && (
          <div className="space-y-2">
            {restaurants.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      r.toilet_status === 'working' ? 'bg-green-500' :
                      r.toilet_status === 'not_working' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{r.name}</p>
                      <p className="text-xs text-gray-500 truncate">{r.address}</p>
                    </div>
                    {r.verified && <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); startEdit(r); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteRestaurant(r.id); }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedId === r.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {expandedId === r.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><span className="text-gray-500">Code:</span> <span className="font-medium">{r.toilet_code || '-'}</span></div>
                      <div><span className="text-gray-500">Direction:</span> <span className="font-medium">{r.toilet_direction || '-'}</span></div>
                      <div><span className="text-gray-500">Hours:</span> <span className="font-medium">{r.opening_hours || '-'}</span></div>
                      <div><span className="text-gray-500">Rating:</span> <span className="font-medium">{r.rating ? `${r.rating}/5 (${r.rating_count})` : '-'}</span></div>
                      <div><span className="text-gray-500">Votes:</span> <span className="font-medium text-green-600">+{r.upvotes || 0}</span> / <span className="font-medium text-red-600">-{r.downvotes || 0}</span></div>
                      <div><span className="text-gray-500">Coords:</span> <span className="font-medium">{r.latitude}, {r.longitude}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Notes:</span> <span className="font-medium">{r.toilet_notes || '-'}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {restaurants.length === 0 && !loading && (
              <p className="text-center text-gray-500 py-8">No locations yet.</p>
            )}
          </div>
        )}

        {/* Contributions List */}
        {tab === 'contributions' && (
          <div className="space-y-3">
            {contributions.map(c => (
              <div key={c.id} className={`bg-white rounded-xl border shadow-sm p-4 ${
                c.status === 'pending' ? 'border-yellow-300' : c.status === 'approved' ? 'border-green-200' : 'border-red-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        c.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{c.status}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{c.contribution_type}</span>
                    </div>
                    <p className="font-medium mt-1">{c.name || 'Update suggestion'}</p>
                    <p className="text-sm text-gray-500">{c.address || c.description}</p>
                    <p className="text-xs text-gray-400 mt-1">By: {c.user_email} | {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  {c.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => approveContribution(c)}
                        className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => rejectContribution(c.id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {contributions.length === 0 && !loading && (
              <p className="text-center text-gray-500 py-8">No contributions yet.</p>
            )}
          </div>
        )}

        {/* Feedback List */}
        {tab === 'feedback' && (
          <div className="space-y-3">
            {feedbackList.map(f => (
              <div key={f.id} className={`bg-white rounded-xl border shadow-sm p-4 ${f.is_resolved ? 'border-green-200 opacity-60' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        f.feedback_type === 'not_working' ? 'bg-red-100 text-red-700' :
                        f.feedback_type === 'wrong_code' ? 'bg-orange-100 text-orange-700' :
                        f.feedback_type === 'rating' ? 'bg-yellow-100 text-yellow-700' :
                        f.feedback_type === 'closed' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                      }`}>{f.feedback_type}</span>
                      {f.is_resolved && <span className="text-xs text-green-600 font-medium">Resolved</span>}
                    </div>
                    <p className="text-sm mt-1">{f.message}</p>
                    {f.rating && <p className="text-sm text-yellow-600 mt-1">Rating: {f.rating}/5</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {f.user_email || 'Anonymous'} | {new Date(f.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!f.is_resolved && (
                    <button onClick={() => resolveFeedback(f.id)}
                      className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {feedbackList.length === 0 && !loading && (
              <p className="text-center text-gray-500 py-8">No feedback yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
