import React from 'react';
import { Claim, ClaimStatus } from '../types';
import { Mail, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface ClaimListProps {
  claims: Claim[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ClaimList: React.FC<ClaimListProps> = ({ claims, selectedId, onSelect }) => {
  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="font-semibold text-gray-700">Schadenmeldungen</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {claims.filter(c => c.status === ClaimStatus.NEW).length} Neu
        </span>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {claims.map((claim) => (
          <div
            key={claim.id}
            onClick={() => onSelect(claim.id)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedId === claim.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-gray-900 truncate pr-2">{claim.email.fromName}</span>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(claim.email.receivedDate).toLocaleDateString('de-CH')}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-800 mb-1 truncate">
              {claim.email.subject}
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">
              {claim.email.body}
            </p>
            
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge status={claim.status} />
              {claim.analysis && (
                <span className={`text-xs px-2 py-0.5 rounded border ${
                  claim.analysis.urgencyScore >= 8 
                    ? 'border-red-200 text-red-700 bg-red-50' 
                    : 'border-gray-200 text-gray-600 bg-gray-50'
                }`}>
                  Prio: {claim.analysis.urgencyScore}/10
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: ClaimStatus }> = ({ status }) => {
  switch (status) {
    case ClaimStatus.NEW:
      return <span className="flex items-center text-xs text-blue-600"><AlertCircle className="w-3 h-3 mr-1" /> Neu</span>;
    case ClaimStatus.ANALYZED:
      return <span className="flex items-center text-xs text-amber-600"><Clock className="w-3 h-3 mr-1" /> Analysiert</span>;
    case ClaimStatus.DRAFTED:
      return <span className="flex items-center text-xs text-purple-600"><Mail className="w-3 h-3 mr-1" /> Entwurf</span>;
    case ClaimStatus.RESOLVED:
      return <span className="flex items-center text-xs text-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Gesendet</span>;
    default:
      return null;
  }
};