'use client';

import React, { useState, useEffect } from 'react';
import { ContractBuilder } from './contract-builder';
import { ActiveContractView } from './active-contract-view';
import { TraderContract } from '@/types/contract';
import { getActiveContract } from '@/app/actions/contract';
import { Loader2 } from 'lucide-react';

export function TraderContractTab() {
  const [contract, setContract] = useState<TraderContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenewing, setIsRenewing] = useState(false);

  const loadContract = async () => {
    setIsLoading(true);
    const res = await getActiveContract();
    if (res.success && res.contract) {
      setContract(res.contract);
      setIsRenewing(false);
    } else {
      setContract(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadContract();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
      </div>
    );
  }

  if (contract && !isRenewing) {
    return (
      <ActiveContractView 
        contract={contract} 
        onRenewContract={() => setIsRenewing(true)} 
      />
    );
  }

  return (
    <ContractBuilder 
      onContractSigned={loadContract} 
    />
  );
}
