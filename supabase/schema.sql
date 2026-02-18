-- Episodes
CREATE TABLE episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  tier_required text NOT NULL DEFAULT 'viewer',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Polls
CREATE TABLE polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('agenda', 'project', 'milestone')),
  tier_required text NOT NULL DEFAULT 'supporter',
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text,
  vote_count integer DEFAULT 0
);

CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  option_id uuid REFERENCES poll_options(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  tier_at_vote text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, wallet_address)
);

CREATE TABLE vote_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid REFERENCES votes(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  mint_address text,
  poll_title text,
  option_label text,
  minted_at timestamptz DEFAULT now()
);

-- Milestones
CREATE TABLE milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  title text NOT NULL,
  description text,
  target_amount numeric,
  current_amount numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Backstage posts
CREATE TABLE backstage_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  media_url text,
  tier_required text NOT NULL DEFAULT 'supporter',
  created_at timestamptz DEFAULT now()
);

-- Chat messages
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  display_name text,
  message text NOT NULL,
  tier text NOT NULL DEFAULT 'viewer',
  is_highlighted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable realtime on tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE poll_options;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE milestones;

-- Seed data: Episode 0
INSERT INTO episodes (title, description, video_url, tier_required, is_featured)
VALUES (
  'Episode 0: Introducing BACKLOT',
  'A social experiment testing how far community can take creative ideas IRL. Meet the project, the token, and the madwoman dev behind it all.',
  'https://x.com/Backlot876/status/2022745002401521683',
  'viewer',
  true
);

-- Seed data: Sample milestones for The Complex
INSERT INTO milestones (project_name, title, description, target_amount, current_amount, status, sort_order)
VALUES
  ('The Complex', 'Community Launch', 'Build the community, launch the token, start documenting', 100, 100, 'completed', 1),
  ('The Complex', '24/7 Dev Stream', 'Launch the living art experiment — livestreaming from Jamaica', 200, 150, 'active', 2),
  ('The Complex', 'Platform MVP', 'Ship the Backlot token-gated media platform', 500, 0, 'upcoming', 3),
  ('The Complex', 'First Full Episode', 'Film, edit, and release the first full documentary episode', 1000, 0, 'upcoming', 4),
  ('The Complex', 'Community Project Vote', 'Open voting for the second project to document', 2000, 0, 'upcoming', 5);

-- Seed data: Sample polls
INSERT INTO polls (title, description, type, tier_required, is_active)
VALUES
  ('What should the dev do today?', 'Vote on today''s livestream agenda. Top choice gets priority.', 'agenda', 'supporter', true),
  ('Next project to document?', 'Which ambitious idea should Backlot follow after The Complex?', 'project', 'producer', true);

INSERT INTO poll_options (poll_id, label, description, vote_count)
SELECT p.id, opt.label, opt.description, opt.vote_count
FROM polls p
CROSS JOIN (VALUES
  ('Beach walkthrough + market visit', 'Explore Portland and show the local scene', 12),
  ('Dev session: build the voting page', 'Watch the platform come together live', 8),
  ('Community AMA on Spaces', 'Answer questions and talk roadmap', 5)
) AS opt(label, description, vote_count)
WHERE p.title = 'What should the dev do today?';

INSERT INTO poll_options (poll_id, label, description, vote_count)
SELECT p.id, opt.label, opt.description, opt.vote_count
FROM polls p
CROSS JOIN (VALUES
  ('Music studio in Kingston', 'Follow a producer building a world-class studio in JA', 15),
  ('Eco-resort in Portland', 'Document a sustainable tourism project from scratch', 9),
  ('Tech hub in Montego Bay', 'A coworking space for Caribbean developers', 7),
  ('Nominate your own idea', 'Submit your own ambitious project for consideration', 3)
) AS opt(label, description, vote_count)
WHERE p.title = 'Next project to document?';

-- Participation scoring
CREATE TABLE participation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL UNIQUE,
  display_name text,
  votes_cast integer DEFAULT 0,
  polls_participated integer DEFAULT 0,
  chat_messages_sent integer DEFAULT 0,
  days_holding integer DEFAULT 0,
  cnft_receipts integer DEFAULT 0,
  total_score integer DEFAULT 0,
  tier text DEFAULT 'viewer',
  updated_at timestamptz DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE participation_scores;

-- Token-weighted voting columns
ALTER TABLE votes ADD COLUMN weight numeric DEFAULT 1;
ALTER TABLE poll_options ADD COLUMN weighted_count numeric DEFAULT 0;

-- Milestone contributions
CREATE TABLE milestone_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid REFERENCES milestones(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'SOL',
  tx_signature text,
  created_at timestamptz DEFAULT now()
);
