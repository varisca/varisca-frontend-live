import { HeroBanner } from '@/components/home/HeroBanner';
import { TrendingProducts } from '@/components/home/TrendingProducts';
import { CollectionBanner } from '@/components/home/CollectionBanner';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { RecentlyViewed } from '@/components/home/RecentlyViewed';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';

const Index = () => {
  return (
    <main>
      <HeroBanner />
      <TrendingProducts />
      <CollectionBanner />
      <RecentlyViewed />
      <FeaturesSection />
      <NewsletterSignup />
    </main>
  );
};

export default Index;

