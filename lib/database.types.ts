export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      dresses: {
        Row: {
          id: string;
          created_at: string;
          owner_id: string;
          title: string;
          types: string[];
          colors: string[];
          size: string;
          price: number;
          description: string;
          image_url: string;
          pickup_location: string;
          custom_pickup_location: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          owner_id: string;
          title: string;
          types: string[];
          colors: string[];
          size: string;
          price: number;
          description: string;
          image_url: string;
          pickup_location: string;
          custom_pickup_location?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          owner_id?: string;
          title?: string;
          types?: string[];
          colors?: string[];
          size?: string;
          price?: number;
          description?: string;
          image_url?: string;
          pickup_location?: string;
          custom_pickup_location?: string | null;
          is_active?: boolean;
        };
      };
      dress_availability: {
        Row: {
          id: string;
          created_at: string;
          dress_id: string;
          start_date: string;
          end_date: string;
          is_available: boolean;
          renter_id: string | null;
          status: "available" | "reserved" | "rented" | "unavailable";
        };
        Insert: {
          id?: string;
          created_at?: string;
          dress_id: string;
          start_date: string;
          end_date: string;
          is_available?: boolean;
          renter_id?: string | null;
          status?: "available" | "reserved" | "rented" | "unavailable";
        };
        Update: {
          id?: string;
          created_at?: string;
          dress_id?: string;
          start_date?: string;
          end_date?: string;
          is_available?: boolean;
          renter_id?: string | null;
          status?: "available" | "reserved" | "rented" | "unavailable";
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
