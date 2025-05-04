import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-db';
import { auth } from '@clerk/nextjs';

export async function GET(request: NextRequest) {
  // Get the authenticated user from Clerk
  const { userId } = auth();
  
  // If not authenticated, return 401
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseClient();

  try {
    // Example query - replace with your actual table name
    const { data, error } = await supabase
      .from('your_table_name')
      .select('*')
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      data: data || [],
      success: true 
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data', 
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Get the authenticated user from Clerk
  const { userId } = auth();
  
  // If not authenticated, return 401
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createSupabaseClient();
  
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body', success: false },
        { status: 400 }
      );
    }

    // Add the user ID from Clerk to the record
    const recordWithUserId = {
      ...body,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    // Insert into your table - replace with your actual table name
    const { data, error } = await supabase
      .from('your_table_name')
      .insert([recordWithUserId])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      data: data || [],
      success: true 
    });
    
  } catch (error) {
    console.error('Error inserting data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to insert data', 
        success: false 
      },
      { status: 500 }
    );
  }
} 