import React from 'react';
import HeroSlider from '../components/HeroSlider'; // Import HeroSlider
import WhyChooseUs from '../components/WhyChooseUs';
import TrendingProducts from '../components/TrendingProducts';
import ExploreCategories from '../components/ExploreCategories';
import TrustedBrands from '../components/TrustedBrands';
import Quote from '../components/Quote';
import { useSettings } from '../contexts/SettingsContext';

const Home = () => {
    const { settings } = useSettings();

    return (
        <div className="flex flex-col min-h-screen">
            {settings.show_hero === '1' && <HeroSlider />}
            {settings.show_why_us === '1' && <WhyChooseUs />}
            <TrendingProducts />
            {settings.show_categories === '1' && <ExploreCategories />}
            {settings.show_brands === '1' && <TrustedBrands />}
            <Quote />
        </div>
    );
};

export default Home;
