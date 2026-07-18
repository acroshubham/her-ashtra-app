// lib/database.types.ts
// Hand-written to match supabase/migrations/001_create_profiles.sql.
// Add a table here whenever you add a migration - or swap this file
// entirely for `supabase gen types typescript` output once the schema
// stabilizes.
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
  };
};
