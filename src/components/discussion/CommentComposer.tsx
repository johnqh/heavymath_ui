import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import type { CommentData } from '@sudobility/heavymath_indexer_client';
import { formatAddress } from '../../utils/format';
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

export interface CommentComposerProps {
  onSubmit: (
    content: string,
    parentId?: number,
    mentionedAddress?: string
  ) => Promise<void>;
  isSubmitting?: boolean;
  isAuthenticated: boolean;
  isLocked: boolean;
  replyingTo?: CommentData | null;
  onCancelReply?: () => void;
}

export function CommentComposer({
  onSubmit,
  isSubmitting = false,
  isAuthenticated,
  isLocked,
  replyingTo,
  onCancelReply,
}: CommentComposerProps) {
  const text = useHeavymathUiText();
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || isSubmitting) return;

    await onSubmit(content.trim(), replyingTo?.id, replyingTo?.authorAddress);
    setContent('');
    setShowPreview(false);
    onCancelReply?.();
  }, [content, isSubmitting, onSubmit, replyingTo, onCancelReply]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  if (isLocked) {
    return (
      <div className='p-4 text-center text-sm text-muted-foreground bg-muted rounded-lg'>
        {text('discussion.closed')}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='p-4 text-center text-sm text-muted-foreground bg-muted rounded-lg'>
        {text('discussion.sign_in_to_comment')}
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {/* Reply indicator */}
      {replyingTo && (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <span>
            {text('discussion.replying_to')}{' '}
            <span className='font-medium text-primary'>
              {formatAddress(replyingTo.authorAddress)}
            </span>
          </span>
          <button
            onClick={onCancelReply}
            className='text-muted-foreground hover:text-foreground'
          >
            x
          </button>
        </div>
      )}

      {/* Tabs: Write / Preview */}
      <div className='flex border-b border-border'>
        <button
          onClick={() => setShowPreview(false)}
          className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-px ${
            !showPreview
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {text('discussion.write')}
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-px ${
            showPreview
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {text('discussion.preview')}
        </button>
      </div>

      {/* Input / Preview */}
      {showPreview ? (
        <div className='min-h-[80px] p-3 border border-border rounded-lg bg-card'>
          {content.trim() ? (
            <div className='prose prose-sm dark:prose-invert max-w-none'>
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <span className='text-muted-foreground text-sm'>
              {text('discussion.nothing_to_preview')}
            </span>
          )}
        </div>
      ) : (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={text('discussion.post_comment')}
          rows={3}
          maxLength={2000}
          className='w-full p-3 border border-input rounded-lg bg-background text-sm text-foreground placeholder-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
        />
      )}

      {/* Footer: char count + submit */}
      <div className='flex items-center justify-between'>
        <span className='text-xs text-muted-foreground'>
          {content.length}/2000
        </span>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className='px-4 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {isSubmitting
            ? text('common.pendingEllipsis')
            : replyingTo
              ? text('discussion.reply')
              : text('discussion.post_comment')}
        </button>
      </div>
    </div>
  );
}
