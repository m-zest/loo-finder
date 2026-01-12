import { MapPin, CheckCircle, Star, Users } from 'lucide-react';
import type { Restaurant } from '../lib/types';

interface StatsBarProps {
  restaurants: Restaurant[];
}

export default function StatsBar({ restaurants }: StatsBarProps) {
  const totalLocations = restaurants.length;
  const workingLocations = restaurants.filter(r => r.toilet_status !== 'not_working').length;
  const verifiedLocations = restaurants.filter(r => r.verified).length;
  const avgRating = restaurants.filter(r => r.rating).reduce((acc, r) => acc + (r.rating || 0), 0) /
                   (restaurants.filter(r => r.rating).length || 1);
  const stats = [
    {
      icon: <MapPin className="w-4 h-4" />,
      value: totalLocations,
      label: 'Locations',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <CheckCircle className="w-4 h-4" />,
      value: workingLocations,
      label: 'Working',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: <Star className="w-4 h-4" />,
      value: avgRating > 0 ? avgRating.toFixed(1) : '-',
      label: 'Avg Rating',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: <Users className="w-4 h-4" />,
      value: verifiedLocations,
      label: 'Verified',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-3 py-2">
      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`flex flex-col items-center p-2 rounded-lg ${stat.bgColor}`}
          >
            <div className={`${stat.color} mb-0.5`}>
              {stat.icon}
            </div>
            <span className={`font-bold text-lg ${stat.color}`}>
              {stat.value}
            </span>
            <span className="text-xs text-gray-500 text-center">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
