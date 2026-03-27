import Slider from "react-slick"; 
import heroLogo from '~/assets/hero-logo.png'; 
import {Await, Link} from 'react-router';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 

export const HeroCarousel = ({heroSlides}) => { 
    var settings = { 
        dots: true, 
        infinite: true, 
        speed: 500, 
        slidesToShow: 1, 
        slidesToScroll: 1, 
        fade: true, 
        autoplay: true, 
        autoplaySpeed: 4000, 
        pauseOnHover: false, 
    };

    return ( 
        <section id="hero-carousel" className="page-section">
            {/* For SEO */}
            <h2 className="hidden">Hero Carousel</h2>

            {/* Slide List */}
            <Slider className="slide-list" {...settings}>
                {heroSlides.map((heroSlide, index) => {
                    const getField = (key) => heroSlide.fields.find(f => f.key === key)?.value; 
                    const bannerField = heroSlide.fields.find(f => f.key === 'banner'); 
                    const bannerData = bannerField?.reference?.image; 
                    
                    return (
                        <a className="slide" key={index} href={getField("url")}>
                            <h3 className="slide-title">{getField('title')}</h3>
                            <img className="banner" src={bannerData?.url} alt={bannerData.alt} />
                        </a>
                    ); 
                })}
            </Slider>
            <img id="hero-logo" src={heroLogo} />
        </section>
    ); 
}; 