import { useState, useCallback } from 'react';
import type {
  IndexerClient,
  CommentData,
  DiscussionQuery,
  SubjectType,
} from '@sudobility/heavymath_indexer_client';
import {
  useDiscussionComments,
  usePostComment,
  useDeleteComment,
  useAuthSession,
} from '@sudobility/heavymath_indexer_client';
import { useDiscussionForEntity } from '@sudobility/heavymath_lib';
import { CommentThread } from './CommentThread';
import { CommentComposer } from './CommentComposer';
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

export interface DiscussionSectionProps {
  client: IndexerClient;
  subjectType: SubjectType;
  sport: string;
  subjectId: string;
}

export function DiscussionSection({
  client,
  subjectType,
  sport,
  subjectId,
}: DiscussionSectionProps) {
  const text = useHeavymathUiText();
  const [page, setPage] = useState(1);
  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );

  const query: DiscussionQuery = { subjectType, sport, subjectId };

  const { discussion, isLocked } = useDiscussionForEntity(client, query);
  const { comments, pagination, isLoading } = useDiscussionComments(
    client,
    discussion?.id,
    {
      page,
      limit: 20,
      sort: 'oldest',
    }
  );
  const { isAuthenticated: isAuthed, address } = useAuthSession();
  const postComment = usePostComment(client);
  const deleteComment = useDeleteComment(client);

  const canPost = isAuthed && !isLocked;

  const handleSubmit = useCallback(
    async (content: string, parentId?: number, mentionedAddress?: string) => {
      await postComment.mutateAsync({
        subjectType,
        sport,
        subjectId,
        content,
        parentId,
        mentionedAddress,
      });
    },
    [postComment, subjectType, sport, subjectId]
  );

  const handleDelete = useCallback(
    async (commentId: number) => {
      setDeletingCommentId(commentId);
      try {
        await deleteComment.mutateAsync(commentId);
      } finally {
        setDeletingCommentId(null);
      }
    },
    [deleteComment]
  );

  const handleReply = useCallback((comment: CommentData) => {
    setReplyingTo(comment);
  }, []);

  return (
    <div className='space-y-4'>
      {/* Comment list */}
      {isLoading ? (
        <div className='py-8 text-center text-sm text-gray-500 dark:text-gray-400'>
          {text('common.loading')}
        </div>
      ) : comments.length === 0 ? (
        <div className='py-8 text-center text-sm text-gray-500 dark:text-gray-400'>
          {text('discussion.no_comments')}
        </div>
      ) : (
        <div>
          {comments.map(comment => (
            <CommentThread
              key={comment.id}
              comment={comment}
              currentAddress={address ?? undefined}
              onReply={canPost ? handleReply : undefined}
              onDelete={handleDelete}
              deletingCommentId={deletingCommentId}
            />
          ))}

          {/* Load more */}
          {pagination && page * pagination.limit < pagination.total && (
            <button
              onClick={() => setPage(p => p + 1)}
              className='w-full py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
            >
              {text('discussion.load_more')}
            </button>
          )}
        </div>
      )}

      {/* Composer */}
      <CommentComposer
        onSubmit={handleSubmit}
        isSubmitting={postComment.isPending}
        isAuthenticated={isAuthed}
        isLocked={isLocked}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {/* Error display */}
      {postComment.isError && (
        <div className='text-sm text-red-600 dark:text-red-400'>
          {postComment.error?.message || text('discussion.moderation_error')}
        </div>
      )}
    </div>
  );
}
