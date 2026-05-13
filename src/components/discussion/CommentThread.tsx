import type { CommentData } from '@sudobility/heavymath_indexer_client';
import { CommentItem } from './CommentItem';

export interface CommentThreadProps {
  comment: CommentData;
  currentAddress?: string;
  isAdmin?: boolean;
  onReply?: (comment: CommentData) => void;
  onDelete?: (commentId: number) => void;
  deletingCommentId?: number | null;
}

export function CommentThread({
  comment,
  currentAddress,
  isAdmin,
  onReply,
  onDelete,
  deletingCommentId,
}: CommentThreadProps) {
  return (
    <div className='border-b border-gray-100 dark:border-gray-800 last:border-b-0'>
      {/* Top-level comment */}
      <CommentItem
        comment={comment}
        currentAddress={currentAddress}
        isAdmin={isAdmin}
        onReply={onReply}
        onDelete={onDelete}
        isDeleting={deletingCommentId === comment.id}
      />

      {/* Replies (flattened level 2) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className='mb-2'>
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentAddress={currentAddress}
              isAdmin={isAdmin}
              onReply={onReply}
              onDelete={onDelete}
              isDeleting={deletingCommentId === reply.id}
              indented
            />
          ))}
        </div>
      )}
    </div>
  );
}
