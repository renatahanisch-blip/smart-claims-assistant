export enum ClaimStatus {
  NEW = 'NEW',
  ANALYZED = 'ANALYZED',
  DRAFTED = 'DRAFTED',
  RESOLVED = 'RESOLVED'
}

export enum Sentiment {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
  ANGRY = 'ANGRY'
}

export interface Policy {
  id: string;
  name: string; // z.B. "Privathaftpflicht", "Motorfahrzeug"
  company: string; // z.B. "AXA", "Mobiliar"
  number: string;
  coverageDetails: string; // Was ist gedeckt?
}

export interface FamilyMember {
  name: string;
  relation: string;
  inHousehold: boolean;
}

export interface CrmProfile {
  customerName: string;
  isVip: boolean;
  policies: Policy[];
  familyMembers: FamilyMember[];
  companyAffiliation?: {
    companyName: string;
    role: string;
    policies: Policy[]; // Firmenpolicen
  };
}

export interface InvolvedInsurer {
  name: string;
  reason: string;
}

export interface ClaimAnalysis {
  category: string;
  sentiment: Sentiment;
  urgencyScore: number; // 1-10
  keyFacts: string[];
  isCovered: boolean; // Deckung vorhanden?
  coverageReason: string; // Warum gedeckt oder abgelehnt?
  missingDocuments: string[]; // Fehlen Fotos, Belege?
  insurerName?: string; // Hauptversicherer (Legacy / Display)
  involvedInsurers?: InvolvedInsurer[]; // Liste aller involvierten Versicherer
  suggestedAction: string;
}

export interface Email {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  receivedDate: string;
  body: string;
}

export interface InsurerDraft {
  insurerName: string;
  body: string;
}

export interface Claim {
  id: string;
  email: Email;
  crmProfile: CrmProfile; // Verknüpfung zum CRM
  status: ClaimStatus;
  analysis?: ClaimAnalysis;
  draftResponseCustomer?: string;
  insurerDrafts?: InsurerDraft[]; // Array für mehrere Versicherer-Entwürfe
}