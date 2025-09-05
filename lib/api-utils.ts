import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from './supabase';

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

export class ApiResponse {
  static success<T>(data: T, status: number = 200) {
    return NextResponse.json({
      success: true,
      data,
    }, { status });
  }

  static error(error: ApiError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
    }, { status: error.status });
  }

  static badRequest(message: string = 'Bad request') {
    return this.error({ message, status: 400 });
  }

  static unauthorized(message: string = 'Unauthorized') {
    return this.error({ message, status: 401 });
  }

  static forbidden(message: string = 'Forbidden') {
    return this.error({ message, status: 403 });
  }

  static notFound(message: string = 'Not found') {
    return this.error({ message, status: 404 });
  }

  static internalError(message: string = 'Internal server error') {
    return this.error({ message, status: 500 });
  }
}

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // For Farcaster auth, we use the user_id from the session
    const userId = session.user.id;
    
    return await handler(request, userId);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return ApiResponse.internalError('Authentication error');
  }
}

export async function validateRequestBody<T>(
  request: NextRequest,
  schema: (data: any) => T
): Promise<{ data: T; error?: NextResponse }> {
  try {
    const body = await request.json();
    const validatedData = schema(body);
    return { data: validatedData };
  } catch (error) {
    return {
      data: {} as T,
      error: ApiResponse.badRequest('Invalid request body'),
    };
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return ApiResponse.internalError(error.message);
  }
  
  return ApiResponse.internalError('An unexpected error occurred');
}

export function getPaginationParams(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function getSearchParams(request: NextRequest) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const course = url.searchParams.get('course') || '';
  const topic = url.searchParams.get('topic') || '';
  const sortBy = url.searchParams.get('sortBy') || 'created_at';
  const sortOrder = url.searchParams.get('sortOrder') || 'desc';

  return { search, course, topic, sortBy, sortOrder };
}
