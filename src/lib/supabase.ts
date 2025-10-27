import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in environment variables');
}



export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  phone_number: string | null;
  full_name: string;
  created_at: string;
  updated_at: string;
};

export type EmergencyContact = {
  id: string;
  user_id: string;
  contact_name: string;
  contact_phone: string;
  created_at: string;
};

export type SosEvent = {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  location_url: string;
  audio_url: string | null;
  status: 'active' | 'resolved' | 'cancelled';
  created_at: string;
};
