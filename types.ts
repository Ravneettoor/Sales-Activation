export interface DealSupportRequest {
  // General Info
  salesManager: string;
  businessSegment: string; // TBS or ENT
  province: string;
  requestType: string; // Acquisition, Renewal, Other
  fulfillmentType: string; // Direct, Dealer, WSS

  // Contract Details
  contractType: string; // CCA, Amendment
  termMonths: number;
  contractLanguage: string;
  minCommitment: number;
  
  // Strategy & Intel (The "Request Detail" Checklist)
  strategyWin: string; // Strategy to win / Compelling reason
  customerPainPoints: string;
  currentTLCs: string; // Termination Liability Charges
  clientValue: string; // What does client value
  crossSellOps: string; // Existing services / Cross-sell
  decisionMakerPersona: string; // Who are you speaking to
  roamingProfile: string;
  offerToWin: string; // What offer is required
  dataUsage: string;
  hardwarePlans: string; // Refresh, BYOD, Upgrade
  competitiveIntel: string;

  transcript?: string;
}

export const INITIAL_DEAL_REQUEST: DealSupportRequest = {
  salesManager: '',
  businessSegment: 'TBS',
  province: '',
  requestType: 'Acquisition',
  fulfillmentType: 'Direct Fulfill',
  contractType: 'CCA',
  termMonths: 36,
  contractLanguage: 'English',
  minCommitment: 50,
  strategyWin: '',
  customerPainPoints: '',
  currentTLCs: '',
  clientValue: '',
  crossSellOps: '',
  decisionMakerPersona: '',
  roamingProfile: '',
  offerToWin: '',
  dataUsage: '',
  hardwarePlans: '',
  competitiveIntel: '',
  transcript: ''
};

export const PROVINCES = [
  "BC", "AB", "SK", "MB", "ON", "QC", "NB", "NS", "PE", "NL"
];

export const REQUEST_TYPES = [
  "Acquisition",
  "Renewal & Growth",
  "Other"
];

export const FULFILLMENT_TYPES = [
  "Direct Fulfill",
  "Dealer Fulfill",
  "WSS Fulfill"
];

export const BUSINESS_SEGMENTS = [
  { id: 'TBS', label: 'TBS', sub: '100-500 Subs' },
  { id: 'ENT', label: 'ENT', sub: '500+ Subs' }
];

// --- Dashboard & Scanner Types ---

export enum Sentiment {
  Positive = 'Positive',
  Neutral = 'Neutral',
  Negative = 'Negative',
  Frustrated = 'Frustrated'
}

export enum Topic {
  Pricing = 'Pricing',
  Coverage = 'Coverage',
  Product = 'Product',
  Process = 'Process',
  Other = 'Other'
}

export enum Urgency {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export interface FeedbackEntry {
  id: string;
  text: string;
  source: string;
  timestamp: number;
  topic: Topic;
  sentiment: Sentiment;
  category: string;
  urgency: Urgency;
}

// --- Activation Form Types ---

export interface ActivationRequest {
  projectName: string;
  strategyTrigger: string[];
  targetAudience: string[];
  launchDate: string;
  kpiCurrent: string;
  kpiGoal: string;
  pillars: string[];
  specialRequirements: string;
  transcript?: string;
}

export const TRIGGERS = [
  "New Product Launch",
  "Quarterly Promotion",
  "Competitive Response",
  "Network Upgrade",
  "Seasonality"
];

export const AUDIENCES = [
  "Consumer",
  "Small Business",
  "Enterprise",
  "Existing Customers",
  "New Acquisition"
];

export const PILLARS = [
  { id: 'awareness', label: 'Awareness', sub: 'Marketing & Comms', icon: 'Megaphone' },
  { id: 'enablement', label: 'Enablement', sub: 'Training & Tools', icon: 'GraduationCap' },
  { id: 'incentive', label: 'Incentive', sub: 'Compensation & Spiffs', icon: 'FileText' }
];