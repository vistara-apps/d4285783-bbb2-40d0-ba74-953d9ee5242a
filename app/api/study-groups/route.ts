import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase';
import { ApiResponse, withAuth, validateRequestBody, handleApiError, getPaginationParams, getSearchParams } from '@/lib/api-utils';

// GET /api/study-groups - Get all study groups
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { page, limit, offset } = getPaginationParams(request);
    const { search, course, topic, sortBy, sortOrder } = getSearchParams(request);

    let query = supabase
      .from('study_groups')
      .select(`
        *,
        creator:users!creator_id (
          user_id,
          display_name,
          avatar
        )
      `, { count: 'exact' })
      .eq('is_private', false) // Only show public groups by default
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }

    if (course) {
      query = query.eq('course', course);
    }

    if (topic) {
      query = query.eq('topic', topic);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const ascending = sortOrder === 'asc';
    
    query = query.order(sortField, { ascending });

    const { data: groups, error, count } = await query;

    if (error) {
      console.error('Error fetching study groups:', error);
      return ApiResponse.internalError('Failed to fetch study groups');
    }

    // Add member count to each group
    const groupsWithMemberCount = groups?.map(group => ({
      ...group,
      memberCount: group.members?.length || 0,
    }));

    return ApiResponse.success({
      groups: groupsWithMemberCount,
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

// POST /api/study-groups - Create a new study group (protected)
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { data: groupData, error: validationError } = await validateRequestBody(req, (body) => {
        const { name, description, course, topic, max_members, is_private, tags } = body;
        
        if (!name || name.trim().length === 0) {
          throw new Error('Group name is required');
        }

        if (!description || description.trim().length === 0) {
          throw new Error('Description is required');
        }

        if (!course || course.trim().length === 0) {
          throw new Error('Course is required');
        }

        if (!topic || topic.trim().length === 0) {
          throw new Error('Topic is required');
        }

        return {
          name: name.trim(),
          description: description.trim(),
          course: course.trim(),
          topic: topic.trim(),
          creator_id: userId,
          members: [userId], // Creator is automatically a member
          max_members: max_members || 10,
          is_private: is_private || false,
          tags: tags || [],
        };
      });

      if (validationError) return validationError;

      const supabase = createRouteHandlerClient(req);
      
      const { data: newGroup, error } = await supabase
        .from('study_groups')
        .insert(groupData)
        .select(`
          *,
          creator:users!creator_id (
            user_id,
            display_name,
            avatar
          )
        `)
        .single();

      if (error) {
        console.error('Error creating study group:', error);
        return ApiResponse.internalError('Failed to create study group');
      }

      return ApiResponse.success({
        ...newGroup,
        memberCount: newGroup.members?.length || 0,
      }, 201);
    } catch (error) {
      return handleApiError(error);
    }
  });
}
