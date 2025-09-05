import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    const userResponse: User = {
      userId: user.user_id,
      displayName: user.display_name,
      bio: user.bio || undefined,
      ensName: user.ens_name || undefined,
      socialLinks: user.social_links || undefined,
      tutoringOfferings: user.tutoring_offerings || undefined,
      coursesTaken: user.courses_taken || undefined,
      uploadedResources: user.uploaded_resources || undefined,
      avatar: user.avatar || undefined,
      createdAt: new Date(user.created_at),
    };

    return NextResponse.json({ data: userResponse, success: true });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayName, bio, avatar, ensName } = body;

    if (!userId || !displayName) {
      return NextResponse.json(
        { error: 'User ID and display name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        display_name: displayName,
        bio: bio || null,
        avatar: avatar || null,
        ens_name: ensName || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const userResponse: User = {
      userId: newUser.user_id,
      displayName: newUser.display_name,
      bio: newUser.bio || undefined,
      ensName: newUser.ens_name || undefined,
      avatar: newUser.avatar || undefined,
      createdAt: new Date(newUser.created_at),
    };

    return NextResponse.json({ data: userResponse, success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayName, bio, avatar, ensName, socialLinks, coursesTaken } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (displayName !== undefined) updateData.display_name = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (ensName !== undefined) updateData.ens_name = ensName;
    if (socialLinks !== undefined) updateData.social_links = socialLinks;
    if (coursesTaken !== undefined) updateData.courses_taken = coursesTaken;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const userResponse: User = {
      userId: updatedUser.user_id,
      displayName: updatedUser.display_name,
      bio: updatedUser.bio || undefined,
      ensName: updatedUser.ens_name || undefined,
      socialLinks: updatedUser.social_links || undefined,
      tutoringOfferings: updatedUser.tutoring_offerings || undefined,
      coursesTaken: updatedUser.courses_taken || undefined,
      uploadedResources: updatedUser.uploaded_resources || undefined,
      avatar: updatedUser.avatar || undefined,
      createdAt: new Date(updatedUser.created_at),
    };

    return NextResponse.json({ data: userResponse, success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
