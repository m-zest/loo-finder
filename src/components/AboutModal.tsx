import { X, MapPin, Heart, Shield, Star, Navigation, ThumbsUp } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Budapest Loo Finder</h2>
                <p className="text-blue-200 text-xs mt-0.5">Find free toilets, skip the hassle</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" /> Our Mission
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Finding a free toilet in Budapest shouldn't be stressful. We map every restaurant,
                cafe, mall, and public space where you can use the toilet - with access codes,
                walking directions, and real-time community updates.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-500" /> How It Works
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {[
                  'Allow location access to see toilets sorted by distance',
                  'Check the access code and indoor directions before going',
                  'Tap "Go" for walking directions via Google Maps',
                  'Vote to confirm info is correct, or report changes',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Features
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Access codes', 'Walking directions', 'Wheelchair info', 'Baby changing',
                  'Community voting', 'Distance sorting', 'Free/paid filter', 'Real-time updates',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-500" /> Community Powered
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every location is verified by the community. Vote to confirm info is correct,
                report changes, add new locations, and help fellow travelers and locals alike.
                No registration required.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" /> Privacy
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your location is only used to show distances and sort results. We don't track
                or store your position. Email is optional and never shared.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <p className="text-center text-xs text-gray-500">
            Made with <Heart className="w-3 h-3 inline text-red-500 mx-0.5" /> in Budapest
          </p>
        </div>
      </div>
    </div>
  );
}
