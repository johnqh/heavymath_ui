import { useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useTranslation } from 'react-i18next';
import type { CommentData } from '@sudobility/heavymath_indexer_client';
import { formatAddress } from '../../utils/format';

export interface CommentItemProps {
  comment: CommentData;
  currentAddress?: string;
  isAdmin?: boolean;
  onReply?: (comment: CommentData) => void;
  onDelete?: (commentId: number) => void;
  isDeleting?: boolean;
  indented?: boolean;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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
  const { t } = useTranslation();
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
    <div
      className={`${indented ? 'ml-8 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}
    >
      <div className='flex items-start gap-3 py-3'>
        {/* Avatar - colored circle derived from address */}
        <div
          className='w-8 h-8 rounded-full flex-shrink-0'
          style={{
            backgroundColor: `hsl(${parseInt(comment.authorAddress.slice(2, 8), 16) % 360}, 65%, 55%)`,
          }}
        />

        <div className='flex-1 min-w-0'>
          {/* Header: address + time */}
          <div className='flex items-center gap-2 text-sm'>
            <span className='font-medium text-gray-900 dark:text-gray-100'>
              {formatAddress(comment.authorAddress)}
            </span>
            <span className='text-gray-500 dark:text-gray-400'>
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <div className='mt-1 text-sm text-gray-800 dark:text-gray-200'>
            {comment.mentionedAddress && (
              <span className='text-blue-600 dark:text-blue-400 font-medium mr-1'>
                @{formatAddress(comment.mentionedAddress)}
              </span>
            )}
            {comment.isDeleted ? (
              <span className='italic text-gray-500 dark:text-gray-400'>
                [{t('discussion.comment_deleted', 'deleted')}]
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
                  className='text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                >
                  {t('discussion.reply', 'Reply')}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className='text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50'
                >
                  {isDeleting ? '...' : t('discussion.delete', 'Delete')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
