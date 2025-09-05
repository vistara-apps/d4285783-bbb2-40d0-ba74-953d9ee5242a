import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase';
import { ApiResponse, withAuth, validateRequestBody, handleApiError, getPaginationParams, getSearchParams } from '@/lib/api-utils';

// GET /api/resources - Get all resources
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { page, limit, offset } = getPaginationParams(request);
    const { search, course, topic, sortBy, sortOrder } = getSearchParams(request);
    
    const url = new URL(request.url);
    const priceFilter = url.searchParams.get('price'); // 'free' or 'paid'

    let query = supabase
      .from('resources')
      .select(`
        *,
        uploader:users!uploader_id (
          user_id,
          display_name,
          avatar
        )
      `, { count: 'exact' })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }

    if (course) {
      query = query.eq('course', course);
    }

    if (topic) {
      query = query.eq('topic', topic);
    }

    if (priceFilter === 'free') {
      query = query.eq('price', 0);
    } else if (priceFilter === 'paid') {
      query = query.gt('price', 0);
    }

    // Apply sorting
    const validSortFields = ['ratings', 'downloads', 'price', 'created_at', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const ascending = sortOrder === 'asc';
    
    query = query.order(sortField, { ascending });

    const { data: resources, error, count } = await query;

    if (error) {
      console.error('Error fetching resources:', error);
      return ApiResponse.internalError('Failed to fetch resources');
    }

    return ApiResponse.success({
      resources,
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

// POST /api/resources - Create a new resource (protected)
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      const { data: resourceData, error: validationError } = await validateRequestBody(req, (body) => {
        const { title, description, file_url, course, topic, price, file_type, file_size, tags } = body;
        
        if (!title || title.trim().length === 0) {
          throw new Error('Title is required');
        }

        if (!description || description.trim().length === 0) {
          throw new Error('Description is required');
        }

        if (!file_url || file_url.trim().length === 0) {
          throw new Error('File URL is required');
        }

        if (!course || course.trim().length === 0) {
          throw new Error('Course is required');
        }

        if (!topic || topic.trim().length === 0) {
          throw new Error('Topic is required');
        }

        if (!file_type || file_type.trim().length === 0) {
          throw new Error('File type is required');
        }

        if (!file_size || file_size <= 0) {
          throw new Error('Valid file size is required');
        }

        return {
          title: title.trim(),
          description: description.trim(),
          file_url: file_url.trim(),
          uploader_id: userId,
          course: course.trim(),
          topic: topic.trim(),
          price: price ? parseFloat(price) : 0,
          file_type: file_type.trim(),
          file_size: parseInt(file_size),
          tags: tags || [],
        };
      });

      if (validationError) return validationError;

      const supabase = createRouteHandlerClient(req);
      
      const { data: newResource, error } = await supabase
        .from('resources')
        .insert(resourceData)
        .select(`
          *,
          uploader:users!uploader_id (
            user_id,
            display_name,
            avatar
          )
        `)
        .single();

      if (error) {
        console.error('Error creating resource:', error);
        return ApiResponse.internalError('Failed to create resource');
      }

      return ApiResponse.success(newResource, 201);
    } catch (error) {
      return handleApiError(error);
    }
  });
}
