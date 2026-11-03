import PageTransition from '../components/PageTransition.jsx';
import Reveal from '../components/Reveal.jsx';
import FaqSection from '../components/FaqSection.jsx';
import Hero from '../components/home/Hero.jsx';
import FeaturesBar from '../components/home/FeaturesBar.jsx';
import ShopByStyle from '../components/home/ShopByStyle.jsx';
import PromoBanner from '../components/home/PromoBanner.jsx';
import CustomerFavorites from '../components/home/CustomerFavorites.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import Newsletter from '../components/home/Newsletter.jsx';

export default function Home() {
  return (
    <PageTransition>
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
      <Reveal y={20}>
        <Newsletter />
      </Reveal>
    </PageTransition>
  );
}