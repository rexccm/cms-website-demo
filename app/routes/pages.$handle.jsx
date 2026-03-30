import {useLoaderData} from 'react-router';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `${data?.page.title ?? ''}`}];
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
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
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

export default function Page() {
  /** @type {LoaderReturnData} */
  const {page} = useLoaderData();

  return (
    <div className="page">
      <section id="page-header" className="page-section">
        <h2 className="section-heading">
          {/* Top-level Items */}
          {page.title == 'About' && <><span className="en">About</span><span className="zh-TW">關於我們</span></>}
          {page.title == 'Donation' && <><span className="en">Donation</span><span className="zh-TW">捐助支持</span></>}
          {page.title == 'Membership' && <><span className="en">Membership</span><span className="zh-TW">會員申請</span></>}
          {page.title == 'Resources' && <><span className="en">Resources</span><span className="zh-TW">相關資源</span></>}
          {page.title == 'Contact' && <><span className="en">Contact</span><span className="zh-TW">聯絡我們</span></>}

          {/* Second-level Items */}
          {/* About */}
          {page.title == 'History' && <><span className="en">History</span><span className="zh-TW">學會歷史</span></>}
          {page.title == 'Message from President' && <><span className="en">Message from President</span><span className="zh-TW">會長寄語</span></>}
          {page.title == 'Committee' && <><span className="en">Committee</span><span className="zh-TW">執委會</span></>}

          {/* Upcoming Events */}
          {page.title == 'Upcoming Events' && <><span className="en">Upcoming Events</span><span className="zh-TW">即將舉行活動</span></>}
          {page.title == 'Gallery' && <><span className="en">Gallery</span><span className="zh-TW">活動花絮</span></>}

          {/* Membership */}
          {page.title == 'Research Fund' && <><span className="en">Research Fund</span><span className="zh-TW">研究資助</span></>}
          {page.title == 'Sponsorship' && <><span className="en">Sponsorship</span><span className="zh-TW">贊助</span></>}

          {/* Resources */}
          {page.title == 'Health Information' && <><span className="en">Health Information</span><span className="zh-TW">健康資訊</span></>}
          {page.title == "Dietitian's Corner" && <><span className="en">Dietitian's Corner</span><span className="zh-TW">營養師專欄</span></>}
          {page.title == 'Exercise Tips' && <><span className="en">Exercise Tips</span><span className="zh-TW">運動小貼士</span></>}
          {page.title == 'Exposure' && <><span className="en">Exposure</span><span className="zh-TW">媒體報導</span></>}
          {page.title == 'EOSS Calculator' && <><span className="en">EOSS Calculator</span><span className="zh-TW">EOSS 計算機</span></>}
          
          {/* Else */}
          {![
            'About', 'Donation', 'Membership', 'Resources', 'Contact', 
            'History', 'Message from President', 'Committee', 
            'Upcoming Events', 'Gallery', 'Research Fund', 'Sponsorship', 
            'Health Information', "Dietitian's Corner", 'Exercise Tips', 
            'Exposure', 'EOSS Calculator', ''
          ].includes(page.title) && <span>{page.title}</span>}
        </h2>
        {/* <p>Page handle: {page.handle}</p> */}
        <article className="page-description" dangerouslySetInnerHTML={{__html: page.body}} />
      </section>
      <section className="page-main page-section">
        {page.handle == 'about' && 
          <></>
        }
        {page.handle == 'donation' && 
          <></>
        }
        {page.handle == 'membership' && 
          <></>
        }
        {page.handle == 'resources' && 
          <></>
        }

        {/* Contact Form */}
        {page.handle == 'contact' && 
          <>
            {/* Real API Endpoint: https://formsubmit.co/info@hkobesity.com */}
            {/* For testing: https://formsubmit.co/ccm.rex17@gmail.com */}
            <p>The following use email ccm.rex17@gmail.com for tesing: </p>
            <form id="contact-form" action="https://formsubmit.co/info@hkobesity.com" method="POST">
              {/* Form Fields */}
              <div className="row">
                <div className="field">
                  <label for="name">Name: </label>
                  <input type="text" id="name" name="Name" required></input>
                </div>
                <div className="field">
                  <label for="phone">Phone: </label>
                  <input type="tel" id="phone" name="Phone" required></input>
                </div>
              </div>
              <div className="row">
                <div className="field">
                  <label for="email">Email: </label>
                  <input type="email" id="email" name="Email" required></input>
                </div>
              </div>
              <div className="row">
                <div className="field">
                  <label for="content">Content: </label>
                  <textarea id="content" name="Content" rows="4" cols="53"></textarea>
                </div>
              </div>

              {/* Receiving Email Template */}
              <input type="hidden" name="_template" value="table"></input>

              {/* Submit Button */}
              <div className="row submit-row">
                <button type="submit" className="primary-button">Submit</button>
              </div>
            </form>
          </>
        }
      </section>
    </div>
  ); 
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('./+types/pages.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
