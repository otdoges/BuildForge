import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for database operations
 * This client doesn't handle auth - we use Clerk for authentication
 */
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or key not found in environment variables');
  }
  
  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
};

/**
 * Example function for database operations
 * Replace with your actual database operations
 */
export const getDataFromSupabase = async <T>(
  table: string, 
  query: any = {}
): Promise<T[] | null> => {
  const supabase = createSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .match(query);
      
    if (error) {
      throw error;
    }
    
    return data as T[];
  } catch (error) {
    console.error(`Error fetching data from ${table}:`, error);
    return null;
  }
}; 