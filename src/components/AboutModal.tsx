import { X, MapPin, Heart, Users, Shield, Star } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Budapest Loo Finder</h2>
                <p className="text-blue-100 text-sm mt-1">Community-powered toilet finder</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Mission */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Finding a clean, accessible public toilet in Budapest shouldn't be a challenge.
                We're building a comprehensive, community-driven database of free public toilets
                available at restaurants, cafes, and other venues throughout the city.
              </p>
            </div>

            {/* How it Works */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                How It Works
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <span>Browse the map or list to find nearby toilets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <span>Check access codes, directions, and availability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <span>Contribute by adding new locations or updating info</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                  <span>Leave feedback to help keep data accurate</span>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Features
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Access codes',
                  'Directions inside',
                  'Accessibility info',
                  'Baby changing',
                  'User ratings',
                  'Real-time updates',
                  'Verified locations',
                  'Community feedback',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Privacy & Community
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your contributions help everyone. We don't track your location or require
                registration. Email is optional and only used for follow-up if needed.
                All submissions are reviewed before being published.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-center text-sm text-gray-500">
            Made with <Heart className="w-4 h-4 inline text-red-500 mx-1" /> in Budapest
          </p>
        </div>
      </div>
    </div>
  );
}
