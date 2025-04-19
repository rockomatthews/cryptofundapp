import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getExchangeStatus } from '@/lib/cryptoprocessing';

/**
 * Endpoint to check the status of a currency conversion
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { exchangeId: string } }
) {
  try {
    const { exchangeId } = params;
    
    if (!exchangeId) {
      return NextResponse.json(
        { error: 'Exchange ID is required' },
        { status: 400 }
      );
    }
    
    // Find the conversion record in the database
    const conversion = await prisma.currencyConversion.findUnique({
      where: { exchangeId },
      include: { donation: { include: { campaign: true } } },
    });
    
    if (!conversion) {
      return NextResponse.json(
        { error: 'Conversion not found' },
        { status: 404 }
      );
    }
    
    // Get the current status from the CryptoProcessing API
    const exchangeStatus = await getExchangeStatus(exchangeId);
    
    // Update the conversion record with the latest status
    const updatedConversion = await prisma.currencyConversion.update({
      where: { id: conversion.id },
      data: {
        status: mapStatus(exchangeStatus.status),
        fromAmount: exchangeStatus.fromAmount,
        toAmount: exchangeStatus.toAmount,
        txHash: exchangeStatus.transactionHash || conversion.txHash,
      },
    });
    
    // If the conversion is completed, update the campaign's raised amount
    if (updatedConversion.status === 'COMPLETED' && conversion.status !== 'COMPLETED') {
      await prisma.campaign.update({
        where: { id: conversion.donation.campaignId },
        data: {
          raisedAmount: {
            increment: parseFloat(exchangeStatus.toAmount),
          },
        },
      });
    }
    
    return NextResponse.json({ 
      status: updatedConversion.status,
      fromAmount: updatedConversion.fromAmount,
      toAmount: updatedConversion.toAmount,
      txHash: updatedConversion.txHash
    });
  } catch (error) {
    console.error('Error checking conversion status:', error);
    return NextResponse.json(
      { error: 'Failed to check conversion status' },
      { status: 500 }
    );
  }
}

/**
 * Map CryptoProcessing status to our internal status
 */
function mapStatus(cryptoProcessingStatus: string): string {
  const statusMap: Record<string, string> = {
    'created': 'PENDING',
    'processing': 'PROCESSING',
    'waiting_for_confirmation': 'PROCESSING',
    'exchanging': 'PROCESSING',
    'completed': 'COMPLETED',
    'failed': 'FAILED',
    'cancelled': 'FAILED'
  };
  
  return statusMap[cryptoProcessingStatus.toLowerCase()] || 'PENDING';
} 