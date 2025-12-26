import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ClaimList } from './components/ClaimList';
import { ClaimDetail } from './components/ClaimDetail';
import { MOCK_CLAIMS } from './constants';
import { Claim } from './types';

const App: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>(MOCK_CLAIMS);
  const [selectedClaimId, setSelectedClaimId] = useState<string>(MOCK_CLAIMS[0].id);

  const selectedClaim = claims.find(c => c.id === selectedClaimId) || claims[0];

  const handleUpdateClaim = (id: string, updates: Partial<Claim>) => {
    setClaims(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-gray-900">
      <Sidebar />
      <div className="flex flex-1 overflow-hidden relative">
        <ClaimList 
          claims={claims} 
          selectedId={selectedClaimId} 
          onSelect={setSelectedClaimId} 
        />
        <ClaimDetail 
          claim={selectedClaim} 
          onUpdateClaim={handleUpdateClaim} 
        />
      </div>
    </div>
  );
};

export default App;