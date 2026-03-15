import {
  MapPin, Clock, Key, Info, Navigation, Star,
  CheckCircle, XCircle, AlertTriangle, Accessibility, Baby,
  ThumbsUp, ThumbsDown, ExternalLink, Footprints
} from 'lucide-react';
import { useState } from 'react';
import type { Restaurant, ToiletDirection, UserLocation } from '../lib/types';
import { formatDistance, getWalkingTime, getDirectionsUrl } from '../lib/geo';

interface ToiletCardProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onSelect: () => void;
  onFeedback: () => void;
  onUpdate: () => void;
  onVote: (restaurantId: string, voteType: 'confirm' | 'deny', comment?: string) => void;
  userLocation: UserLocation | null;
}

const directionLabels: Record<NonNullable<ToiletDirection>, { label: string; icon: string }> = {
  left: { label: 'Turn Left', icon: '\u2190' },
  right: { label: 'Turn Right', icon: '\u2192' },
  straight: { label: 'Straight Ahead', icon: '\u2191' },
  upstairs: { label: 'Go Upstairs', icon: '\u2197' },
  downstairs: { label: 'Go Downstairs', icon: '\u2198' },
  basement: { label: 'In Basement', icon: '\u2B07' },
};

export default function ToiletCard({ restaurant, isSelected, onSelect, onFeedback, onUpdate, onVote, userLocation }: ToiletCardProps) {
  const [voted, setVoted] = useState<'confirm' | 'deny' | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const getStatusBadge = () => {
    if (restaurant.toilet_status === 'not_working') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-[11px] font-bold rounded-full border border-red-200">
          <XCircle className="w-3 h-3" />
          Closed
        </span>
      );
    }
    if (restaurant.toilet_status === 'unknown') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 text-[11px] font-bold rounded-full border border-amber-200">
          <AlertTriangle className="w-3 h-3" />
          Unverified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full border border-emerald-200">
        <CheckCircle className="w-3 h-3" />
        Open
      </span>
    );
  };

  const handleVote = (type: 'confirm' | 'deny') => {
    if (voted) return;
    if (type === 'deny') {
      setShowComment(true);
      setVoted(type);
      return;
    }
    setVoted(type);
    onVote(restaurant.id, type);
  };

  const submitDeny = () => {
    onVote(restaurant.id, 'deny', comment);
    setShowComment(false);
  };

  const directionsUrl = userLocation
    ? getDirectionsUrl(userLocation.latitude, userLocation.longitude, restaurant.latitude, restaurant.longitude)
    : `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}&travelmode=walking`;

  return (
    <div
      onClick={onSelect}
      className={`group rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-100'
          : 'border border-gray-200 hover:border-blue-200 hover:shadow-md'
      }`}
    >
      {/* Main content */}
      <div className="p-4 bg-white">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate text-[15px] group-hover:text-blue-700 transition-colors">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 truncate">{restaurant.address}</span>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Distance & Walking Time */}
        {restaurant.distance !== undefined && (
          <div className="flex items-center gap-2 mt-2.5 px-3 py-2 bg-violet-50 rounded-xl border border-violet-100">
            <Footprints className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-bold text-violet-700">
              {formatDistance(restaurant.distance)}
            </span>
            <span className="text-xs text-violet-400">&middot;</span>
            <span className="text-xs font-semibold text-violet-600">
              {getWalkingTime(restaurant.distance)} walk
            </span>
          </div>
        )}

        {/* Key Info Row */}
        <div className="mt-3 space-y-2">
          {/* Toilet Code - Prominent */}
          {restaurant.toilet_code && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Key className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">Access Code</span>
                <p className="font-black text-blue-800 text-lg tracking-widest leading-tight">{restaurant.toilet_code}</p>
              </div>
            </div>
          )}

          {/* Direction */}
          {restaurant.toilet_direction && (
            <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-xl">
              <Navigation className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700">
                <span className="text-base mr-1">{directionLabels[restaurant.toilet_direction].icon}</span>
                {directionLabels[restaurant.toilet_direction].label}
              </span>
            </div>
          )}

          {/* Opening Hours */}
          {restaurant.opening_hours && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{restaurant.opening_hours}</span>
            </div>
          )}

          {/* Notes */}
          {restaurant.toilet_notes && (
            <div className="flex items-start gap-2 text-xs text-gray-600 bg-amber-50/80 p-2.5 rounded-xl border border-amber-100/50">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
              <span className="line-clamp-2 leading-relaxed">{restaurant.toilet_notes}</span>
            </div>
          )}

          {/* Amenities & Rating Row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {restaurant.amenities?.wheelchair_accessible && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-md border border-blue-100" title="Wheelchair Accessible">
                  <Accessibility className="w-3 h-3" /> Accessible
                </span>
              )}
              {restaurant.amenities?.baby_changing && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-50 text-pink-600 text-[10px] font-semibold rounded-md border border-pink-100" title="Baby Changing">
                  <Baby className="w-3 h-3" /> Baby
                </span>
              )}
              {restaurant.amenities?.free && (
                <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md border border-emerald-100">FREE</span>
              )}
              {restaurant.amenities?.requires_purchase && (
                <span className="inline-flex items-center px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-semibold rounded-md border border-orange-100">Purchase req.</span>
              )}
            </div>

            {restaurant.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-gray-700">{restaurant.rating}</span>
                <span className="text-[10px] text-gray-400">({restaurant.rating_count})</span>
              </div>
            )}
          </div>

          {restaurant.verified && (
            <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified location
            </div>
          )}
        </div>
      </div>

      {/* Voting & Actions Bar */}
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-3">
        {/* Voting */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-gray-400 font-medium">Is this info correct?</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); handleVote('confirm'); }}
              disabled={voted !== null}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                voted === 'confirm'
                  ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                  : voted ? 'bg-gray-100 text-gray-300'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Yes{restaurant.upvotes > 0 && ` (${restaurant.upvotes})`}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleVote('deny'); }}
              disabled={voted !== null}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                voted === 'deny'
                  ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                  : voted ? 'bg-gray-100 text-gray-300'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              No{restaurant.downvotes > 0 && ` (${restaurant.downvotes})`}
            </button>
          </div>
        </div>

        {/* Deny comment */}
        {showComment && (
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What changed? (new code, closed, wrong info...)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none bg-white"
            />
            <button onClick={submitDeny}
              className="mt-1.5 w-full py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors">
              Submit Report
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onFeedback(); }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all"
          >
            <Star className="w-3.5 h-3.5" />
            Rate
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(); }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl transition-all"
          >
            <Info className="w-3.5 h-3.5" />
            Update
          </button>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Walk There
          </a>
        </div>
      </div>
    </div>
  );
}
