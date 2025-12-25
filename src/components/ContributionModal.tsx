import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Restaurant } from '../lib/types';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'new_location' | 'update_suggestion';
  restaurant?: Restaurant;
  onSuccess: () => void;
}

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
    name: restaurant?.name || '',
    address: restaurant?.address || '',
    latitude: restaurant?.latitude || '',
    longitude: restaurant?.longitude || '',
    toiletNotes: restaurant?.toilet_notes || '',
    email: '',
    updateDescription: '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            latitude: parseFloat(formData.latitude as string),
            longitude: parseFloat(formData.longitude as string),
            toilet_notes: formData.toiletNotes || null,
            contribution_type: 'new_location',
            user_email: formData.email,
          },
        ]);

        if (error) throw error;
      } else if (restaurant) {
        if (!formData.email || !formData.updateDescription) {
          throw new Error('Please provide your email and update description');
        }

        const { error } = await supabase.from('contributions').insert([
          {
            restaurant_id: restaurant.id,
            name: formData.name || restaurant.name,
            address: formData.address || restaurant.address,
            latitude: formData.latitude ? parseFloat(formData.latitude as string) : restaurant.latitude,
            longitude: formData.longitude ? parseFloat(formData.longitude as string) : restaurant.longitude,
            toilet_notes: formData.updateDescription,
            contribution_type: 'update_suggestion',
            user_email: formData.email,
          },
        ]);

        if (error) throw error;
      }

      setSuccess(true);
      setFormData({
        name: restaurant?.name || '',
        address: restaurant?.address || '',
        latitude: restaurant?.latitude || '',
        longitude: restaurant?.longitude || '',
        toiletNotes: restaurant?.toilet_notes || '',
        email: '',
        updateDescription: '',
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {type === 'new_location' ? 'Add New Location' : 'Suggest Update'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-semibold">Thank you for your contribution!</p>
              <p className="text-green-700 text-sm mt-2">
                Your submission has been received and will be reviewed.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {type === 'new_location' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Café Budapest"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g., Vörösmarty tér 7, Budapest"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="47.4979"
                      step="0.0001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="19.0402"
                      step="0.0001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Toilet Information
                  </label>
                  <textarea
                    name="toiletNotes"
                    value={formData.toiletNotes}
                    onChange={handleChange}
                    placeholder="e.g., Access code, hours, amenities..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-sm text-blue-800">
                  <p className="font-medium">Updating: {restaurant?.name}</p>
                  <p className="text-xs mt-1">{restaurant?.address}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What needs to be updated? *
                  </label>
                  <textarea
                    name="updateDescription"
                    value={formData.updateDescription}
                    onChange={handleChange}
                    placeholder="Describe what information is outdated or incorrect..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded flex gap-2 text-sm">
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Contribution'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
