export type UserRole = "creator" | "reviewer" | "brand_manager";

export type KnowledgeCategory =
  | "Brand Guidelines"
  | "Approved Facts & Claims"
  | "Approved Assets"
  | "Confidential Documents";

export interface ClarificationDraft {
  diagnosis: string;
  suggestedClarification: string;
  proposedVersion: string;
  exampleDo: string;
  exampleDont: string;
}

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  title: string;
  version: string;
  lastUpdated: string;
  expiryDate?: string;
  restricted?: boolean;
  tags: string[];
  content: string;
  rejectionCount?: number;
  overrideCount?: number;
  clarificationDraft?: ClarificationDraft;
}

export type ContentFormat =
  | "social_post"
  | "blog_article"
  | "email_copy"
  | "ad_copy"
  | "image_banner";

export type AuthorType = "Employee" | "Agency" | "AI-Generated";

export type WorkflowStatus =
  | "Draft"
  | "AI Reviewed"
  | "In Review"
  | "Changes Requested"
  | "Approved"
  | "Published";

export type RoutingTier =
  | "Light-Touch Review"
  | "Full Review"
  | "Brand Manager Escalation";

export type FindingCategory =
  | "Tone & Voice"
  | "Terminology"
  | "Messaging Inconsistency"
  | "Unsupported Claim"
  | "Outdated Information"
  | "Visual Consistency"
  | "Accessibility"
  | "Confidential Leakage";

export type Severity = "critical" | "major" | "minor";

export type FindingActionStatus =
  | "pending"
  | "accepted"
  | "edited"
  | "rejected"
  | "overridden";

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: Severity;
  flaggedTextOrRegion: string;
  explanation: string;
  sourceId: string;
  sourceName: string;
  sourceVersion: string;
  quotedRule: string;
  confidence: number;
  suggestedRewrite: string;
  isLegalSensitive: boolean;
  isUnverifiedClaim: boolean;
  actionStatus: FindingActionStatus;
  appliedText?: string;
  rejectionReason?: string;
  overrideComment?: string;
  overriddenBy?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorRole: UserRole;
  actorName: string;
  action: string;
  details: string;
}

export interface CommentItem {
  id: string;
  timestamp: string;
  authorRole: UserRole;
  authorName: string;
  text: string;
}

export interface ContentSubmission {
  id: string;
  title: string;
  format: ContentFormat;
  channel: string;
  targetAudience: string;
  authorType: AuthorType;
  team: string;
  intendedPurpose: string;
  originalText: string;
  currentText: string;
  altText: string;
  imageUrl?: string;
  status: WorkflowStatus;
  routingTier: RoutingTier;
  initialScore?: number;
  currentScore?: number;
  summary?: string;
  needsHumanReview?: boolean;
  escalationReason?: string;
  retrievedSourceIds?: string[];
  findings: Finding[];
  auditTrail: AuditEvent[];
  comments: CommentItem[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvalDurationHours?: number;
  isDemoScenario?: boolean;
}
