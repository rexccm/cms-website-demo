import {Image} from '@shopify/hydrogen';
import {RichText} from '@shopify/hydrogen'; 
import {Await, Link} from 'react-router';
import useMediaQuery from './useMediaQuery';
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

/* Events Section on Homepage */
export const Events = ({eventList}) => { 
    /* Carousel responsive */
    const isDesktop = useMediaQuery('(min-width: 769px)'); 
    let slides = 2; 

    if(isDesktop) {
        /* Desktop */
        slides = 2; 
    } else { 
        /* Tablet and Mobile */
        slides = 1; 
    }

    var settings = {
        dots: true,
        infinite: true,
        slidesToShow: slides,
        slidesToScroll: 1,
        autoplay: true,
        speed: 500,
        autoplaySpeed: 4000, 
    }; 

    return (
        <section id="events" className="page-section">
            <div className="section-header">
                <h2 className='section-heading'>
                    <span className="en">Events</span>
                    <span className="zh-TW">活動</span>
                </h2>
                <Link className="learn-more" to="/blogs/events">
                    <span className="en">Learn More</span>
                    <span className="zh-TW">了解更多</span>
                </Link>
            </div>
            <Slider {...settings} className="event-list">
                {eventList.map((article, index) => (
                    <div className="event">
                        <div className="row">
                            {article.image && (
                                <img 
                                    src={article.image.url} 
                                    alt={article.image.altText || article.title} 
                                />
                            )}
                            <div className="article-main">
                                <h3 className="article-title">
                                    <span className="en">{article.title}</span>
                                    <span className="zh-TW">{article.title_zh_tw? article.title_zh_tw.value : article.title}</span>
                                </h3>
                                <article className="article-summary">
                                    <span className="en">{getPlainText(article.contentHtml).substring(0, 80) + '...'}</span>
                                    <span className="zh-TW">
                                        {article.content_zh_tw? getPlainText(article.content_zh_tw?.value).substring(0, 40): getPlainText(article.contentHtml).substring(0, 80)}{'...'}
                                    </span>
                                </article>
                                <Link className="read-more" to={"/blogs/events/" + article.handle}>
                                    <span className="en">Read More</span>
                                    <span className="zh-TW">閱讀更多</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                    )
                )}
            </Slider>
        </section>
    );
}; 