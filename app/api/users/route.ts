import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase';
import { ApiResponse, withAuth, validateRequestBody, handleApiError, getPaginationParams, getSearchParams } from '@/lib/api-utils';

// GET /api/users - Get all users with pagination and search
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { page, limit, offset } = getPaginationParams(request);
    const { search } = getSearchParams(request);

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`display_name.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return ApiResponse.internalError('Failed to fetch users');
    }

    return ApiResponse.success({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/users - Create a new user (protected)
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { data: userData, error: validationError } = await validateRequestBody(req, (body) => {
        const { display_name, bio, ens_name, social_links, tutoring_offerings, courses_taken } = body;
        
        if (!display_name) {
          throw new Error('Display name is required');
        }

        return {
          user_id: userId,
          display_name,
          bio: bio || null,
          ens_name: ens_name || null,
          social_links: social_links || [],
          tutoring_offerings: tutoring_offerings || [],
          courses_taken: courses_taken || [],
        };
      });

      if (validationError) return validationError;

      const supabase = createRouteHandlerClient(req);
      
      const { data: user, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return ApiResponse.internalError('Failed to create user');
      }

      return ApiResponse.success(user, 201);
    } catch (error) {
      return handleApiError(error);
    }
  });
}
