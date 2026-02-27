export type Tier = "viewer" | "supporter" | "producer" | "executive_producer";

export interface Episode {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  tier_required: Tier;
  is_featured: boolean;
  created_at: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  type: "agenda" | "project" | "milestone";
  tier_required: Tier;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  is_blink: boolean;
  created_at: string;
  options?: PollOption[];
}

export interface PollOption {
  id: string;
  poll_id: string;
  label: string;
  description: string | null;
  vote_count: number;
  weighted_count?: number;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  wallet_address: string;
  tier_at_vote: Tier;
  created_at: string;
}

export interface VoteReceipt {
  id: string;
  vote_id: string;
  wallet_address: string;
  mint_address: string | null;
  poll_title: string;
  option_label: string;
  minted_at: string;
}

export interface Milestone {
  id: string;
  project_name: string;
  title: string;
  description: string | null;
  target_amount: number | null;
  current_amount: number;
  status: "upcoming" | "active" | "completed";
  sort_order: number;
  created_at: string;
}

export interface BackstagePost {
  id: string;
  title: string;
  content: string | null;
  media_url: string | null;
  tier_required: Tier;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  wallet_address: string;
  display_name: string | null;
  message: string;
  tier: Tier;
  is_highlighted: boolean;
  created_at: string;
}
