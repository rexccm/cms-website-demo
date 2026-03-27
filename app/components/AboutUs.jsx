import {Image} from '@shopify/hydrogen';
import {Await, Link} from 'react-router';
import { useState, useEffect } from 'react';

/* About Us Section on Homepage */
export const AboutUs = ({aboutImage, shopSummary, shopSummaryZhTw, aims}) => { 
    const [active, setActive] = useState(0); 
    
    useEffect(() => {
        if (!aims || aims.length === 0) return;

        const interval = setInterval(() => {
            setActive((prev) => (prev + 1) % aims.length);
        }, 3000); 

        return () => clearInterval(interval); 
    }, [aims.length]); 

    return ( 
        <section id='about-us' className="page-section">
            <div className="section-header">
                <h2 className='section-heading'>
                    <span className='en'>About Us</span>
                    <span className='zh-TW'>關於我們</span>
                </h2>
                <Link className="learn-more" to="/pages/about">
                    <span className="en">Learn More</span>
                    <span className="zh-TW">了解更多</span>
                </Link>
            </div>
            <div className='row'>
                <figure>
                    {aboutImage && ( 
                        <Image 
                            data={aboutImage} 
                        />
                    )}
                </figure>
                <div id='about-main'>
                    <article id='summary' className='h6'>
                        <span className="en">{shopSummary}</span>
                        <span className="zh-TW">{shopSummaryZhTw}</span>
                    </article>
                    <ul id='aims'>
                    {aims.map((entry, index) => {
                        const getField = (key) => entry.fields.find(f => f.key === key)?.value;
                        const iconField = entry.fields.find(f => f.key === 'icon');
                        const iconData = iconField?.reference?.image;

                        return (
                        <li 
                            key={entry.id || index}
                            className={`aim row ${active === index ? 'active' : ''}`}
                        >
                            <img 
                                id='aim-icon' 
                                src={iconData?.url} 
                                alt={iconData?.altText || 'icon'} 
                            />
                            <article id='aim-content'>
                                <span className="en">{getField('aim_content')}</span>
                                <span className="zh-TW">{getField('aim_content_zh_tw')}</span>
                            </article>
                        </li>
                        );
                    })}
                    </ul>
                </div>
            </div>
        </section>
    ); 
}; 