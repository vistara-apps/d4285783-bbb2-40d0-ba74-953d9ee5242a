import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TutoringSession, PaymentDetails } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tutorId = searchParams.get('tutorId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId && !tutorId) {
      return NextResponse.json(
        { error: 'Either userId or tutorId is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('tutoring_sessions')
      .select(`
        *,
        tutor:users!tutoring_sessions_tutor_id_fkey(user_id, display_name, avatar),
        student:users!tutoring_sessions_student_id_fkey(user_id, display_name, avatar)
      `)
      .range(offset, offset + limit - 1)
      .order('date_time', { ascending: false });

    // Apply filters
    if (userId) {
      query = query.or(`tutor_id.eq.${userId},student_id.eq.${userId}`);
    }
    if (tutorId) {
      query = query.eq('tutor_id', tutorId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: sessions, error } = await query;

    if (error) {
      throw error;
    }

    const sessionData = sessions.map(session => ({
      sessionId: session.session_id,
      tutorId: session.tutor_id,
      studentId: session.student_id,
      course: session.course,
      dateTime: new Date(session.date_time),
      duration: session.duration,
      status: session.status,
      paymentDetails: session.payment_details as PaymentDetails,
      notes: session.notes || undefined,
      tutor: {
        userId: session.tutor.user_id,
        displayName: session.tutor.display_name,
        avatar: session.tutor.avatar || undefined,
      },
      student: {
        userId: session.student.user_id,
        displayName: session.student.display_name,
        avatar: session.student.avatar || undefined,
      },
    }));

    return NextResponse.json({ data: sessionData, success: true });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tutorId, studentId, course, dateTime, duration, paymentDetails, notes } = body;

    if (!tutorId || !studentId || !course || !dateTime || !duration || !paymentDetails) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate that tutor and student exist
    const { data: tutor, error: tutorError } = await supabase
      .from('tutor_profiles')
      .select('user_id')
      .eq('user_id', tutorId)
      .single();

    if (tutorError || !tutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check for scheduling conflicts
    const sessionStart = new Date(dateTime);
    const sessionEnd = new Date(sessionStart.getTime() + duration * 60000);

    const { data: conflicts, error: conflictError } = await supabase
      .from('tutoring_sessions')
      .select('session_id')
      .eq('tutor_id', tutorId)
      .in('status', ['pending', 'confirmed'])
      .gte('date_time', sessionStart.toISOString())
      .lt('date_time', sessionEnd.toISOString());

    if (conflictError) {
      throw conflictError;
    }

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Tutor is not available at this time' },
        { status: 409 }
      );
    }

    // Create the session
    const { data: newSession, error } = await supabase
      .from('tutoring_sessions')
      .insert({
        tutor_id: tutorId,
        student_id: studentId,
        course,
        date_time: dateTime,
        duration,
        status: 'pending',
        payment_details: paymentDetails,
        notes: notes || null,
      })
      .select(`
        *,
        tutor:users!tutoring_sessions_tutor_id_fkey(user_id, display_name, avatar),
        student:users!tutoring_sessions_student_id_fkey(user_id, display_name, avatar)
      `)
      .single();

    if (error) {
      throw error;
    }

    const sessionResponse = {
      sessionId: newSession.session_id,
      tutorId: newSession.tutor_id,
      studentId: newSession.student_id,
      course: newSession.course,
      dateTime: new Date(newSession.date_time),
      duration: newSession.duration,
      status: newSession.status,
      paymentDetails: newSession.payment_details as PaymentDetails,
      notes: newSession.notes || undefined,
      tutor: {
        userId: newSession.tutor.user_id,
        displayName: newSession.tutor.display_name,
        avatar: newSession.tutor.avatar || undefined,
      },
      student: {
        userId: newSession.student.user_id,
        displayName: newSession.student.display_name,
        avatar: newSession.student.avatar || undefined,
      },
    };

    return NextResponse.json({ data: sessionResponse, success: true });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, status, notes, paymentDetails } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (paymentDetails !== undefined) updateData.payment_details = paymentDetails;

    const { data: updatedSession, error } = await supabase
      .from('tutoring_sessions')
      .update(updateData)
      .eq('session_id', sessionId)
      .select(`
        *,
        tutor:users!tutoring_sessions_tutor_id_fkey(user_id, display_name, avatar),
        student:users!tutoring_sessions_student_id_fkey(user_id, display_name, avatar)
      `)
      .single();

    if (error) {
      throw error;
    }

    // If session is completed, increment tutor's session count
    if (status === 'completed') {
      await supabase
        .from('tutor_profiles')
        .update({ total_sessions: supabase.sql`total_sessions + 1` })
        .eq('user_id', updatedSession.tutor_id);
    }

    const sessionResponse = {
      sessionId: updatedSession.session_id,
      tutorId: updatedSession.tutor_id,
      studentId: updatedSession.student_id,
      course: updatedSession.course,
      dateTime: new Date(updatedSession.date_time),
      duration: updatedSession.duration,
      status: updatedSession.status,
      paymentDetails: updatedSession.payment_details as PaymentDetails,
      notes: updatedSession.notes || undefined,
      tutor: {
        userId: updatedSession.tutor.user_id,
        displayName: updatedSession.tutor.display_name,
        avatar: updatedSession.tutor.avatar || undefined,
      },
      student: {
        userId: updatedSession.student.user_id,
        displayName: updatedSession.student.display_name,
        avatar: updatedSession.student.avatar || undefined,
      },
    };

    return NextResponse.json({ data: sessionResponse, success: true });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
