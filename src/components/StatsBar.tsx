import { MapPin, CheckCircle, Wallet, ShieldCheck } from 'lucide-react';
import type { Restaurant } from '../lib/types';

interface StatsBarProps {
  restaurants: Restaurant[];
}

export default function StatsBar({ restaurants }: StatsBarProps) {
  const totalLocations = restaurants.length;
  const workingLocations = restaurants.filter(r => r.toilet_status === 'working').length;
  const freeLocations = restaurants.filter(r => r.amenities?.free).length;
  const verifiedLocations = restaurants.filter(r => r.verified).length;

  const stats = [
    { icon: <MapPin className="w-4 h-4" />, value: totalLocations, label: 'Total', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-100' },
    { icon: <CheckCircle className="w-4 h-4" />, value: workingLocations, label: 'Open', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-100' },
    { icon: <Wallet className="w-4 h-4" />, value: freeLocations, label: 'Free', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-100' },
    { icon: <ShieldCheck className="w-4 h-4" />, value: verifiedLocations, label: 'Verified', color: 'text-violet-700', bgColor: 'bg-violet-50 border-violet-100' },
  ];

  return (
    <div className="bg-white border-b border-gray-100 px-3 py-2.5">
      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat, index) => (
          <div key={index} className={`flex flex-col items-center py-2 px-1 rounded-xl border ${stat.bgColor}`}>
            <div className={`${stat.color}`}>{stat.icon}</div>
            <span className={`font-bold text-base ${stat.color} mt-0.5`}>{stat.value}</span>
            <span className="text-[10px] text-gray-500 font-medium">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
