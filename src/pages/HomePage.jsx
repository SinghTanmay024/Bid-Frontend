import HeroBanner from '../components/home/HeroBanner';
import StatsBar from '../components/home/StatsBar';
import MarketingStrip from '../components/home/MarketingStrip';
import ProductGrid from '../components/home/ProductGrid';
import HowItWorks from '../components/home/HowItWorks';
import WinnersSection from '../components/home/WinnersSection';
import TrustSection from '../components/home/TrustSection';
import CTABanner from '../components/home/CTABanner';

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <StatsBar />
      <MarketingStrip />
      <ProductGrid />
      <HowItWorks />
      <WinnersSection />
      <TrustSection />
      <CTABanner />
    </>
  );
}
