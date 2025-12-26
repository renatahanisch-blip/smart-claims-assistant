import React, { useState, useEffect } from 'react';
import { Claim, ClaimStatus, InsurerDraft } from '../types';
import { analyzeClaimEmail, generateResponseDrafts } from '../services/geminiService';
import { 
  Sparkles, Send, User, FileText, AlertTriangle, 
  ThumbsUp, ThumbsDown, Meh, RefreshCw, 
  Loader2, ShieldCheck, ShieldX, Building2
} from 'lucide-react';

interface ClaimDetailProps {
  claim: Claim;
  onUpdateClaim: (id: string, updates: Partial<Claim>) => void;
}

export const ClaimDetail: React.FC<ClaimDetailProps> = ({ claim, onUpdateClaim }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  
  const [customerDraft, setCustomerDraft] = useState(claim.draftResponseCustomer || '');
  const [insurerDrafts, setInsurerDrafts] = useState<InsurerDraft[]>(claim.insurerDrafts || []);
  
  // 'customer' or index of insurer draft (0, 1, 2...)
  const [activeTab, setActiveTab] = useState<string>('customer');

  // Reset local state when claim changes
  useEffect(() => {
    setCustomerDraft(claim.draftResponseCustomer || '');
    setInsurerDrafts(claim.insurerDrafts || []);
    setActiveTab('customer');
  }, [claim.id, claim.draftResponseCustomer, claim.insurerDrafts]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeClaimEmail(claim.email.body, claim.crmProfile);
      onUpdateClaim(claim.id, { 
        status: ClaimStatus.ANALYZED, 
        analysis 
      });
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Analyse fehlgeschlagen.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDraft = async () => {
    if (!claim.analysis) return;
    setIsDrafting(true);
    try {
      const drafts = await generateResponseDrafts(claim.email.body, claim.analysis, claim.crmProfile);
      setCustomerDraft(drafts.customerDraft);
      setInsurerDrafts(drafts.insurerDrafts);
      
      onUpdateClaim(claim.id, { 
        status: ClaimStatus.DRAFTED, 
        draftResponseCustomer: drafts.customerDraft,
        insurerDrafts: drafts.insurerDrafts
      });
      
    } catch (error) {
      console.error("Drafting failed", error);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleUpdateInsurerDraft = (index: number, newBody: string) => {
    const newDrafts = [...insurerDrafts];
    newDrafts[index] = { ...newDrafts[index], body: newBody };
    setInsurerDrafts(newDrafts);
  };

  const handleSend = () => {
    onUpdateClaim(claim.id, { 
      status: ClaimStatus.RESOLVED,
      draftResponseCustomer: customerDraft,
      insurerDrafts: insurerDrafts
    });
    
    let msg = `E-Mails wurden versendet!\n\n1. An Kunde: ${claim.email.fromEmail}`;
    insurerDrafts.forEach((draft, idx) => {
      msg += `\n${idx + 2}. An Versicherer: ${draft.insurerName}`;
    });
    alert(msg);
  };

  const activeInsurerIndex = activeTab.startsWith('insurer-') ? parseInt(activeTab.split('-')[1]) : -1;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-gray-400 font-normal">#{claim.id}</span>
            {claim.email.subject}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {claim.crmProfile.customerName}</span>
            <span>•</span>
            <span>{new Date(claim.email.receivedDate).toLocaleString('de-CH')}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           {claim.status === ClaimStatus.RESOLVED ? (
             <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
               <Send className="w-4 h-4" /> Abgeschlossen
             </span>
           ) : (
             <div className="text-xs text-indigo-500 uppercase font-bold tracking-wider flex items-center gap-1">
               <Sparkles className="w-3 h-3" /> REMAlino Agent
             </div>
           )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-[1600px] mx-auto h-full">
          
          {/* Left Column: Email + CRM + Analysis */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2">
            
            {/* Original Email */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Nachricht vom Kunden
              </h3>
              <div className="text-base text-gray-800 whitespace-pre-wrap font-sans leading-loose pl-1">
                {claim.email.body}
              </div>
            </div>

            {/* CRM & Analysis Combined */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                 <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> CRM & Analyse
                </h3>
                {!claim.analysis && (
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Portfolio prüfen
                  </button>
                )}
              </div>
              
              <div className="p-6">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm">REMAlino prüft das Portfolio und analysiert den Fall...</p>
                  </div>
                ) : claim.analysis ? (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    
                    {/* Coverage Status Result */}
                    <div className={`p-4 rounded-lg border flex items-start gap-4 ${
                      claim.analysis.isCovered ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      {claim.analysis.isCovered ? (
                        <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
                      ) : (
                        <ShieldX className="w-6 h-6 text-red-600 shrink-0" />
                      )}
                      <div>
                        <h4 className={`font-bold ${claim.analysis.isCovered ? 'text-green-800' : 'text-red-800'}`}>
                          {claim.analysis.isCovered ? 'Deckung wahrscheinlich' : 'Keine Deckung gefunden'}
                        </h4>
                        <p className="text-sm text-gray-700 mt-1">{claim.analysis.coverageReason}</p>
                        
                        {/* Display Involved Insurers */}
                        {claim.analysis.involvedInsurers && claim.analysis.involvedInsurers.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                             {claim.analysis.involvedInsurers.map((ins, i) => (
                               <div key={i} className="text-xs font-semibold bg-white/60 px-2 py-1 rounded text-green-900 border border-green-200 flex flex-col">
                                 <span>{ins.name}</span>
                                 <span className="font-normal opacity-75 text-[10px]">{ins.reason}</span>
                               </div>
                             ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Policies (CRM Data) */}
                    <div>
                      <span className="text-xs text-gray-500 block mb-2 font-semibold">Aktives Portfolio (CRM)</span>
                      <div className="space-y-2">
                        {claim.crmProfile.policies.map(p => (
                          <div key={p.id} className="text-xs bg-slate-50 p-2 rounded border border-slate-100 flex justify-between">
                            <span className="font-medium text-slate-700">{p.name} ({p.company})</span>
                            <span className="text-slate-500">{p.number}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Missing Docs */}
                    {claim.analysis.missingDocuments.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                        <span className="text-xs text-amber-800 font-bold block mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Fehlende Unterlagen
                        </span>
                        <ul className="list-disc list-inside text-xs text-amber-900">
                          {claim.analysis.missingDocuments.map((doc, i) => <li key={i}>{doc}</li>)}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Kategorie</span>
                        <span className="text-sm font-medium">{claim.analysis.category}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Dringlichkeit</span>
                        <div className="flex items-center gap-2">
                           <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                             <div className={`h-full ${claim.analysis.urgencyScore > 7 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${claim.analysis.urgencyScore * 10}%` }} />
                           </div>
                           <span className="font-bold text-xs">{claim.analysis.urgencyScore}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 opacity-50">
                    <ShieldCheck className="w-12 h-12 mb-2" />
                    <p className="text-sm">Klicken Sie oben auf "Portfolio prüfen"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Broker Response Action */}
          <div className="flex flex-col h-full">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 flex-1 flex flex-col overflow-hidden h-full ring-1 ring-slate-900/5">
              
              {/* Toolbar with Dynamic Tabs */}
              <div className="p-2 border-b border-gray-200 bg-white flex justify-between items-center z-10">
                 <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-[70%] no-scrollbar">
                   {/* Customer Tab */}
                   <button 
                     onClick={() => setActiveTab('customer')}
                     className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'customer' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                   >
                     <User className="w-3 h-3" /> Kunde
                   </button>
                   
                   {/* Dynamic Insurer Tabs */}
                   {insurerDrafts.map((draft, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveTab(`insurer-${idx}`)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === `insurer-${idx}` ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Building2 className="w-3 h-3" /> {draft.insurerName.split(' ')[0]} {/* Show partial name for space */}
                      </button>
                   ))}
                 </div>

                {claim.analysis && !customerDraft && (
                   <button 
                     onClick={handleDraft}
                     disabled={isDrafting}
                     className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700 disabled:opacity-50 transition-all flex items-center gap-2"
                   >
                     {isDrafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                     Entwürfe generieren
                   </button>
                )}
              </div>
              
              {/* Text Area Container */}
              <div className="flex-1 bg-gray-50 relative group">
                {isDrafting ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20 backdrop-blur-sm">
                    <div className="text-center">
                       <Loader2 className="w-8 h-8 animate-spin text-gray-800 mx-auto mb-2" />
                       <p className="text-sm text-gray-600">REMAlino generiert Korrespondenz...</p>
                    </div>
                  </div>
                ) : null}

                {!customerDraft && !isDrafting ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                     <FileText className="w-12 h-12 mb-3 opacity-20" />
                     <p className="text-sm">Bitte erst analysieren, dann Entwürfe generieren.</p>
                  </div>
                ) : (
                  <>
                    {/* Customer Textarea */}
                    <div className={`w-full h-full ${activeTab !== 'customer' ? 'hidden' : ''}`}>
                       <textarea
                        className="w-full h-full p-6 bg-white text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-serif text-lg leading-relaxed"
                        value={customerDraft}
                        onChange={(e) => setCustomerDraft(e.target.value)}
                        placeholder="Entwurf für den Kunden..."
                        disabled={claim.status === ClaimStatus.RESOLVED}
                      />
                    </div>
                    
                    {/* Insurer Textareas (Mapped) */}
                    {insurerDrafts.map((draft, idx) => (
                      <div key={idx} className={`w-full h-full flex flex-col ${activeTab !== `insurer-${idx}` ? 'hidden' : ''}`}>
                         <div className="bg-indigo-50 px-4 py-2 text-xs text-indigo-800 border-b border-indigo-100 flex justify-between">
                            <span className="font-semibold">Empfänger: {draft.insurerName}</span>
                         </div>
                         <textarea
                            className="flex-1 w-full p-6 bg-white text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-serif text-lg leading-relaxed"
                            value={draft.body}
                            onChange={(e) => handleUpdateInsurerDraft(idx, e.target.value)}
                            placeholder={`Meldung an ${draft.insurerName}...`}
                            disabled={claim.status === ClaimStatus.RESOLVED}
                          />
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Footer Actions */}
              {customerDraft && claim.status !== ClaimStatus.RESOLVED && (
                <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center">
                  <span className="text-xs text-gray-500 italic hidden md:block">
                     {activeTab === 'customer' 
                        ? 'Ansicht: E-Mail an Kunde' 
                        : `Ansicht: E-Mail an ${insurerDrafts[activeInsurerIndex]?.insurerName}`
                     }
                  </span>
                  <div className="flex gap-2 w-full md:w-auto justify-end">
                     <button 
                       onClick={handleDraft}
                       className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                     >
                       Neu generieren
                     </button>
                     <button 
                       onClick={handleSend}
                       className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2"
                     >
                       <Send className="w-4 h-4" /> 
                       Alle senden ({1 + insurerDrafts.length})
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};