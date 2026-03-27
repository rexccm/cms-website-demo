import {Await, useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {AboutUs} from '~/components/AboutUs'; 
import {Events} from '~/components/Events'; 
import {HeroCarousel} from '~/components/HeroCarousel'; 

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  /* return [{title: 'Hydrogen | Home'}]; */
  return [{title: 'Hong Kong Obesity Society'}];
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
async function loadCriticalData({context}) {
  const [{collections}, aboutImageResult, shopResult, shopResultZhTw, heroSlidesResult, aimsResult, eventListResult] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY), 
    // Add other queries here, so that they are loaded in parallel
    context.storefront.query(ABOUT_IMAGE_QUERY), 
    context.storefront.query(SHOP_SUMMARY_QUERY), 
    context.storefront.query(SHOP_SUMMARY_ZH_TW_QUERY), 
    context.storefront.query(HERO_SLIDES_QUERY), 
    context.storefront.query(AIMS_QUERY),
    context.storefront.query(EVENT_LIST_QUERY, {
      variables: {
        blogHandle: 'events',
        first: 4,
        language: context.storefront.i18n.language,
      },
    }), 
  ]); 

  const aboutImage = aboutImageResult?.shop?.metafield?.reference?.image ?? null;
  const shopSummary = shopResult?.shop?.metafield?.value ?? '';
  const shopSummaryZhTw = shopResultZhTw?.shop?.metafield?.value ?? '';
  const heroSlides = heroSlidesResult?.metaobjects?.nodes ?? []; 
  const aims = aimsResult?.metaobjects?.nodes ?? [];
  const eventList = eventListResult?.blog?.articles?.nodes ?? []; 

  return {
    featuredCollection: collections.nodes[0],
    aboutImage, 
    shopSummary, 
    shopSummaryZhTw, 
    heroSlides, 
    aims, 
    eventList, 
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() { 
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      {/* Hero Carousel */}
      <div>
        <HeroCarousel heroSlides={data.heroSlides} />
        
        {/* 
          {data.heroSlides.maps((heroSlide, index) => { 
            <p>{index}</p>
          })}
        */}
      </div>

      {/* Events */}
      <Events eventList={data.eventList} />
      
      {/* About Us */}
      <AboutUs aboutImage={data.aboutImage} shopSummary={data.shopSummary} shopSummaryZhTw={data.shopSummaryZhTw} aims={data.aims} />
      
      {/* <FeaturedCollection collection={data.featuredCollection} /> */}
      {/* <RecommendedProducts products={data.recommendedProducts} /> */}
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h2 className="section-heading">{collection.title}</h2>
    </Link>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/* Custom GraphQL Queries */
/* About Us */
/* Image */
const ABOUT_IMAGE_QUERY = `#graphql
  query AboutImage($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      metafield(namespace: "custom", key: "hkos_about_us_image") {
        key
        value
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`; 

/* Description */
/* English */
const SHOP_SUMMARY_QUERY = `#graphql
  query ShopSummary($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      metafield(namespace: "custom", key: "hkos_about_us_description") {
        value
      }
    }
  }
`; 

/* Traditional Chinese */
const SHOP_SUMMARY_ZH_TW_QUERY = `#graphql
  query ShopSummaryZhTw($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      metafield(namespace: "custom", key: "hkos_about_us_description_zh_tw") {
        value
      }
    }
  }
`; 

/* Metaobjects */
/* Hero Slides */
const HERO_SLIDES_QUERY = `#graphql
  query HeroSlides($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobjects(type: "hero_slide", first: 250, reverse: true) { 
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

/* Aims */
const AIMS_QUERY = `#graphql
  query Metaobjects($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    metaobjects(type: "aims", first: 250) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

/* Event List */
const EVENT_LIST_QUERY = `#graphql
  query EventList(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int, 
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      articles(
        first: $first, 
        reverse: true
      ) {
        nodes {
          id
          title
          contentHtml
          handle
          publishedAt
          excerpt
          image {
            url
            altText
            width
            height
          }
          title_zh_tw: metafield(namespace: "custom", key: "title_zh_tw") {
            value
          }
          content_zh_tw: metafield(namespace: "custom", key: "content_zh_tw") {
            value
          }
        }
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
