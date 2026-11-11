import PageTransition from '../components/PageTransition.jsx';
import Reveal from '../components/Reveal.jsx';
import FaqSection from '../components/FaqSection.jsx';
import LocationSection from '../components/LocationSection.jsx';
import Hero from '../components/home/Hero.jsx';
import FeaturesBar from '../components/home/FeaturesBar.jsx';
import ShopByStyle from '../components/home/ShopByStyle.jsx';
import PromoBanner from '../components/home/PromoBanner.jsx';
import CustomerFavorites from '../components/home/CustomerFavorites.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import Newsletter from '../components/home/Newsletter.jsx';

// Where the map section goes on the home page:
//   'below-hero' = right under the slideshow (near the top)
//   'above-hero' = the very first thing on the page, before the slideshow
const MAP_POSITION = 'below-hero';

export default function Home() {
  return (
    <PageTransition>
      {MAP_POSITION === 'above-hero' && <LocationSection />}
      <Hero />
      <FeaturesBar />
     
      <ShopByStyle />
      <PromoBanner />
      <Reveal>
        <CustomerFavorites />
      </Reveal>
      <Reveal>
        <Testimonials />
      </Reveal>
      <Reveal>
        <FaqSection limit={6} hideWhenEmpty />
      </Reveal>
       {MAP_POSITION === 'below-hero' && <LocationSection />}
      <Reveal y={20}>
        <Newsletter />
      </Reveal>
      
    </PageTransition>
  );
}