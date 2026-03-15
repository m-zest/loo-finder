import { useState } from 'react';
import {
  X, AlertTriangle, KeyRound, XCircle, Star, MessageSquare,
  CheckCircle, ThumbsUp, ThumbsDown, Navigation
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Restaurant, FeedbackType, ToiletDirection } from '../lib/types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onSuccess: () => void;
}

const feedbackOptions: { type: FeedbackType; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
  { type: 'not_working', icon: <XCircle className="w-5 h-5" />, label: 'Not Working', desc: 'Out of order', color: 'red' },
  { type: 'wrong_code', icon: <KeyRound className="w-5 h-5" />, label: 'Wrong Code', desc: 'Incorrect code', color: 'orange' },
  { type: 'closed', icon: <AlertTriangle className="w-5 h-5" />, label: 'Closed', desc: 'No longer exists', color: 'gray' },
  { type: 'correction', icon: <MessageSquare className="w-5 h-5" />, label: 'Correction', desc: 'Wrong info', color: 'blue' },
  { type: 'rating', icon: <Star className="w-5 h-5" />, label: 'Rate', desc: 'Share experience', color: 'yellow' },
];

const directionOptions: { value: ToiletDirection; label: string; icon: string }[] = [
  { value: 'left', label: 'Left', icon: '\u2190' },
  { value: 'right', label: 'Right', icon: '\u2192' },
  { value: 'straight', label: 'Straight', icon: '\u2191' },
  { value: 'upstairs', label: 'Up', icon: '\u2197' },
  { value: 'downstairs', label: 'Down', icon: '\u2198' },
  { value: 'basement', label: 'Basement', icon: '\u2B07' },
];

export default function FeedbackModal({ isOpen, onClose, restaurant, onSuccess }: FeedbackModalProps) {
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [email, setEmail] = useState('');
  const [newCode, setNewCode] = useState('');
  const [direction, setDirection] = useState<ToiletDirection>(restaurant.toilet_direction);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTypeSelect = (type: FeedbackType) => {
    setSelectedType(type);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;
    setLoading(true);
    setError(null);

    try {
      let feedbackMessage = message;
      if (selectedType === 'wrong_code' && newCode) feedbackMessage = `New code: ${newCode}. ${message}`;
      if (direction && direction !== restaurant.toilet_direction) feedbackMessage += ` Direction: ${direction}`;

      const { error: submitError } = await supabase.from('feedback').insert([{
        restaurant_id: restaurant.id,
        feedback_type: selectedType,
        message: feedbackMessage || `${selectedType} reported`,
        rating: selectedType === 'rating' ? rating : null,
        user_email: email || null,
      }] as never);
      if (submitError) throw submitError;

      setSuccess(true);
      setTimeout(() => { onSuccess(); handleClose(); }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedType(null);
    setMessage('');
    setRating(0);
    setEmail('');
    setNewCode('');
    setDirection(restaurant.toilet_direction);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl sm:mx-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-base font-bold">
                {step === 'select' ? 'Report / Rate' : selectedType === 'rating' ? 'Rate Location' : 'Details'}
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">{restaurant.name}</p>
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
            <p className="text-sm text-gray-600 mt-1">Your feedback helps everyone.</p>
          </div>
        ) : step === 'select' ? (
          <div className="p-3 space-y-2">
            {feedbackOptions.map(option => (
              <button key={option.type} onClick={() => handleTypeSelect(option.type)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all text-left">
                <div className="p-1.5 rounded-lg bg-gray-100">{option.icon}</div>
                <div>
                  <p className="font-semibold text-sm">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.desc}</p>
                </div>
              </button>
            ))}

            <div className="border-t pt-3 mt-3">
              <p className="text-[10px] text-gray-400 mb-2 font-medium uppercase tracking-wider">Quick Actions</p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await supabase.from('feedback').insert([{
                        restaurant_id: restaurant.id, feedback_type: 'general',
                        message: 'Confirmed working', user_email: null
                      }] as never);
                      setSuccess(true);
                      setTimeout(() => { onSuccess(); handleClose(); }, 1500);
                    } catch { setError('Failed'); }
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-50 text-green-700 rounded-xl font-medium text-sm hover:bg-green-100 transition-colors disabled:opacity-50">
                  <ThumbsUp className="w-4 h-4" /> Still Working
                </button>
                <button onClick={() => handleTypeSelect('not_working')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-700 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors">
                  <ThumbsDown className="w-4 h-4" /> Not Working
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-3.5 space-y-3 max-h-[70vh] overflow-y-auto">
            <button type="button" onClick={() => setStep('select')} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              &larr; Back
            </button>

            {selectedType === 'rating' && (
              <div className="text-center py-3">
                <p className="text-xs text-gray-600 mb-2">How was your experience?</p>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedType === 'wrong_code' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <KeyRound className="w-3.5 h-3.5 inline mr-1" />Correct code?
                </label>
                <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)}
                  placeholder="New access code" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Navigation className="w-3.5 h-3.5 inline mr-1" />Direction (optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {directionOptions.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setDirection(opt.value)}
                    className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${
                      direction === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Details</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder={selectedType === 'rating' ? 'Share your experience...' : 'What happened?'}
                rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email (optional)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="For follow-up" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">{error}</div>}

            <button type="submit" disabled={loading || (selectedType === 'rating' && rating === 0)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 text-sm">
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
