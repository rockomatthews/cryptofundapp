import { Suspense } from 'react';
import CampaignClient from './client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignPage({ params }: PageProps) {
  // Await and resolve the params
  const resolvedParams = await params;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CampaignClient params={resolvedParams} />
    </Suspense>
  );
} 