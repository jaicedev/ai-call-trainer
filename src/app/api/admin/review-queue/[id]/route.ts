import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserById, getCallForReviewById, submitCallReview, getCallReview, addComment } from '@/lib/db';

// GET /api/admin/review-queue/[id] - Get specific call for review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const user = await getUserById(session.userId);
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const call = await getCallForReviewById(id);

    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    // Also get existing review if any
    const existingReview = await getCallReview(id);

    return NextResponse.json({ call, review: existingReview });
  } catch (error) {
    console.error('Error fetching call for review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call' },
      { status: 500 }
    );
  }
}

// POST /api/admin/review-queue/[id] - Submit review for a call
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const user = await getUserById(session.userId);
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { feedback, notes, rating, postToFeed } = body;

    if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback is required' },
        { status: 400 }
      );
    }

    // Check if call exists and is not already reviewed
    const call = await getCallForReviewById(id);
    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    if (call.reviewed) {
      return NextResponse.json(
        { error: 'Call has already been reviewed' },
        { status: 400 }
      );
    }

    // Submit the review
    const review = await submitCallReview(
      id,
      session.userId,
      feedback.trim(),
      notes?.trim(),
      rating
    );

    if (!review) {
      return NextResponse.json(
        { error: 'Failed to submit review' },
        { status: 500 }
      );
    }

    // If postToFeed is true, also add a comment to the feed (marked as admin review)
    if (postToFeed) {
      // Create a specially formatted comment that indicates it's admin feedback
      const feedbackComment = `[ADMIN REVIEW] ${feedback.trim()}`;
      await addComment(id, session.userId, feedbackComment);
    }

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
