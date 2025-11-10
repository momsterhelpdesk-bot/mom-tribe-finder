-- Create app_role enum
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  city text not null,
  area text not null,
  child_age_group text not null,
  match_preference text not null,
  child_names text,
  profile_photo_url text,
  selfie_photo_url text,
  verified_status boolean default false,
  mom_badge text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can view verified profiles based on match preference"
  on public.profiles
  for select
  using (
    verified_status = true 
    and (
      (match_preference = 'Μόνο κοντινές μαμάδες' and city = (select city from profiles where id = auth.uid()) and area = (select area from profiles where id = auth.uid()))
      or match_preference = 'Από όλη την Ελλάδα'
    )
  );

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles
  for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update all profiles"
  on public.profiles
  for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete profiles"
  on public.profiles
  for delete
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles
  for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert roles"
  on public.user_roles
  for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update roles"
  on public.user_roles
  for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete roles"
  on public.user_roles
  for delete
  using (public.has_role(auth.uid(), 'admin'));

-- Create storage buckets for profile photos
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true);

insert into storage.buckets (id, name, public)
values ('selfie-photos', 'selfie-photos', false);

-- Storage policies for profile-photos (public)
create policy "Anyone can view profile photos"
  on storage.objects
  for select
  using (bucket_id = 'profile-photos');

create policy "Users can upload their own profile photo"
  on storage.objects
  for insert
  with check (
    bucket_id = 'profile-photos' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own profile photo"
  on storage.objects
  for update
  using (
    bucket_id = 'profile-photos' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own profile photo"
  on storage.objects
  for delete
  using (
    bucket_id = 'profile-photos' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for selfie-photos (private, admins only)
create policy "Admins can view selfie photos"
  on storage.objects
  for select
  using (
    bucket_id = 'selfie-photos' 
    and public.has_role(auth.uid(), 'admin')
  );

create policy "Users can upload their own selfie"
  on storage.objects
  for insert
  with check (
    bucket_id = 'selfie-photos' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert default user role
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$$;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for profiles updated_at
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();