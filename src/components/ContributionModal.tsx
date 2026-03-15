import { useState, useEffect } from 'react';
import {
  X, MapPin, Key, Navigation, Clock, Phone, CheckCircle,
  Accessibility, Baby, DollarSign, Users, AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Restaurant, ToiletDirection, ToiletStatus, ToiletAmenities } from '../lib/types';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'new_location' | 'update_suggestion';
  restaurant?: Restaurant;
  onSuccess: () => void;
}

const directionOptions: { value: ToiletDirection; label: string; icon: string }[] = [
  { value: null, label: 'N/A', icon: '?' },
  { value: 'left', label: 'Left', icon: '\u2190' },
  { value: 'right', label: 'Right', icon: '\u2192' },
  { value: 'straight', label: 'Straight', icon: '\u2191' },
  { value: 'upstairs', label: 'Up', icon: '\u2197' },
  { value: 'downstairs', label: 'Down', icon: '\u2198' },
  { value: 'basement', label: 'Basement', icon: '\u2B07' },
];

const statusOptions: { value: ToiletStatus; label: string }[] = [
  { value: 'working', label: 'Working' },
  { value: 'not_working', label: 'Not Working' },
  { value: 'unknown', label: 'Unknown' },
];

export default function ContributionModal({ isOpen, onClose, type, restaurant, onSuccess }: ContributionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '', address: '', latitude: '', longitude: '',
    toiletCode: '', toiletNotes: '', toiletDirection: null as ToiletDirection,
    toiletStatus: 'unknown' as ToiletStatus, openingHours: '', phone: '',
    email: '', updateDescription: '',
    amenities: { wheelchair_accessible: false, baby_changing: false, free: true, gender_neutral: false, requires_purchase: false } as ToiletAmenities,
  });

  useEffect(() => {
    if (restaurant && isOpen) {
      setFormData({
        name: restaurant.name || '', address: restaurant.address || '',
        latitude: restaurant.latitude?.toString() || '', longitude: restaurant.longitude?.toString() || '',
        toiletCode: restaurant.toilet_code || '', toiletNotes: restaurant.toilet_notes || '',
        toiletDirection: restaurant.toilet_direction || null,
        toiletStatus: restaurant.toilet_status || 'unknown',
        openingHours: restaurant.opening_hours || '', phone: restaurant.phone || '',
        email: '', updateDescription: '',
        amenities: restaurant.amenities || { wheelchair_accessible: false, baby_changing: false, free: true, gender_neutral: false, requires_purchase: false },
      });
    }
  }, [restaurant, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleAmenity = (key: keyof ToiletAmenities) => {
    setFormData(prev => ({ ...prev, amenities: { ...prev.amenities, [key]: !prev.amenities[key] } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === 'new_location') {
        if (!formData.name || !formData.address || !formData.latitude || !formData.longitude || !formData.email) {
          throw new Error('Please fill in all required fields');
        }
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (lat < 47.3 || lat > 47.7 || lng < 18.8 || lng > 19.3) {
          throw new Error('Coordinates must be within Budapest area');
        }
        const { error } = await supabase.from('contributions').insert([{
          name: formData.name, address: formData.address,
          latitude: lat, longitude: lng,
          toilet_code: formData.toiletCode || null,
          toilet_notes: formData.toiletNotes || null,
          toilet_direction: formData.toiletDirection,
          toilet_status: formData.toiletStatus,
          amenities: formData.amenities,
          contribution_type: 'new_location',
          user_email: formData.email,
          description: `Hours: ${formData.openingHours || 'N/A'}, Phone: ${formData.phone || 'N/A'}`,
        }] as never);
        if (error) throw error;
      } else if (restaurant) {
        if (!formData.updateDescription) {
          throw new Error('Please describe the update');
        }
        const { error } = await supabase.from('contributions').insert([{
          restaurant_id: restaurant.id,
          name: formData.name || restaurant.name,
          address: formData.address || restaurant.address,
          latitude: formData.latitude ? parseFloat(formData.latitude) : restaurant.latitude,
          longitude: formData.longitude ? parseFloat(formData.longitude) : restaurant.longitude,
          toilet_code: formData.toiletCode || null,
          toilet_notes: formData.toiletNotes || null,
          toilet_direction: formData.toiletDirection,
          toilet_status: formData.toiletStatus,
          amenities: formData.amenities,
          contribution_type: 'update_suggestion',
          user_email: formData.email || null,
          description: formData.updateDescription,
        }] as never);
        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => { onSuccess(); handleClose(); }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setFormData({
      name: '', address: '', latitude: '', longitude: '',
      toiletCode: '', toiletNotes: '', toiletDirection: null,
      toiletStatus: 'unknown', openingHours: '', phone: '',
      email: '', updateDescription: '',
      amenities: { wheelchair_accessible: false, baby_changing: false, free: true, gender_neutral: false, requires_purchase: false },
    });
    onClose();
  };

  const amenityButtons = [
    { key: 'wheelchair_accessible' as const, icon: Accessibility, label: 'Wheelchair' },
    { key: 'baby_changing' as const, icon: Baby, label: 'Baby Change' },
    { key: 'free' as const, icon: DollarSign, label: 'Free' },
    { key: 'gender_neutral' as const, icon: Users, label: 'Gender Neutral' },
    { key: 'requires_purchase' as const, icon: AlertTriangle, label: 'Purchase Req.' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl sm:mx-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold">{type === 'new_location' ? 'Add New Location' : 'Suggest Update'}</h2>
              {type === 'update_suggestion' && restaurant && (
                <p className="text-xs text-blue-200 mt-0.5">{restaurant.name}</p>
              )}
            </div>
            <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Thank You!</h3>
            <p className="text-sm text-gray-600 mt-1">Your contribution will be reviewed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[75vh] sm:max-h-[70vh]">
            <div className="space-y-3">
              {type === 'new_location' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <MapPin className="w-3.5 h-3.5 inline mr-1" />Location Name *
                    </label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      placeholder="e.g., Cafe Budapest" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address *</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange}
                      placeholder="e.g., Vaci utca 12, Budapest" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Latitude *</label>
                      <input type="number" name="latitude" value={formData.latitude} onChange={handleChange}
                        placeholder="47.4979" step="0.000001" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Longitude *</label>
                      <input type="number" name="longitude" value={formData.longitude} onChange={handleChange}
                        placeholder="19.0402" step="0.000001" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Right-click on Google Maps to get coordinates</p>
                </>
              )}

              {type === 'update_suggestion' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">What needs updating? *</label>
                  <textarea name="updateDescription" value={formData.updateDescription} onChange={handleChange}
                    placeholder="Describe the changes..." rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" required />
                </div>
              )}

              {/* Code & Direction */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Key className="w-3.5 h-3.5 inline mr-1" />Code
                  </label>
                  <input type="text" name="toiletCode" value={formData.toiletCode} onChange={handleChange}
                    placeholder="1234" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Navigation className="w-3.5 h-3.5 inline mr-1" />Direction
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {directionOptions.map(opt => (
                      <button key={opt.value ?? 'null'} type="button"
                        onClick={() => setFormData(prev => ({ ...prev, toiletDirection: opt.value }))}
                        className={`px-2 py-1 rounded text-xs transition-all ${
                          formData.toiletDirection === opt.value
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>{opt.icon}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <div className="flex gap-2">
                  {statusOptions.map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setFormData(prev => ({ ...prev, toiletStatus: opt.value }))}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                        formData.toiletStatus === opt.value
                          ? opt.value === 'working' ? 'border-green-500 bg-green-50 text-green-700'
                          : opt.value === 'not_working' ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="toiletNotes" value={formData.toiletNotes} onChange={handleChange}
                  placeholder="Helpful tips..." rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Amenities</label>
                <div className="flex flex-wrap gap-1.5">
                  {amenityButtons.map(({ key, icon: Icon, label }) => (
                    <button key={key} type="button" onClick={() => toggleAmenity(key)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all ${
                        formData.amenities[key] ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      <Icon className="w-3 h-3" />{label}
                    </button>
                  ))}
                </div>
              </div>

              {type === 'new_location' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />Hours
                    </label>
                    <input type="text" name="openingHours" value={formData.openingHours} onChange={handleChange}
                      placeholder="8:00-22:00" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <Phone className="w-3.5 h-3.5 inline mr-1" />Phone
                    </label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="+36..." className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Your Email {type === 'new_location' ? '*' : '(optional)'}
                </label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="you@email.com" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required={type === 'new_location'} />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 text-sm">
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
