import {useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {RichText} from '@shopify/hydrogen'; 
import { useState, useEffect } from 'react'; 

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.article.title ?? ''} article`}];
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
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;

  return {article};
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

export default function Article() {
  /** @type {LoaderReturnData} */
  const {article} = useLoaderData();
  const {title, title_zh_tw, image, contentHtml, content_zh_tw, author} = article;

  const [hide, setHide] = useState(true); 

  {/*
  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));
  */}
  
  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return ( 
    <>
      <section className="article article-page page-section row">
        {/* Article Image */}
        <button className="article-image" onClick={(e) => setHide(false)}>
          <figure>
            {image && 
              <Image 
                aspectRatio="auto" 
                data={image} 
                sizes="240px" 
                loading="eager" 
              />
            }
          </figure>
        </button>

        {/* Article Main */}
        <div className="article-main">
          {/* Article Header */}
          <div className="section-header row">
            <h2 className="section-heading">
              {title && <span className="en">{title}</span>}
              {<span className="zh-TW">{title_zh_tw? title_zh_tw.value : title}</span>}
            </h2>
            <time dateTime={article.publishedAt}>{publishedDate}</time>
            {/* <address>{author?.name}</address> */}
          </div>

          {/* Article Content */}
          <article className="blog-content">
            {contentHtml && 
              <span 
                dangerouslySetInnerHTML={{__html: contentHtml}}
                className="en" 
              />
            }
            {content_zh_tw? 
              <span className="zh-TW">
                <RichText data={content_zh_tw.value} />
              </span> : 
              <span 
                dangerouslySetInnerHTML={{__html: contentHtml}}
                className="zh-TW" 
              />
            }
          </article>
        </div>
      </section>
      
      {/* Popup */}
      <section className={"popup " + (hide && "hide")}>
        <div className="popup-modal">
          <div className="popup-header">
            <button className="close" onClick={(e) => setHide(true)}></button>
          </div>
          <figure className="popup-main">
            {image && 
              <Image 
                aspectRatio="auto" 
                data={image} 
                /* sizes="720px" */
                loading="eager" 
              />
            }
          </figure>
        </div>
      </section>
    </>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        title_zh_tw: metafield(namespace: "custom", key: "title_zh_tw") {
          value
          type
        }
        content_zh_tw: metafield(namespace: "custom", key: "content_zh_tw") {
          value
          type
        }
        seo {
          description
          title
        }
      }
    }
  }
`;

/** @typedef {import('./+types/blogs.$blogHandle.$articleHandle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
