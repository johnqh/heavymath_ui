import { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { MasterDetailLayout, MasterListItem } from '@sudobility/components';
import { ui } from '@sudobility/design';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useHeavymathUiText } from '../HeavymathUiTextProvider';

export interface WritingsArticleConfig {
  slug: string;
  mediumUrl: string;
}

export interface WritingsSectionProps {
  /** Language code for loading localized markdown (e.g. 'en', 'ja') */
  lang: string;
  /** Currently selected article slug from URL params */
  selectedSlug?: string;
  /** Article definitions (slug + mediumUrl) */
  articles: readonly WritingsArticleConfig[];
  /** Called when user selects an article */
  onSelectArticle: (slug: string) => void;
  /** Called when user navigates back on mobile */
  onBackToNavigation: () => void;
  /** App name for SEO */
  appName: string;
}

type ArticleData = {
  slug: string;
  title: string;
  html: string;
  mediumUrl: string;
};

export function WritingsSection({
  lang,
  selectedSlug: selectedSlugProp,
  articles: articleConfigs,
  onSelectArticle,
  onBackToNavigation,
}: WritingsSectionProps) {
  const text = useHeavymathUiText();

  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'navigation' | 'content'>(
    selectedSlugProp ? 'content' : 'navigation'
  );
  const animationRef = useRef<{
    triggerTransition: (onContentChange: () => void) => void;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadArticles() {
      setLoading(true);
      const loaded: ArticleData[] = [];

      for (const article of articleConfigs) {
        try {
          const langToTry = lang || 'en';
          let res = await fetch(`/writings/${langToTry}/${article.slug}.md`);
          if (!res.ok && langToTry !== 'en') {
            res = await fetch(`/writings/en/${article.slug}.md`);
          }
          if (!res.ok) continue;

          const md = await res.text();
          const titleMatch = md.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : article.slug;
          const body = md.replace(/^#\s+.+\n*/, '');
          const rawHtml = await marked(body);
          // Content is from our own static markdown files, sanitized via DOMPurify
          const sanitized = DOMPurify.sanitize(rawHtml);
          const html = sanitized
            .replace(/<h2/g, '<br/><h2')
            .replace(/<h3/g, '<br/><h3');

          loaded.push({
            slug: article.slug,
            title,
            html,
            mediumUrl: article.mediumUrl,
          });
        } catch {
          // Skip articles that fail to load
        }
      }

      if (cancelled) return;
      setArticles(loaded);
      setLoading(false);
    }

    loadArticles();
    return () => {
      cancelled = true;
    };
  }, [lang, articleConfigs]);

  const selectedSlug =
    selectedSlugProp || (articles.length > 0 ? articles[0].slug : null);

  const handleSelect = useCallback(
    (articleSlug: string) => {
      if (animationRef.current) {
        animationRef.current.triggerTransition(() => {
          onSelectArticle(articleSlug);
        });
      } else {
        onSelectArticle(articleSlug);
      }
      setMobileView('content');
    },
    [onSelectArticle]
  );

  const selectedArticle = articles.find(a => a.slug === selectedSlug);

  const masterContent = (
    <div className='space-y-1 p-2'>
      {articles.map(article => (
        <MasterListItem
          key={article.slug}
          isSelected={article.slug === selectedSlug}
          onClick={() => handleSelect(article.slug)}
          icon={DocumentTextIcon}
          label={article.title}
        />
      ))}
    </div>
  );

  const detailContent = selectedArticle ? (
    <div className='p-4 md:p-6 overflow-y-auto h-full'>
      {/* Content is sanitized via DOMPurify.sanitize() above - safe to render */}
      <article
        className='prose prose-base lg:prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:my-4 prose-ul:my-4 prose-hr:my-10'
        dangerouslySetInnerHTML={{ __html: selectedArticle.html }}
      />
      {selectedArticle.mediumUrl && (
        <div className='mt-8 pt-4 border-t border-[--color-ui-border-default]'>
          <a
            href={selectedArticle.mediumUrl}
            target='_blank'
            rel='noopener noreferrer'
            className={`${ui.text.body} text-[--color-ui-text-link] hover:underline`}
          >
            {text('writings.readOnMedium')} &rarr;
          </a>
        </div>
      )}
    </div>
  ) : loading ? (
    <div className='flex items-center justify-center h-full'>
      <p className='text-[--color-ui-text-muted]'>
        {text('writings.loadingArticle')}
      </p>
    </div>
  ) : (
    <div className='flex items-center justify-center h-full'>
      <p className='text-[--color-ui-text-muted]'>
        {text('writings.errorLoading')}
      </p>
    </div>
  );

  return (
    <MasterDetailLayout
      masterTitle={text('writings.title')}
      backButtonText={text('writings.back')}
      masterContent={masterContent}
      detailContent={detailContent}
      detailTitle={selectedArticle?.title}
      mobileView={mobileView}
      onBackToNavigation={() => {
        setMobileView('navigation');
        onBackToNavigation();
      }}
      animationRef={animationRef}
      enableAnimations={true}
      animationDuration={100}
    />
  );
}
