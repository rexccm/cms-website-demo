import {Link, useLoaderData} from 'react-router';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {RichText} from '@shopify/hydrogen'; 

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `${data?.blog.title ?? ''}`}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request, params}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

function getPlainText(input) {
  if (!input) return '';
  
  if (input.startsWith('{') && input.includes('"type":"root"')) {
    try {
      const json = JSON.parse(input);
      return extractTextFromJson(json);
    } catch (e) {
      return '';
    }
  }
  
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTextFromJson(node) {
  if (node.type === 'text') return node.value || '';
  if (node.children) {
    return node.children.map(extractTextFromJson).join('');
  }
  return '';
}

export default function Blog() {
  /** @type {LoaderReturnData} */
  const {blog} = useLoaderData();
  const {articles} = blog;
  
  return (
    <section className="blog page-section">
      <div className="section-header">
        <h2 className="section-heading">
          {blog.title == 'Events' && 
            <>
              <span className="en">Events</span>
              <span className="zh-TW">活動資訊</span>
            </>
          }
        </h2>
      </div>
      <div className="blog-grid">
        <PaginatedResourceSection connection={articles}>
          {({node: article, index}) => (
            <ArticleItem
              article={article}
              key={article.id}
              loading={index < 2 ? 'eager' : 'lazy'} 
              index={index}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </section>
  );
}

/**
 * @param {{
 *   article: ArticleItemFragment;
 *   loading?: HTMLImageElement['loading'];
 * }}
 */
function ArticleItem({article, loading, index}) { 
  /* 
    const publishedAt = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(article.publishedAt));
  */

  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  const enSummary = getPlainText(article.contentHtml).substring(0, 100) + '...';
  const zhSummary = article.content_zh_tw?.value 
    ? getPlainText(article.content_zh_tw.value).substring(0, 80) + '...'
    : '';

  return (
    <div className="blog-article row" key={article.id}>
      <div className="index">{index + 1}</div>
      <Link className="row" to={`/blogs/${article.blog.handle}/${article.handle}`}>
        {article.image && (
          <figure>
            <div className="blog-article-image">
              <Image
                alt={article.image.altText || article.title}
                aspectRatio="3/2"
                data={article.image} 
                loading={loading} 
                /* sizes="(min-width: 768px) 50vw, 100vw" */
              />
            </div>
          </figure>
        )}
        <div className="blog-article-main">
          <div className="article-header">
            <h3 className="article-title">
              <span className="en">{article.title}</span>
              <span className="zh-TW">{article.title_zh_tw? article.title_zh_tw.value : article.title}</span>
            </h3>
            <time>{publishedAt}</time>
          </div>
          <article className="blog-content">
            <span className="article-summary en">{enSummary}</span>
            <span className="article-summary zh-TW">{zhSummary? zhSummary : enSummary}</span>
          </article>
        </div>
      </Link>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor, 
        reverse: true
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }

      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    excerpt
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    title_zh_tw: metafield(namespace: "custom", key: "title_zh_tw") {
      value
    }
    content_zh_tw: metafield(namespace: "custom", key: "content_zh_tw") {
      value
    }
    blog {
      handle
    }
  }
`;

/** @typedef {import('./+types/blogs.$blogHandle._index').Route} Route */
/** @typedef {import('storefrontapi.generated').ArticleItemFragment} ArticleItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
