import {
  MapPin,
  Clock,
  Phone,
  Key,
  Info,
  Navigation,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Accessibility,
  Baby,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import type { Restaurant, ToiletDirection } from '../lib/types';

interface ToiletCardProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onSelect: () => void;
  onFeedback: () => void;
  onUpdate: () => void;
}

const directionLabels: Record<NonNullable<ToiletDirection>, { label: string; icon: string }> = {
  left: { label: 'Turn Left', icon: '←' },
  right: { label: 'Turn Right', icon: '→' },
  straight: { label: 'Straight Ahead', icon: '↑' },
  upstairs: { label: 'Go Upstairs', icon: '↗' },
  downstairs: { label: 'Go Downstairs', icon: '↘' },
  basement: { label: 'In Basement', icon: '⬇' },
};

export default function ToiletCard({ restaurant, isSelected, onSelect, onFeedback, onUpdate }: ToiletCardProps) {
  const getStatusBadge = () => {
    if (restaurant.toilet_status === 'not_working') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
          <XCircle className="w-3 h-3" />
          Not Working
        </span>
      );
    }
    if (restaurant.toilet_status === 'unknown') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
          <AlertTriangle className="w-3 h-3" />
          Unverified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
        <CheckCircle className="w-3 h-3" />
        Available
      </span>
    );
  };

  const renderRating = () => {
    if (!restaurant.rating) return null;
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${
                star <= Math.round(restaurant.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">
          ({restaurant.rating_count})
        </span>
      </div>
    );
  };

  const renderAmenities = () => {
    if (!restaurant.amenities) return null;
    const amenities = [];
    if (restaurant.amenities.wheelchair_accessible) {
      amenities.push(
        <span key="wheelchair" className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full" title="Wheelchair Accessible">
          <Accessibility className="w-3 h-3" />
        </span>
      );
    }
    if (restaurant.amenities.baby_changing) {
      amenities.push(
        <span key="baby" className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-50 text-pink-700 text-xs rounded-full" title="Baby Changing">
          <Baby className="w-3 h-3" />
        </span>
      );
    }
    if (restaurant.amenities.free) {
      amenities.push(
        <span key="free" className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
          Free
        </span>
      );
    }
    return amenities.length > 0 ? <div className="flex flex-wrap gap-1 mt-2">{amenities}</div> : null;
  };

  const openInMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div
      onClick={onSelect}
      className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-lg group-hover:text-blue-700 transition-colors">
            {restaurant.name}
          </h3>
          {renderRating()}
        </div>
        <div className="flex flex-col items-end gap-1">
          {getStatusBadge()}
          {restaurant.verified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-blue-600" title="Verified Location">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-2">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
          <span className="line-clamp-2">{restaurant.address}</span>
        </div>

        {restaurant.opening_hours && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span>{restaurant.opening_hours}</span>
          </div>
        )}

        {restaurant.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <a
              href={`tel:${restaurant.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-blue-600 hover:underline"
            >
              {restaurant.phone}
            </a>
          </div>
        )}

        {/* Toilet Code */}
        {restaurant.toilet_code && (
          <div className="flex items-center gap-2 mt-3 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <Key className="w-4 h-4 flex-shrink-0 text-blue-600" />
            <div>
              <span className="text-xs text-blue-600 font-medium">Access Code</span>
              <p className="font-bold text-blue-800 text-lg tracking-wider">{restaurant.toilet_code}</p>
            </div>
          </div>
        )}

        {/* Direction */}
        {restaurant.toilet_direction && (
          <div className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
            <Navigation className="w-4 h-4 flex-shrink-0 text-indigo-600" />
            <span className="text-gray-700">
              <span className="text-lg mr-1">{directionLabels[restaurant.toilet_direction].icon}</span>
              {directionLabels[restaurant.toilet_direction].label}
            </span>
          </div>
        )}

        {/* Notes */}
        {restaurant.toilet_notes && (
          <div className="flex items-start gap-2 text-sm text-gray-700 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
            <span className="line-clamp-3">{restaurant.toilet_notes}</span>
          </div>
        )}

        {renderAmenities()}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFeedback();
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Report
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate();
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Info className="w-4 h-4" />
          Update
        </button>
        <button
          onClick={openInMaps}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Go
        </button>
      </div>
    </div>
  );
}
