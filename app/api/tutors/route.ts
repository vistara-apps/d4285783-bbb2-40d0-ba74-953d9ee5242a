import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase';
import { ApiResponse, withAuth, validateRequestBody, handleApiError, getPaginationParams, getSearchParams } from '@/lib/api-utils';

// GET /api/tutors - Get all tutors with their user data
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { page, limit, offset } = getPaginationParams(request);
    const { search, course, sortBy, sortOrder } = getSearchParams(request);

    let query = supabase
      .from('tutor_profiles')
      .select(`
        *,
        users (
          user_id,
          display_name,
          bio,
          avatar,
          ens_name
        )
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`bio.ilike.%${search}%,specialties.cs.{${search}}`);
    }

    if (course) {
      query = query.contains('courses', [course]);
    }

    // Apply sorting
    const validSortFields = ['ratings', 'total_sessions', 'rates', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const ascending = sortOrder === 'asc';
    
    query = query.order(sortField, { ascending });

    const { data: tutors, error, count } = await query;

    if (error) {
      console.error('Error fetching tutors:', error);
      return ApiResponse.internalError('Failed to fetch tutors');
    }

    return ApiResponse.success({
      tutors,
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

// POST /api/tutors - Create or update tutor profile (protected)
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { data: tutorData, error: validationError } = await validateRequestBody(req, (body) => {
        const { courses, rates, bio, specialties, availability } = body;
        
        if (!courses || !Array.isArray(courses) || courses.length === 0) {
          throw new Error('Courses array is required');
        }

        if (!rates || rates <= 0) {
          throw new Error('Valid rate is required');
        }

        if (!bio || bio.trim().length === 0) {
          throw new Error('Bio is required');
        }

        return {
          user_id: userId,
          courses,
          rates: parseFloat(rates),
          bio: bio.trim(),
          specialties: specialties || [],
          availability: availability || [],
        };
      });

      if (validationError) return validationError;

      const supabase = createRouteHandlerClient(req);
      
      // Check if tutor profile already exists
      const { data: existingTutor } = await supabase
        .from('tutor_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      let result;
      if (existingTutor) {
        // Update existing profile
        const { data: updatedTutor, error } = await supabase
          .from('tutor_profiles')
          .update(tutorData)
          .eq('user_id', userId)
          .select(`
            *,
            users (
              user_id,
              display_name,
              bio,
              avatar,
              ens_name
            )
          `)
          .single();

        if (error) {
          console.error('Error updating tutor profile:', error);
          return ApiResponse.internalError('Failed to update tutor profile');
        }

        result = updatedTutor;
      } else {
        // Create new profile
        const { data: newTutor, error } = await supabase
          .from('tutor_profiles')
          .insert(tutorData)
          .select(`
            *,
            users (
              user_id,
              display_name,
              bio,
              avatar,
              ens_name
            )
          `)
          .single();

        if (error) {
          console.error('Error creating tutor profile:', error);
          return ApiResponse.internalError('Failed to create tutor profile');
        }

        result = newTutor;
      }

      return ApiResponse.success(result, existingTutor ? 200 : 201);
    } catch (error) {
      return handleApiError(error);
    }
  });
}
