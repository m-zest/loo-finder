import { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Key,
  Navigation,
  Clock,
  Phone,
  CheckCircle,
  Accessibility,
  Baby,
  DollarSign,
  Users,
  AlertTriangle
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
  { value: null, label: 'Not specified', icon: '❓' },
  { value: 'left', label: 'Turn Left', icon: '←' },
  { value: 'right', label: 'Turn Right', icon: '→' },
  { value: 'straight', label: 'Straight Ahead', icon: '↑' },
  { value: 'upstairs', label: 'Go Upstairs', icon: '↗' },
  { value: 'downstairs', label: 'Go Downstairs', icon: '↘' },
  { value: 'basement', label: 'In Basement', icon: '⬇' },
];

const statusOptions: { value: ToiletStatus; label: string; color: string }[] = [
  { value: 'working', label: 'Working', color: 'green' },
  { value: 'not_working', label: 'Not Working', color: 'red' },
  { value: 'unknown', label: 'Unknown', color: 'yellow' },
];

export default function ContributionModal({
  isOpen,
  onClose,
  type,
  restaurant,
  onSuccess,
}: ContributionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    toiletCode: '',
    toiletNotes: '',
    toiletDirection: null as ToiletDirection,
    toiletStatus: 'unknown' as ToiletStatus,
    openingHours: '',
    phone: '',
    email: '',
    updateDescription: '',
    amenities: {
      wheelchair_accessible: false,
      baby_changing: false,
      free: true,
      gender_neutral: false,
      requires_purchase: false,
    } as ToiletAmenities,
  });

  useEffect(() => {
    if (restaurant && isOpen) {
      setFormData({
        name: restaurant.name || '',
        address: restaurant.address || '',
        latitude: restaurant.latitude?.toString() || '',
        longitude: restaurant.longitude?.toString() || '',
        toiletCode: restaurant.toilet_code || '',
        toiletNotes: restaurant.toilet_notes || '',
        toiletDirection: restaurant.toilet_direction || null,
        toiletStatus: restaurant.toilet_status || 'unknown',
        openingHours: restaurant.opening_hours || '',
        phone: restaurant.phone || '',
        email: '',
        updateDescription: '',
        amenities: restaurant.amenities || {
          wheelchair_accessible: false,
          baby_changing: false,
          free: true,
          gender_neutral: false,
          requires_purchase: false,
        },
      });
    }
  }, [restaurant, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (key: keyof ToiletAmenities) => {
    setFormData((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [key]: !prev.amenities[key] },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (type === 'new_location') {
        if (!formData.name || !formData.address || !formData.latitude || !formData.longitude || !formData.email) {
          throw new Error('Please fill in all required fields');
        }

        const { error } = await supabase.from('contributions').insert([
          {
            name: formData.name,
            address: formData.address,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            toilet_code: formData.toiletCode || null,
            toilet_notes: formData.toiletNotes || null,
            toilet_direction: formData.toiletDirection,
            toilet_status: formData.toiletStatus,
            amenities: formData.amenities,
            contribution_type: 'new_location',
            user_email: formData.email,
            description: `Opening hours: ${formData.openingHours || 'Not specified'}, Phone: ${formData.phone || 'Not specified'}`,
          },
        ] as never);

        if (error) throw error;
      } else if (restaurant) {
        if (!formData.email || !formData.updateDescription) {
          throw new Error('Please provide your email and describe the update');
        }

        const { error } = await supabase.from('contributions').insert([
          {
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
            user_email: formData.email,
            description: formData.updateDescription,
          },
        ] as never);

        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit contribution');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setFormData({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      toiletCode: '',
      toiletNotes: '',
      toiletDirection: null,
      toiletStatus: 'unknown',
      openingHours: '',
      phone: '',
      email: '',
      updateDescription: '',
      amenities: {
        wheelchair_accessible: false,
        baby_changing: false,
        free: true,
        gender_neutral: false,
        requires_purchase: false,
      },
    });
    onClose();
  };

  const amenityButtons = [
    { key: 'wheelchair_accessible' as const, icon: Accessibility, label: 'Wheelchair Accessible' },
    { key: 'baby_changing' as const, icon: Baby, label: 'Baby Changing' },
    { key: 'free' as const, icon: DollarSign, label: 'Free to Use' },
    { key: 'gender_neutral' as const, icon: Users, label: 'Gender Neutral' },
    { key: 'requires_purchase' as const, icon: AlertTriangle, label: 'Requires Purchase' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">
                {type === 'new_location' ? 'Add New Location' : 'Suggest Update'}
              </h2>
              {type === 'update_suggestion' && restaurant && (
                <p className="text-sm text-blue-100 mt-0.5">{restaurant.name}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Thank You!</h3>
            <p className="text-gray-600 mt-2">
              Your contribution has been submitted and will be reviewed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto max-h-[70vh]">
            {type === 'update_suggestion' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-4">
                <p className="text-sm text-blue-800">
                  Describe what information needs to be updated or corrected.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {type === 'new_location' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Cafe Budapest, McDonald's Westend"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g., Vorosmarty ter 7, Budapest 1051"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Latitude *
                      </label>
                      <input
                        type="number"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="47.4979"
                        step="0.000001"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Longitude *
                      </label>
                      <input
                        type="number"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="19.0402"
                        step="0.000001"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Tip: Get coordinates from Google Maps by right-clicking on the location
                  </p>
                </>
              )}

              {type === 'update_suggestion' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    What needs to be updated? *
                  </label>
                  <textarea
                    name="updateDescription"
                    value={formData.updateDescription}
                    onChange={handleChange}
                    placeholder="Describe the changes needed (e.g., new access code, changed hours, etc.)"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>
              )}

              {/* Toilet Details */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-3">Toilet Details</h4>

                <div className="space-y-4">
                  {/* Access Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Key className="w-4 h-4 inline mr-1" />
                      Access Code
                    </label>
                    <input
                      type="text"
                      name="toiletCode"
                      value={formData.toiletCode}
                      onChange={handleChange}
                      placeholder="e.g., 1234, Ask at counter"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Direction */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Navigation className="w-4 h-4 inline mr-1" />
                      Direction to Toilet
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {directionOptions.map((opt) => (
                        <button
                          key={opt.value ?? 'null'}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, toiletDirection: opt.value }))}
                          className={`p-2 rounded-lg border-2 text-center transition-all text-sm ${
                            formData.toiletDirection === opt.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-lg block">{opt.icon}</span>
                          <span className="text-xs">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Working Status
                    </label>
                    <div className="flex gap-2">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, toiletStatus: opt.value }))}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.toiletStatus === opt.value
                              ? opt.color === 'green' ? 'border-green-500 bg-green-50 text-green-700'
                              : opt.color === 'red' ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Additional Notes
                    </label>
                    <textarea
                      name="toiletNotes"
                      value={formData.toiletNotes}
                      onChange={handleChange}
                      placeholder="Any helpful info (e.g., 'Near the back entrance', 'Key from barista')"
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {amenityButtons.map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAmenity(key)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm transition-all ${
                        formData.amenities[key]
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-left">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {type === 'new_location' && (
                <>
                  {/* Opening Hours and Phone */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Location Info</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Opening Hours
                        </label>
                        <input
                          type="text"
                          name="openingHours"
                          value={formData.openingHours}
                          onChange={handleChange}
                          placeholder="e.g., 8:00-22:00"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          <Phone className="w-4 h-4 inline mr-1" />
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+36 1 234 5678"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  For follow-up only. We won't share or spam you.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Submitting...' : 'Submit Contribution'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
