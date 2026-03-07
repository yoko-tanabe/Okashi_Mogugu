-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- Users / Profiles
-- =====================
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  nationality text not null default 'JP',
  gender text not null default 'Prefer not to say',
  birth_date date,
  age_group text not null default '20s',
  hobby_tags text[] not null default '{}',
  free_text text not null default '',
  video_links text[] not null default '{}',
  languages text[] not null default '{}',
  travel_style text not null default 'Sightseeing',
  gender_filter text[] not null default '{No preference}',
  age_range_min int not null default 18,
  age_range_max int not null default 99,
  toku_points int not null default 0,
  avatar_url text not null default '',
  want_to_meet_mode boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================
-- Encounters (すれ違い記録)
-- =====================
create table encounters (
  id uuid primary key default uuid_generate_v4(),
  user_a_id uuid not null references profiles(id) on delete cascade,
  user_b_id uuid not null references profiles(id) on delete cascade,
  location text not null,
  latitude double precision,
  longitude double precision,
  distance_meters int not null default 0,
  encountered_at timestamptz not null default now(),
  expired boolean not null default false,
  created_at timestamptz not null default now(),

  constraint encounters_unique unique (user_a_id, user_b_id, encountered_at)
);

create index idx_encounters_user_a on encounters(user_a_id);
create index idx_encounters_user_b on encounters(user_b_id);
create index idx_encounters_time on encounters(encountered_at);

-- =====================
-- Swipes (スワイプ記録)
-- =====================
create table swipes (
  id uuid primary key default uuid_generate_v4(),
  swiper_id uuid not null references profiles(id) on delete cascade,
  target_id uuid not null references profiles(id) on delete cascade,
  encounter_id uuid not null references encounters(id) on delete cascade,
  direction text not null check (direction in ('right', 'left')),
  created_at timestamptz not null default now(),

  constraint swipes_unique unique (swiper_id, target_id, encounter_id)
);

create index idx_swipes_swiper on swipes(swiper_id);
create index idx_swipes_target on swipes(target_id);

-- =====================
-- Matches (マッチング)
-- =====================
create table matches (
  id uuid primary key default uuid_generate_v4(),
  user_a_id uuid not null references profiles(id) on delete cascade,
  user_b_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'matched' check (status in ('pending', 'matched', 'expired')),
  chat_open boolean not null default true,
  meet_confirmed_a boolean not null default false,
  meet_confirmed_b boolean not null default false,
  meet_deadline timestamptz,
  met_up boolean not null default false,
  matched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint matches_unique unique (user_a_id, user_b_id)
);

create index idx_matches_user_a on matches(user_a_id);
create index idx_matches_user_b on matches(user_b_id);

-- =====================
-- Chat Messages
-- =====================
create table messages (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references matches(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index idx_messages_match on messages(match_id);
create index idx_messages_time on messages(created_at);

-- =====================
-- Stamps (パスポートスタンプ)
-- =====================
create table stamps (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  met_user_id uuid references profiles(id) on delete set null,
  nationality text not null,
  user_name text not null,
  location text not null default '',
  stamped_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index idx_stamps_owner on stamps(owner_id);

-- =====================
-- Toku History (徳ポイント履歴)
-- =====================
create table toku_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  points int not null,
  created_at timestamptz not null default now()
);

create index idx_toku_user on toku_history(user_id);

-- =====================
-- Location logs (位置情報ログ)
-- =====================
create table location_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  recorded_at timestamptz not null default now()
);

create index idx_location_user on location_logs(user_id);
create index idx_location_time on location_logs(recorded_at);

-- =====================
-- Blocks (ブロック)
-- =====================
create table blocks (
  id uuid primary key default uuid_generate_v4(),
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint blocks_unique unique (blocker_id, blocked_id)
);

-- =====================
-- Updated_at trigger
-- =====================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- =====================
-- Row Level Security (RLS)
-- =====================
alter table profiles enable row level security;
alter table encounters enable row level security;
alter table swipes enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;
alter table stamps enable row level security;
alter table toku_history enable row level security;
alter table location_logs enable row level security;
alter table blocks enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Encounters: users can see their own encounters
create policy "Users can view own encounters"
  on encounters for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- Swipes: users can manage their own swipes
create policy "Users can view own swipes"
  on swipes for select using (auth.uid() = swiper_id);

create policy "Users can insert own swipes"
  on swipes for insert with check (auth.uid() = swiper_id);

-- Matches: users can see their own matches
create policy "Users can view own matches"
  on matches for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Users can update own matches"
  on matches for update
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- Messages: users can see messages in their matches
create policy "Users can view match messages"
  on messages for select
  using (
    exists (
      select 1 from matches
      where matches.id = messages.match_id
        and (matches.user_a_id = auth.uid() or matches.user_b_id = auth.uid())
    )
  );

create policy "Users can send messages to their matches"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from matches
      where matches.id = messages.match_id
        and matches.chat_open = true
        and (matches.user_a_id = auth.uid() or matches.user_b_id = auth.uid())
    )
  );

-- Stamps: users can see and manage their own stamps
create policy "Users can view own stamps"
  on stamps for select using (auth.uid() = owner_id);

create policy "Users can insert own stamps"
  on stamps for insert with check (auth.uid() = owner_id);

-- Toku history: users can see their own history
create policy "Users can view own toku history"
  on toku_history for select using (auth.uid() = user_id);

create policy "Users can insert own toku history"
  on toku_history for insert with check (auth.uid() = user_id);

-- Location logs: only own logs
create policy "Users can manage own location logs"
  on location_logs for select using (auth.uid() = user_id);

create policy "Users can insert own location logs"
  on location_logs for insert with check (auth.uid() = user_id);

-- Blocks: users can manage their own blocks
create policy "Users can view own blocks"
  on blocks for select using (auth.uid() = blocker_id);

create policy "Users can insert own blocks"
  on blocks for insert with check (auth.uid() = blocker_id);

create policy "Users can delete own blocks"
  on blocks for delete using (auth.uid() = blocker_id);
