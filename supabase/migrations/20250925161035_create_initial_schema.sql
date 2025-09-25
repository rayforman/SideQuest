-- User profiles table (extends Supabase auth.users)
create table user_profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique not null,
    travel_interests text[] default '{}', -- ['scuba', 'hiking', 'nightlife', 'culture', 'nature']
    budget_preference text check (budget_preference in ('budget', 'mid-range', 'luxury')) default 'mid-range',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on user_profiles
alter table user_profiles enable row level security;

-- RLS Policies for user_profiles
create policy "Users can view own profile" on user_profiles 
    for select using (auth.uid() = id);
create policy "Users can update own profile" on user_profiles 
    for update using (auth.uid() = id);
create policy "Users can insert own profile" on user_profiles 
    for insert with check (auth.uid() = id);

-- Quests table - stores our travel quest packages
create table quests (
    id uuid default gen_random_uuid() primary key,
    name text not null, -- "Pirates of the Caribbean"
    description text not null,
    theme text not null, -- 'adventure', 'relaxation', 'culture', 'nightlife'
    activities text[] not null default '{}', -- ['sailing', 'drinking', 'beaches', 'snorkeling']
    destination_city text not null,
    destination_country text not null,
    price_range text check (price_range in ('budget', 'mid-range', 'luxury')) not null,
    duration_days integer not null check (duration_days > 0),
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on quests (public read access for now)
alter table quests enable row level security;
create policy "Anyone can view quests" on quests 
    for select using (true);

-- User quest interactions - track swipes, likes, saves
create table user_quest_interactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    quest_id uuid references quests(id) on delete cascade,
    action text check (action in ('liked', 'disliked', 'saved', 'viewed')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, quest_id, action)
);

-- Enable RLS on interactions
alter table user_quest_interactions enable row level security;
create policy "Users can view own interactions" on user_quest_interactions 
    for select using (auth.uid() = user_id);
create policy "Users can insert own interactions" on user_quest_interactions 
    for insert with check (auth.uid() = user_id);

-- Saved quests for users (subset of interactions, but with additional data)
create table saved_quests (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    quest_id uuid references quests(id) on delete cascade,
    start_date date,
    end_date date,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, quest_id)
);

-- Enable RLS on saved_quests
alter table saved_quests enable row level security;
create policy "Users can manage own saved quests" on saved_quests 
    for all using (auth.uid() = user_id);

-- Create indexes for better performance
create index user_profiles_username_idx on user_profiles(username);
create index quests_theme_idx on quests(theme);
create index quests_destination_idx on quests(destination_city, destination_country);
create index quests_price_range_idx on quests(price_range);
create index user_quest_interactions_user_idx on user_quest_interactions(user_id);
create index user_quest_interactions_quest_idx on user_quest_interactions(quest_id);
create index saved_quests_user_idx on saved_quests(user_id);