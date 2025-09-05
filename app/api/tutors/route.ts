import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TutorProfile, User } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const course = searchParams.get('course');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxRate = parseFloat(searchParams.get('maxRate') || '1000');
    const verified = searchParams.get('verified') === 'true';

    let query = supabase
      .from('tutor_profiles')
      .select(`
        *,
        users (*)
      `)
      .range(offset, offset + limit - 1)
      .order('ratings', { ascending: false });

    // Apply filters
    if (course) {
      query = query.contains('courses', [course]);
    }
    if (minRating > 0) {
      query = query.gte('ratings', minRating);
    }
    if (maxRate < 1000) {
      query = query.lte('rates', maxRate);
    }
    if (verified) {
      query = query.eq('verified', true);
    }

    const { data: tutors, error } = await query;

    if (error) {
      throw error;
    }

    const tutorProfiles = tutors.map(tutor => ({
      userId: tutor.user_id,
      courses: tutor.courses,
      rates: tutor.rates,
      availability: tutor.availability || [],
      ratings: tutor.ratings,
      totalSessions: tutor.total_sessions,
      bio: tutor.bio,
      verified: tutor.verified,
      specialties: tutor.specialties,
      user: {
        userId: tutor.users.user_id,
        displayName: tutor.users.display_name,
        bio: tutor.users.bio || undefined,
        ensName: tutor.users.ens_name || undefined,
        avatar: tutor.users.avatar || undefined,
        createdAt: new Date(tutor.users.created_at),
      }
    }));

    return NextResponse.json({ data: tutorProfiles, success: true });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courses, rates, bio, specialties, availability } = body;

    if (!userId || !courses || !rates || !bio) {
      return NextResponse.json(
        { error: 'User ID, courses, rates, and bio are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if tutor profile already exists
    const { data: existingTutor } = await supabase
      .from('tutor_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (existingTutor) {
      return NextResponse.json(
        { error: 'Tutor profile already exists' },
        { status: 409 }
      );
    }

    // Create tutor profile
    const { data: newTutor, error } = await supabase
      .from('tutor_profiles')
      .insert({
        user_id: userId,
        courses,
        rates,
        bio,
        specialties: specialties || [],
        availability: availability || [],
        verified: false,
        ratings: 0,
        total_sessions: 0,
      })
      .select(`
        *,
        users (*)
      `)
      .single();

    if (error) {
      throw error;
    }

    const tutorProfile = {
      userId: newTutor.user_id,
      courses: newTutor.courses,
      rates: newTutor.rates,
      availability: newTutor.availability || [],
      ratings: newTutor.ratings,
      totalSessions: newTutor.total_sessions,
      bio: newTutor.bio,
      verified: newTutor.verified,
      specialties: newTutor.specialties,
      user: {
        userId: newTutor.users.user_id,
        displayName: newTutor.users.display_name,
        bio: newTutor.users.bio || undefined,
        ensName: newTutor.users.ens_name || undefined,
        avatar: newTutor.users.avatar || undefined,
        createdAt: new Date(newTutor.users.created_at),
      }
    };

    return NextResponse.json({ data: tutorProfile, success: true });
  } catch (error) {
    console.error('Error creating tutor profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
