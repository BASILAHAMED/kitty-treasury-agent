export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  paypalEmail: string;
  sharePercentage?: number;
}

export interface GroupKitty {
  id: string;
  name: string;
  type: 'roommates' | 'trip' | 'office';
  balance: number;
  spendCap: number; // e.g. $50 per autonomous purchase
  currency: string;
  organizerEmail: string;
  members: Member[];
}

export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  assignedMemberIds: string[]; // member ids or empty if ambiguous
  isAmbiguous?: boolean;
  ambiguityReason?: string;
}

export interface ItemizedReceipt {
  id: string;
  merchantName: string;
  date: string;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  items: ReceiptItem[];
  currency: string;
  imageUrl?: string;
  rawVisionOutput?: string;
}

export type InvoiceStatus = 
  | 'DRAFT'
  | 'SENT'
  | 'PAID'
  | 'REMINDED_1'
  | 'REMINDED_2'
  | 'FLAGGED_ORGANIZER'
  | 'CANCELLED';

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  amount: number;
  subtotalShare: number;
  taxShare: number;
  tipShare: number;
  status: InvoiceStatus;
  paypalInvoiceId: string | null;
  paypalInvoiceUrl: string | null;
  remindersSent: number;
  maxRemindersReached: boolean;
  isFlaggedForOrganizer: boolean;
  createdAt: string;
  updatedAt: string;
  itemsBreakdown: {
    description: string;
    amount: number;
  }[];
  isSimulated?: boolean;
}

export type PurchaseStatus = 
  | 'COMPLETED'
  | 'PENDING_APPROVAL'
  | 'CANCELLED'
  | 'TOPUP_REQUIRED';

export interface PurchaseRecord {
  id: string;
  itemName: string;
  category: string;
  price: number;
  quantity: number;
  merchant: string;
  status: PurchaseStatus;
  paypalOrderId: string | null;
  spendCapExceeded: boolean;
  approvalReason?: string;
  purchasedAt: string;
  triggeredBy: 'PHOTO_EMPTY_SUPPLY' | 'RECURRING_RESTOCK' | 'CHAT_REQUEST';
  channel3ProductId?: string;
  imageUrl?: string;
  isSimulated?: boolean;
}

export interface Channel3Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  merchant: string;
  imageUrl: string;
  inStock: boolean;
  rating: number;
  category: string;
}

export type ReasoningStepType = 
  | 'thought' 
  | 'vision_analysis'
  | 'tool_call' 
  | 'tool_result' 
  | 'clarification_needed' 
  | 'spend_cap_block'
  | 'action_executed'
  | 'webhook_received';

export interface AgentReasoningStep {
  id: string;
  timestamp: string;
  flow: 'COLLECT' | 'SPEND' | 'REMINDER' | 'WEBHOOK';
  stepType: ReasoningStepType;
  title: string;
  detail: string;
  toolName?: string;
  toolArgs?: Record<string, any>;
  toolResult?: Record<string, any>;
  level: 'info' | 'tool' | 'decision' | 'warning' | 'success';
}

export interface ClarificationQuestion {
  id: string;
  itemId: string;
  itemDescription: string;
  question: string;
  suggestedMembers: string[];
  resolved: boolean;
  resolvedMemberIds?: string[];
}

export interface ConfigSettings {
  paypalClientId: string;
  paypalClientSecret: string;
  paypalMode: 'sandbox' | 'live';
  groqApiKey: string;
  channel3ApiKey: string;
  hasGeminiKey: boolean;
  isPayPalConfigured: boolean;
  isGroqConfigured: boolean;
  isChannel3Configured: boolean;
}
