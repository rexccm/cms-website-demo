import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import footerLogo from '~/assets/footer-logo-white.png'; 

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="footer">
            {footer?.menu && header.shop.primaryDomain?.url && (
              <FooterMenu
                menu={footer.menu}
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
              />
            )}
            <p id="copyright" className="row">
              <span id="latest-updated-year">© {new Date().getFullYear()}</span> <span className="en"> Hong Kong Obesity Society. All rights reserved.</span><span className="zh-TW"> 香港肥胖學會 版權所有</span>
            </p>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  return (
    <nav className="row">
      {/* Homepage */}
      <NavLink id="footer-logo" prefetch="intent" to="/" end>
        <img src={footerLogo} alt="Logo" />
      </NavLink>
      
      {/* Menu Items */}
      <nav className="footer-menu" role="navigation">
        {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
          if (!item.url) return null;
          
          /* Parent URL */
          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname
              : item.url;
          const isExternal = !url.startsWith('/');
          
          return (
            <div key={item.id} className="footer-item-group">
              {isExternal ? (
                <a href={url} rel="noopener noreferrer" target="_blank">
                  {item.title}
                  
                </a>
              ) : (
                <NavLink className="menu-item" end prefetch="intent" to={url}>
                  {/* Switch */}
                  {item.title === 'About' && <><span className="en">About</span><span className="zh-TW">關於我們</span></>}
                  {item.title === 'Donation' && <><span className="en">Donation</span><span className="zh-TW">捐助支持</span></>}
                  {item.title === 'Events' && <><span className="en">Events</span><span className="zh-TW">活動資訊</span></>}
                  {item.title === 'Membership' && <><span className="en">Membership</span><span className="zh-TW">會員申請</span></>}
                  {item.title === 'Resources' && <><span className="en">Resources</span><span className="zh-TW">相關資源</span></>}
                  {item.title === 'Contact' && <><span className="en">Contact</span><span className="zh-TW">聯絡我們</span></>}
                  {/* Else */}
                  {!['About', 'Donation', 'Events', 'Membership', 'Resources', 'Contact'].includes(item.title) && item.title}
                </NavLink>
              )}

              {/* Child menu items */}
              {item.items && item.items.length > 0 && (
                <div className="sub-menu">
                  {item.items.map((subItem) => {
                    /* Chilld URL */
                    const subUrl =
                      subItem.url.includes('myshopify.com') ||
                      subItem.url.includes(publicStoreDomain) ||
                      subItem.url.includes(primaryDomainUrl)
                        ? new URL(subItem.url).pathname
                        : subItem.url;
                    
                    const isSubExternal = !subUrl.startsWith('/');
                    
                    return isSubExternal ? (
                      <a key={subItem.id} href={subUrl} rel="noopener noreferrer" target="_blank">
                        {subItem.title}
                      </a>
                    ) : (
                      <NavLink
                        key={subItem.id}
                        className="sub-menu-item" 
                        end
                        prefetch="intent"
                        to={subUrl}
                      >
                        {/* subItem.title */}

                        {/* Switch */}
                        {subItem.title === 'History' && <><span className="en">History</span><span className="zh-TW">學會歷史</span></>}
                        {subItem.title === 'Message from President' && <><span className="en">Message from President</span><span className="zh-TW">會長寄語</span></>}
                        {subItem.title === 'Committee' && <><span className="en">Committee</span><span className="zh-TW">執委會</span></>}
                        {subItem.title === 'Upcoming Events' && <><span className="en">Upcoming Events</span><span className="zh-TW">即將舉行活動</span></>}
                        {subItem.title === 'Gallery' && <><span className="en">Gallery</span><span className="zh-TW">活動花絮</span></>}
                        {subItem.title === 'Research Fund' && <><span className="en">Research Fund</span><span className="zh-TW">研究資助</span></>}
                        {subItem.title === 'Sponsorship' && <><span className="en">Sponsorship</span><span className="zh-TW">贊助</span></>}
                        {subItem.title === 'Health Information' && <><span className="en">Health Information</span><span className="zh-TW">健康資訊</span></>}
                        {subItem.title === "Dietitian's Corner" && <><span className="en">Dietitian's Corner</span><span className="zh-TW">營養師專欄</span></>}
                        {subItem.title === 'Exercise Tips' && <><span className="en">Exercise Tips</span><span className="zh-TW">運動小貼士</span></>}
                        {subItem.title === 'Exposure' && <><span className="en">Exposure</span><span className="zh-TW">媒體報導</span></>}
                        {subItem.title === 'EOSS Calculator' && <><span className="en">EOSS Calculator</span><span className="zh-TW">EOSS 計算機</span></>}

                        {/* Else */}
                        {!['History', 'Message from President', 'Committee', 'Upcoming Events', 'Gallery', 'Research Fund', 'Sponsorship', 'Health Information', "Dietitian's Corner", 'Exercise Tips', 'Exposure', 'EOSS Calculator'].includes(subItem.title) && subItem.title}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </nav>
  );
}


const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
