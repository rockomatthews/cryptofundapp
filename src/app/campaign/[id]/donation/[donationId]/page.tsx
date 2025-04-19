import { Suspense } from 'react';
import DonationStatusClient from './client';

// Server component to handle the Promise-based params
interface PageProps {
  params: Promise<{ id: string; donationId: string }>;
}

export default async function DonationStatusPage({ params }: PageProps) {
  // Await and resolve the params
  const resolvedParams = await params;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DonationStatusClient params={resolvedParams} />
    </Suspense>
  );
} 