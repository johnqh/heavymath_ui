import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useTranslation } from 'react-i18next';
import type { CommentData } from '@sudobility/heavymath_indexer_client';
import { formatAddress } from '../../utils/format';

export interface CommentComposerProps {
  onSubmit: (content: string, parentId?: number, mentionedAddress?: string) => Promise<void>;
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
  const { t } = useTranslation();
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
      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        {t('discussion.closed', 'This discussion is closed.')}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        {t('discussion.sign_in_to_comment', 'Connect and sign in with your wallet to comment.')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>
            Replying to{' '}
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {formatAddress(replyingTo.authorAddress)}
            </span>
          </span>
          <button
            onClick={onCancelReply}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            x
          </button>
        </div>
      )}

      {/* Tabs: Write / Preview */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowPreview(false)}
          className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-px ${
            !showPreview
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Write
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-px ${
            showPreview
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Input / Preview */}
      {showPreview ? (
        <div className="min-h-[80px] p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
          {content.trim() ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{content}</ReactMarkdown>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Nothing to preview</span>
          )}
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('discussion.post_comment', 'Write a comment... (Markdown supported)')}
          rows={3}
          maxLength={2000}
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}

      {/* Footer: char count + submit */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{content.length}/2000</span>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting
            ? '...'
            : replyingTo
              ? t('discussion.reply', 'Reply')
              : t('discussion.post_comment', 'Comment')}
        </button>
      </div>
    </div>
  );
}
