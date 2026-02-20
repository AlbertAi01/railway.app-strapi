import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  // Convert slug to title format
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} Recipe - Arknights: Endfield | Zero Sanity`,
    description: `Crafting recipe for ${title} in Arknights: Endfield. View required materials, crafting time, facility requirements, and production throughput.`,
    alternates: {
      canonical: `/factory-planner/recipes/${slug}`,
    },
    openGraph: {
      title: `${title} Recipe - Arknights: Endfield | Zero Sanity`,
      description: `Crafting recipe for ${title} in Arknights: Endfield. View required materials, crafting time, facility requirements, and production throughput.`,
      type: 'article',
      url: `https://www.zerosanity.app/factory-planner/recipes/${slug}`,
    },
  };
}

export default function RecipeDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
