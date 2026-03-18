import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Play } from "lucide-react";
import { getBanners } from "../services/api";
import { getImageUrl } from "../lib/utils";

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const defaultSlides = [
    {
        id: 'default-1',
        title: "Premium Quality - Curated Selection",
        subtitle: "High-performance products curated for your modern lifestyle and needs.",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2099&auto=format&fit=crop",
        buttons: [
            { text: "Shop Catalog", link: "/products", variant: "default" },
            { text: "Learn More", link: "/about", variant: "outline" },
        ]
    },
    {
        id: 'default-2',
        title: "Modern Style - Superior Craft",
        subtitle: "Experience the perfect blend of aesthetic design and robust performance.",
        imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=2080&auto=format&fit=crop",
        buttons: [
            { text: "Explore Collection", link: "/products", variant: "default" }
        ]
    }
];

const HeroSlider = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await getBanners();
                const activeBanners = response.data.filter(b => b.is_active == 1);

                if (activeBanners.length > 0) {
                    const formattedSlides = activeBanners.map(banner => ({
                        id: banner.id,
                        title: banner.title,
                        subtitle: banner.subtitle || "The definitive standard in professional industrial equipment and technical support.",
                        imageUrl: getImageUrl(banner.image_url),

                        buttons: [
                            { text: "Access Catalog", link: banner.link || "/products", variant: "default" },
                            { text: "Expert Support", link: "/contact", variant: "outline" },
                        ]
                    }));
                    setSlides(formattedSlides);
                } else {
                    setSlides(defaultSlides);
                }
            } catch (err) {
                setSlides(defaultSlides);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 7000,
        arrows: false,
        fade: true,
        pauseOnHover: false,
        customPaging: i => (
            <div className="w-10 h-[2px] bg-white/40 transition-all hover:bg-white/80"></div>
        )
    };

    if (loading) return <div className="h-[70vh] w-full bg-white flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <section className="full-width h-[70vh] md:h-[75vh] overflow-hidden bg-white">
            <Slider {...settings} className="h-full w-full hero-slider-custom">
                {slides.map((slide) => (
                    <div key={slide.id} className="h-[70vh] md:h-[75vh] outline-none border-none relative">
                        <div
                            className="w-full h-full bg-cover bg-center transition-transform [transition-duration:7000ms] scale-100 hover:scale-110"
                            style={{ backgroundImage: `url(${slide.imageUrl})` }}
                        >
                            <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/40 to-transparent flex items-center">
                                <div className="container-custom w-full">
                                    <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-left-12 duration-1000">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1 w-12 bg-primary rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
                                                <p className="text-primary text-xs font-bold tracking-wide">Featured Collection</p>
                                            </div>
                                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                                                {slide.title.includes('-') ? (
                                                    slide.title.split('-').map((part, i) => (
                                                        <span key={i} className={i === 1 ? "text-primary block mt-1" : "block"}>
                                                            {part.trim()}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="block">{slide.title}</span>
                                                )}
                                            </h1>
                                        </div>
                                        <p className="max-w-lg text-base md:text-xl text-slate-200 font-medium leading-relaxed drop-shadow-lg">
                                            {slide.subtitle}
                                        </p>
                                        <div className="flex flex-col gap-4 pt-8 sm:flex-row">
                                            {slide.buttons.map((button, index) => (
                                                <Button key={index} asChild className={button.variant === 'default' ? "btn-primary-sleek h-10 px-4" : "btn-outline-sleek border-white/20 text-white hover:border-white h-10 px-4 backdrop-blur-md"}>
                                                    <Link to={button.link} className="flex items-center gap-2 text-sm font-semibold">
                                                        {button.text}
                                                        {button.variant === 'default' ? <ArrowRight className="h-5 w-5" /> : <Play className="h-4 w-4" />}
                                                    </Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </section>
    );
};

export default HeroSlider;
