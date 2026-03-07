export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          nationality: string;
          gender: string;
          birth_date: string | null;
          age_group: string;
          hobby_tags: string[];
          free_text: string;
          video_links: string[];
          languages: string[];
          travel_style: string;
          gender_filter: string[];
          age_range_min: number;
          age_range_max: number;
          toku_points: number;
          avatar_url: string;
          want_to_meet_mode: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          nationality?: string;
          gender?: string;
          birth_date?: string | null;
          age_group?: string;
          hobby_tags?: string[];
          free_text?: string;
          video_links?: string[];
          languages?: string[];
          travel_style?: string;
          gender_filter?: string[];
          age_range_min?: number;
          age_range_max?: number;
          toku_points?: number;
          avatar_url?: string;
          want_to_meet_mode?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          nationality?: string;
          gender?: string;
          birth_date?: string | null;
          age_group?: string;
          hobby_tags?: string[];
          free_text?: string;
          video_links?: string[];
          languages?: string[];
          travel_style?: string;
          gender_filter?: string[];
          age_range_min?: number;
          age_range_max?: number;
          toku_points?: number;
          avatar_url?: string;
          want_to_meet_mode?: boolean;
        };
      };
      encounters: {
        Row: {
          id: string;
          user_a_id: string;
          user_b_id: string;
          location: string;
          latitude: number | null;
          longitude: number | null;
          distance_meters: number;
          encountered_at: string;
          expired: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_a_id: string;
          user_b_id: string;
          location: string;
          latitude?: number | null;
          longitude?: number | null;
          distance_meters?: number;
          encountered_at?: string;
          expired?: boolean;
        };
        Update: {
          expired?: boolean;
        };
      };
      swipes: {
        Row: {
          id: string;
          swiper_id: string;
          target_id: string;
          encounter_id: string;
          direction: 'right' | 'left';
          created_at: string;
        };
        Insert: {
          id?: string;
          swiper_id: string;
          target_id: string;
          encounter_id: string;
          direction: 'right' | 'left';
        };
        Update: {
          direction?: 'right' | 'left';
        };
      };
      matches: {
        Row: {
          id: string;
          user_a_id: string;
          user_b_id: string;
          status: 'pending' | 'matched' | 'expired';
          chat_open: boolean;
          meet_confirmed_a: boolean;
          meet_confirmed_b: boolean;
          meet_deadline: string | null;
          met_up: boolean;
          matched_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_a_id: string;
          user_b_id: string;
          status?: 'pending' | 'matched' | 'expired';
          chat_open?: boolean;
          meet_confirmed_a?: boolean;
          meet_confirmed_b?: boolean;
          meet_deadline?: string | null;
          met_up?: boolean;
        };
        Update: {
          status?: 'pending' | 'matched' | 'expired';
          chat_open?: boolean;
          meet_confirmed_a?: boolean;
          meet_confirmed_b?: boolean;
          meet_deadline?: string | null;
          met_up?: boolean;
        };
      };
      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          sender_id: string;
          text: string;
        };
        Update: {
          text?: string;
        };
      };
      stamps: {
        Row: {
          id: string;
          owner_id: string;
          met_user_id: string | null;
          nationality: string;
          user_name: string;
          location: string;
          stamped_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          met_user_id?: string | null;
          nationality: string;
          user_name: string;
          location?: string;
          stamped_at?: string;
        };
        Update: {
          location?: string;
        };
      };
      toku_history: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          points: number;
        };
        Update: never;
      };
      location_logs: {
        Row: {
          id: string;
          user_id: string;
          latitude: number;
          longitude: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          latitude: number;
          longitude: number;
          recorded_at?: string;
        };
        Update: never;
      };
      blocks: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_id: string;
        };
        Update: never;
      };
    };
  };
}
