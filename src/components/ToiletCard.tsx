import {
  MapPin, Clock, Phone, Key, Info, Navigation, Star,
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
          <XCircle className="w-3 h-3" />
          Closed
        </span>
      );
    }
    if (restaurant.toilet_status === 'unknown') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
          <AlertTriangle className="w-3 h-3" />
          Unverified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
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
      className={`group p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-base group-hover:text-blue-700 transition-colors">
            {restaurant.name}
          </h3>
          {/* Distance & Walking Time */}
          {restaurant.distance !== undefined && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Footprints className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-semibold text-purple-600">
                {formatDistance(restaurant.distance)} &middot; {getWalkingTime(restaurant.distance)} walk
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {getStatusBadge()}
          {restaurant.verified && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-blue-600">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-2 space-y-1.5">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
          <span className="line-clamp-1 text-xs">{restaurant.address}</span>
        </div>

        {restaurant.opening_hours && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
            <span>{restaurant.opening_hours}</span>
          </div>
        )}

        {restaurant.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
            <a href={`tel:${restaurant.phone}`} onClick={(e) => e.stopPropagation()} className="hover:text-blue-600 hover:underline">
              {restaurant.phone}
            </a>
          </div>
        )}

        {/* Toilet Code */}
        {restaurant.toilet_code && (
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <Key className="w-4 h-4 flex-shrink-0 text-blue-600" />
            <div>
              <span className="text-xs text-blue-500 font-medium">Code</span>
              <p className="font-bold text-blue-800 text-sm tracking-wider">{restaurant.toilet_code}</p>
            </div>
          </div>
        )}

        {/* Direction */}
        {restaurant.toilet_direction && (
          <div className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded-lg">
            <Navigation className="w-3.5 h-3.5 flex-shrink-0 text-indigo-600" />
            <span className="text-gray-700">
              <span className="text-sm mr-1">{directionLabels[restaurant.toilet_direction].icon}</span>
              {directionLabels[restaurant.toilet_direction].label}
            </span>
          </div>
        )}

        {/* Notes */}
        {restaurant.toilet_notes && (
          <div className="flex items-start gap-2 text-xs text-gray-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
            <span className="line-clamp-2">{restaurant.toilet_notes}</span>
          </div>
        )}

        {/* Amenities */}
        {restaurant.amenities && (
          <div className="flex flex-wrap gap-1">
            {restaurant.amenities.wheelchair_accessible && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full" title="Wheelchair Accessible">
                <Accessibility className="w-3 h-3" />
              </span>
            )}
            {restaurant.amenities.baby_changing && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-pink-50 text-pink-700 text-xs rounded-full" title="Baby Changing">
                <Baby className="w-3 h-3" />
              </span>
            )}
            {restaurant.amenities.free && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">Free</span>
            )}
            {restaurant.amenities.requires_purchase && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">Purchase req.</span>
            )}
          </div>
        )}

        {/* Rating */}
        {restaurant.rating && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-3 h-3 ${star <= Math.round(restaurant.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-500">({restaurant.rating_count})</span>
          </div>
        )}
      </div>

      {/* Voting Section */}
      <div className="mt-2.5 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Is this info correct?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleVote('confirm'); }}
              disabled={voted !== null}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                voted === 'confirm'
                  ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
                  : voted ? 'bg-gray-50 text-gray-400'
                  : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              {restaurant.upvotes > 0 && <span>{restaurant.upvotes}</span>}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleVote('deny'); }}
              disabled={voted !== null}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                voted === 'deny'
                  ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                  : voted ? 'bg-gray-50 text-gray-400'
                  : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <ThumbsDown className="w-3 h-3" />
              {restaurant.downvotes > 0 && <span>{restaurant.downvotes}</span>}
            </button>
          </div>
        </div>

        {/* Deny comment input */}
        {showComment && (
          <div className="mb-2" onClick={(e) => e.stopPropagation()}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What changed? (e.g., new code, closed, etc.)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={submitDeny}
              className="mt-1 w-full py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Submit Report
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onFeedback(); }}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Star className="w-3.5 h-3.5" />
          Rate
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onUpdate(); }}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          Update
        </button>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Go
        </a>
      </div>
    </div>
  );
}
