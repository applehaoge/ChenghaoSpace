import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KidsCodingProvider } from '@/features/kidsCoding/providers/KidsCodingProvider';
import { HeroSection } from '@/features/kidsCoding/components/HeroSection';
import { FeaturesSection } from '@/features/kidsCoding/components/FeaturesSection';
import { LearningContent } from '@/features/kidsCoding/components/LearningContent';
import { ParentConcerns } from '@/features/kidsCoding/components/ParentConcerns';
import { PricingPlans } from '@/features/kidsCoding/components/PricingPlans';
import { DailyCheckin } from '@/features/kidsCoding/components/DailyCheckin';
import { Footer } from '@/features/kidsCoding/components/Footer';
import { Navbar } from '@/features/kidsCoding/components/Navbar';
import { AuthModal } from '@/features/kidsCoding/components/AuthModal';

export function KidsCodingPage() {
  return (
    <KidsCodingProvider>
      <KidsCodingLanding />
    </KidsCodingProvider>
  );
}

function KidsCodingLanding() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const handleOpenAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <Navbar onOpenAuthModal={handleOpenAuthModal} />
        <main>
          <HeroSection onOpenAuthModal={handleOpenAuthModal} />
          <FeaturesSection />
          <LearningContent />
          <ParentConcerns />
          <PricingPlans onOpenAuthModal={handleOpenAuthModal} />
          <DailyCheckin />
        </main>
        <Footer onOpenAuthModal={handleOpenAuthModal} />
        <div className="border-t border-slate-200/70 bg-white py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/80">
          <p>
            <span className="font-medium">橙浩编程</span> · 专注少儿编程的体验页
          </p>
          <p className="mt-1">
            <Link to="/" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              返回 AI 工作台
            </Link>
          </p>
        </div>
      </div>
      {showAuthModal ? (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onToggleMode={() => setAuthMode(prev => (prev === 'login' ? 'register' : 'login'))}
        />
      ) : null}
    </>
  );
}
