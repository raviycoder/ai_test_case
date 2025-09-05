import { HeroHeader } from "./header";
import HeroSection from "./hero-section";
import FeatureSection from "./feature-section";
import TestimonialsSection from "./testimonials-section";
import PricingSection from "./pricing-section";
import CallToActionSection from "./call-to-action-section";
import FooterSection from "./footer-section";
import ContentSection from "./content-sectionn";

const LandingPage = () => {
    return (
        <div className="min-h-screen">
            <HeroHeader />
            <main>
                <HeroSection />
                <FeatureSection />
                <ContentSection />
                <TestimonialsSection />
                <PricingSection />
                <CallToActionSection />
            </main>
            <FooterSection />
        </div>
    );
}

export default LandingPage;