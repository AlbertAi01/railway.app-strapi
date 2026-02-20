import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crafting Recipes - Zero Sanity',
  description: 'Complete crafting recipe database for Arknights: Endfield. Browse all manufacturing recipes, required materials, and production chains for factory optimization.',
  alternates: { canonical: '/recipes' },
  openGraph: {
    title: 'Crafting Recipes - Arknights: Endfield | Zero Sanity',
    description: 'Complete crafting recipe database for Arknights: Endfield. Browse all manufacturing recipes, required materials, and production chains for factory optimization.',
    url: 'https://www.zerosanity.app/recipes',
    type: 'website',
  },
};

export default function RecipesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
