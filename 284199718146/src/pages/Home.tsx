import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import LearningContent from '../components/LearningContent';
import ParentConcerns from '../components/ParentConcerns';
import PricingPlans from '../components/PricingPlans';
import DailyCheckin from '../components/DailyCheckin';
import Footer from '../components/Footer';

interface HomeProps {
  openAuthModal: (mode: 'login' | 'register') => void;
}

export default function Home({ openAuthModal }: HomeProps) {
  return (
    <>
      <main>
        <HeroSection openAuthModal={openAuthModal} />
        <FeaturesSection />
        <LearningContent />
        <ParentConcerns />
        <PricingPlans openAuthModal={openAuthModal} />
        <DailyCheckin />
      </main>
      
      <Footer openAuthModal={openAuthModal} />
    </>
  );
}