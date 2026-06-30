import { useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import type { CommentData } from '@sudobility/heavymath_indexer_client';
import { formatAddress } from '../../utils/format';
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

export interface CommentItemProps {
  comment: CommentData;
  currentAddress?: string;
  isAdmin?: boolean;
  onReply?: (comment: CommentData) => void;
  onDelete?: (commentId: number) => void;
  isDeleting?: boolean;
  indented?: boolean;
}

function timeAgo(
  dateStr: string,
  text: (
    key: string,
    values?: Record<string, string | number | bigint>
  ) => string
): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return text('discussion.time_just_now');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return text('discussion.time_minutes_ago', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return text('discussion.time_hours_ago', { count: hours });
  const days = Math.floor(hours / 24);
  return text('discussion.time_days_ago', { count: days });
}

export function CommentItem({
  comment,
  currentAddress,
  isAdmin = false,
  onReply,
  onDelete,
  isDeleting = false,
  indented = false,
}: CommentItemProps) {
  const text = useHeavymathUiText();
  const canDelete =
    !comment.isDeleted &&
    (currentAddress?.toLowerCase() === comment.authorAddress || isAdmin);

  const handleDelete = useCallback(() => {
    if (onDelete && canDelete) {
      onDelete(comment.id);
    }
  }, [onDelete, canDelete, comment.id]);

  const handleReply = useCallback(() => {
    if (onReply) {
      onReply(comment);
    }
  }, [onReply, comment]);

  return (
    <div className={`${indented ? 'ml-8 pl-4 border-l-2 border-border' : ''}`}>
      <div className='flex items-start gap-3 py-3'>
        {/* Avatar - identicon color derived from address hash (data, not theme chrome) */}
        <div
          className='w-8 h-8 rounded-full flex-shrink-0'
          style={{
            backgroundColor: `hsl(${parseInt(comment.authorAddress.slice(2, 8), 16) % 360}, 65%, 55%)`,
          }}
        />

        <div className='flex-1 min-w-0'>
          {/* Header: address + time */}
          <div className='flex items-center gap-2 text-sm'>
            <span className='font-medium text-foreground'>
              {formatAddress(comment.authorAddress)}
            </span>
            <span className='text-muted-foreground'>
              {timeAgo(comment.createdAt, text)}
            </span>
          </div>

          {/* Content */}
          <div className='mt-1 text-sm text-foreground'>
            {comment.mentionedAddress && (
              <span className='text-primary font-medium mr-1'>
                @{formatAddress(comment.mentionedAddress)}
              </span>
            )}
            {comment.isDeleted ? (
              <span className='italic text-muted-foreground'>
                [{text('discussion.comment_deleted')}]
              </span>
            ) : (
              <div className='prose prose-sm dark:prose-invert max-w-none [&>p]:my-1'>
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                  {comment.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Actions */}
          {!comment.isDeleted && (
            <div className='flex items-center gap-3 mt-1'>
              {onReply && (
                <button
                  onClick={handleReply}
                  className='text-xs text-muted-foreground hover:text-foreground'
                >
                  {text('discussion.reply')}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className='text-xs text-destructive hover:text-destructive/80 disabled:opacity-50'
                >
                  {isDeleting
                    ? text('common.pendingEllipsis')
                    : text('discussion.delete')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
