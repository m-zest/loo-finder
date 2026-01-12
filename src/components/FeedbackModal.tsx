import { useState } from 'react';
import {
  X,
  AlertTriangle,
  KeyRound,
  XCircle,
  Star,
  MessageSquare,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Navigation
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Restaurant, FeedbackType, ToiletDirection } from '../lib/types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onSuccess: () => void;
}

const feedbackOptions: { type: FeedbackType; icon: React.ReactNode; label: string; description: string; color: string }[] = [
  { type: 'not_working', icon: <XCircle className="w-5 h-5" />, label: 'Not Working', description: 'Toilet is out of order', color: 'red' },
  { type: 'wrong_code', icon: <KeyRound className="w-5 h-5" />, label: 'Wrong Code', description: 'Access code is incorrect', color: 'orange' },
  { type: 'closed', icon: <AlertTriangle className="w-5 h-5" />, label: 'Permanently Closed', description: 'Location no longer exists', color: 'gray' },
  { type: 'correction', icon: <MessageSquare className="w-5 h-5" />, label: 'Other Correction', description: 'Wrong info that needs fixing', color: 'blue' },
  { type: 'rating', icon: <Star className="w-5 h-5" />, label: 'Rate & Review', description: 'Share your experience', color: 'yellow' },
];

const directionOptions: { value: ToiletDirection; label: string; icon: string }[] = [
  { value: 'left', label: 'Turn Left', icon: '←' },
  { value: 'right', label: 'Turn Right', icon: '→' },
  { value: 'straight', label: 'Straight Ahead', icon: '↑' },
  { value: 'upstairs', label: 'Go Upstairs', icon: '↗' },
  { value: 'downstairs', label: 'Go Downstairs', icon: '↘' },
  { value: 'basement', label: 'In Basement', icon: '⬇' },
];

export default function FeedbackModal({ isOpen, onClose, restaurant, onSuccess }: FeedbackModalProps) {
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
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

      if (selectedType === 'wrong_code' && newCode) {
        feedbackMessage = `New code: ${newCode}. ${message}`;
      }

      if (direction && direction !== restaurant.toilet_direction) {
        feedbackMessage += ` Direction: ${direction}`;
      }

      const { error: submitError } = await supabase.from('feedback').insert([
        {
          restaurant_id: restaurant.id,
          feedback_type: selectedType,
          message: feedbackMessage || `${selectedType} reported`,
          rating: selectedType === 'rating' ? rating : null,
          user_email: email || null,
        },
      ] as never);

      if (submitError) throw submitError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
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

  const getColorClasses = (color: string, active: boolean) => {
    if (!active) return 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700';
    const colors: Record<string, string> = {
      red: 'bg-red-50 border-red-300 text-red-700',
      orange: 'bg-orange-50 border-orange-300 text-orange-700',
      gray: 'bg-gray-100 border-gray-400 text-gray-700',
      blue: 'bg-blue-50 border-blue-300 text-blue-700',
      yellow: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold">
                {step === 'select' ? 'Report an Issue' : selectedType === 'rating' ? 'Rate This Location' : 'Provide Details'}
              </h2>
              <p className="text-sm text-blue-100 mt-1">{restaurant.name}</p>
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
            <p className="text-gray-600 mt-2">Your feedback helps keep this service accurate.</p>
          </div>
        ) : step === 'select' ? (
          <div className="p-4 space-y-2">
            {feedbackOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleTypeSelect(option.type)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${getColorClasses(option.color, false)} hover:scale-[1.02]`}
              >
                <div className={`p-2 rounded-lg bg-${option.color}-100`}>
                  {option.icon}
                </div>
                <div className="text-left">
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </button>
            ))}

            {/* Quick Actions */}
            <div className="border-t pt-4 mt-4">
              <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Quick Actions</p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await supabase.from('feedback').insert([
                        { restaurant_id: restaurant.id, feedback_type: 'general', message: 'Confirmed working', user_email: null }
                      ] as never);
                      setSuccess(true);
                      setTimeout(() => { onSuccess(); handleClose(); }, 1500);
                    } catch { setError('Failed to submit'); }
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Still Working
                </button>
                <button
                  onClick={() => handleTypeSelect('not_working')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Not Working
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setStep('select')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to options
            </button>

            {/* Rating Stars (for rating type) */}
            {selectedType === 'rating' && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-3">How was your experience?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Okay' : rating === 2 ? 'Poor' : 'Very Poor'}
                  </p>
                )}
              </div>
            )}

            {/* Wrong Code Input */}
            {selectedType === 'wrong_code' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <KeyRound className="w-4 h-4 inline mr-1" />
                  What's the correct code?
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Enter the new access code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Direction Update */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Navigation className="w-4 h-4 inline mr-1" />
                Direction to toilet (optional)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {directionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDirection(opt.value)}
                    className={`p-2 rounded-lg border-2 text-center transition-all ${
                      direction === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <p className="text-xs mt-1">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details {selectedType !== 'rating' && '(optional)'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  selectedType === 'not_working' ? 'What was the issue?' :
                  selectedType === 'wrong_code' ? 'Any additional info about access?' :
                  selectedType === 'closed' ? 'When did it close? Any alternative nearby?' :
                  selectedType === 'rating' ? 'Share your experience...' :
                  'Describe what needs to be corrected...'
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="For follow-up if needed"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (selectedType === 'rating' && rating === 0)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
