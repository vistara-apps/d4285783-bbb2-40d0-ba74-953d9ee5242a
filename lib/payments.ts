import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { PaymentDetails } from './types';

// USDC contract address on Base
export const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// USDC ABI (minimal for transfers)
export const USDC_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Create public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
});

// Payment service class
export class PaymentService {
  private walletClient: any;

  constructor(walletClient: any) {
    this.walletClient = walletClient;
  }

  // Get USDC balance for an address
  async getUSDCBalance(address: string): Promise<string> {
    try {
      const balance = await publicClient.readContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      });

      // USDC has 6 decimals
      return formatUnits(balance as bigint, 6);
    } catch (error) {
      console.error('Error getting USDC balance:', error);
      throw error;
    }
  }

  // Transfer USDC to another address
  async transferUSDC(
    to: string,
    amount: number,
    onSuccess?: (txHash: string) => void,
    onError?: (error: Error) => void
  ): Promise<string> {
    try {
      if (!this.walletClient) {
        throw new Error('Wallet not connected');
      }

      // Convert amount to USDC units (6 decimals)
      const amountInUnits = parseUnits(amount.toString(), 6);

      // Execute the transfer
      const txHash = await this.walletClient.writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [to as `0x${string}`, amountInUnits],
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (receipt.status === 'success') {
        onSuccess?.(txHash);
        return txHash;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error transferring USDC:', error);
      onError?.(error as Error);
      throw error;
    }
  }

  // Create payment details object
  createPaymentDetails(
    amount: number,
    status: 'pending' | 'completed' | 'failed' = 'pending',
    transactionHash?: string
  ): PaymentDetails {
    return {
      amount,
      currency: 'USDC',
      status,
      transactionHash,
    };
  }

  // Verify payment by checking transaction
  async verifyPayment(txHash: string, expectedAmount: number, expectedRecipient: string): Promise<boolean> {
    try {
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      if (receipt.status !== 'success') {
        return false;
      }

      // Parse transfer events to verify amount and recipient
      const transferEvent = receipt.logs.find(log => 
        log.address.toLowerCase() === USDC_CONTRACT_ADDRESS.toLowerCase() &&
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event signature
      );

      if (!transferEvent) {
        return false;
      }

      // Decode the transfer event (simplified)
      const recipient = `0x${transferEvent.topics[2]?.slice(26)}`;
      const amount = parseInt(transferEvent.data, 16);
      const expectedAmountInUnits = parseUnits(expectedAmount.toString(), 6);

      return (
        recipient.toLowerCase() === expectedRecipient.toLowerCase() &&
        BigInt(amount) >= expectedAmountInUnits
      );
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }
}

// Helper functions for payment processing
export const processPayment = async (
  walletClient: any,
  recipientAddress: string,
  amount: number,
  description: string
): Promise<PaymentDetails> => {
  const paymentService = new PaymentService(walletClient);
  
  try {
    const txHash = await paymentService.transferUSDC(recipientAddress, amount);
    
    return paymentService.createPaymentDetails(amount, 'completed', txHash);
  } catch (error) {
    console.error('Payment processing failed:', error);
    return paymentService.createPaymentDetails(amount, 'failed');
  }
};

// Format USDC amount for display
export const formatUSDC = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
};

// Validate USDC amount
export const validateUSDCAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 1000000 && Number.isFinite(amount);
};

// Get estimated gas fee for USDC transfer
export const getEstimatedGasFee = async (): Promise<string> => {
  try {
    const gasPrice = await publicClient.getGasPrice();
    const estimatedGas = 65000n; // Typical gas for USDC transfer
    const gasFeeWei = gasPrice * estimatedGas;
    
    // Convert to ETH
    return formatUnits(gasFeeWei, 18);
  } catch (error) {
    console.error('Error estimating gas fee:', error);
    return '0.001'; // Fallback estimate
  }
};
