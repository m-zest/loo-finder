export type ToiletDirection = 'left' | 'right' | 'straight' | 'upstairs' | 'downstairs' | 'basement' | null;
export type ToiletStatus = 'working' | 'not_working' | 'unknown';
export type FeedbackType = 'correction' | 'not_working' | 'wrong_code' | 'closed' | 'rating' | 'general';

export interface ToiletAmenities {
  wheelchair_accessible: boolean;
  baby_changing: boolean;
  free: boolean;
  gender_neutral: boolean;
  requires_purchase: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  has_toilet: boolean;
  toilet_code: string | null;
  toilet_notes: string | null;
  toilet_direction: ToiletDirection;
  toilet_status: ToiletStatus;
  opening_hours: string | null;
  phone: string | null;
  rating: number | null;
  rating_count: number;
  amenities: ToiletAmenities | null;
  verified: boolean;
  last_verified: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contribution {
  id: string;
  restaurant_id: string | null;
  contribution_type: 'new_location' | 'update_suggestion' | 'feedback' | 'report_issue';
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  toilet_code: string | null;
  toilet_notes: string | null;
  toilet_direction: ToiletDirection;
  toilet_status: ToiletStatus;
  amenities: ToiletAmenities | null;
  user_email: string;
  description: string | null;
  rating: number | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Feedback {
  id: string;
  restaurant_id: string;
  feedback_type: FeedbackType;
  message: string;
  rating: number | null;
  user_email: string | null;
  is_resolved: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant;
        Insert: Omit<Restaurant, 'id' | 'created_at' | 'updated_at' | 'rating' | 'rating_count' | 'verified' | 'last_verified'>;
        Update: Partial<Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>>;
      };
      contributions: {
        Row: Contribution;
        Insert: Omit<Contribution, 'id' | 'created_at' | 'status'>;
        Update: Partial<Omit<Contribution, 'id' | 'created_at'>>;
      };
      feedback: {
        Row: Feedback;
        Insert: Omit<Feedback, 'id' | 'created_at' | 'is_resolved'>;
        Update: Partial<Omit<Feedback, 'id' | 'created_at'>>;
      };
    };
  };
}

export interface FilterOptions {
  search: string;
  wheelchairAccessible: boolean;
  babyChanging: boolean;
  freeOnly: boolean;
  genderNeutral: boolean;
  workingOnly: boolean;
  verifiedOnly: boolean;
}
