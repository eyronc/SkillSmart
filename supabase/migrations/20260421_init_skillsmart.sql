create extension if not exists pgcrypto;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  company text,
  description_text text,
  raw_skills jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  extracted_skills jsonb not null default '[]'::jsonb,
  resume_text text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.skill_gaps (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  matched_skills jsonb not null default '[]'::jsonb,
  missing_skills jsonb not null default '[]'::jsonb,
  match_score integer not null default 0,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  skill_tag text not null unique,
  type text not null default 'resource',
  created_at timestamp with time zone not null default now()
);

create table if not exists public.interview_attempts (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references public.resumes(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  job_title text not null,
  challenge_type text not null,
  prompt_used text not null,
  answer_text text,
  transcript_text text,
  audio_url text,
  score integer not null default 0,
  rubric_scores jsonb not null default '[]'::jsonb,
  feedback jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.scan_results (
  id uuid primary key default gen_random_uuid(),
  resume_text text,
  extracted_skills jsonb,
  results jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists idx_jobs_title on public.jobs(title);
create index if not exists idx_learning_resources_skill_tag on public.learning_resources(skill_tag);
create index if not exists idx_skill_gaps_resume_id on public.skill_gaps(resume_id);
create index if not exists idx_skill_gaps_job_id on public.skill_gaps(job_id);
create index if not exists idx_interview_attempts_resume_id on public.interview_attempts(resume_id);
create index if not exists idx_interview_attempts_job_id on public.interview_attempts(job_id);
create index if not exists idx_interview_attempts_job_title on public.interview_attempts(job_title);

insert into storage.buckets (id, name, public)
values ('interview-audio', 'interview-audio', true)
on conflict (id) do nothing;

alter table public.jobs enable row level security;
alter table public.resumes enable row level security;
alter table public.skill_gaps enable row level security;
alter table public.learning_resources enable row level security;
alter table public.interview_attempts enable row level security;
alter table public.scan_results enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'jobs' and policyname = 'jobs_public_select'
  ) then
    create policy jobs_public_select on public.jobs for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'jobs' and policyname = 'jobs_public_insert'
  ) then
    create policy jobs_public_insert on public.jobs for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'jobs' and policyname = 'jobs_public_update'
  ) then
    create policy jobs_public_update on public.jobs for update using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'resumes' and policyname = 'resumes_public_select'
  ) then
    create policy resumes_public_select on public.resumes for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'resumes' and policyname = 'resumes_public_insert'
  ) then
    create policy resumes_public_insert on public.resumes for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'skill_gaps' and policyname = 'skill_gaps_public_select'
  ) then
    create policy skill_gaps_public_select on public.skill_gaps for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'skill_gaps' and policyname = 'skill_gaps_public_insert'
  ) then
    create policy skill_gaps_public_insert on public.skill_gaps for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'learning_resources' and policyname = 'learning_resources_public_select'
  ) then
    create policy learning_resources_public_select on public.learning_resources for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'learning_resources' and policyname = 'learning_resources_public_insert'
  ) then
    create policy learning_resources_public_insert on public.learning_resources for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'learning_resources' and policyname = 'learning_resources_public_update'
  ) then
    create policy learning_resources_public_update on public.learning_resources for update using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'interview_attempts' and policyname = 'interview_attempts_public_select'
  ) then
    create policy interview_attempts_public_select on public.interview_attempts for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'interview_attempts' and policyname = 'interview_attempts_public_insert'
  ) then
    create policy interview_attempts_public_insert on public.interview_attempts for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'interview_audio_public_select'
  ) then
    create policy interview_audio_public_select on storage.objects for select using (bucket_id = 'interview-audio');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'interview_audio_public_insert'
  ) then
    create policy interview_audio_public_insert on storage.objects for insert with check (bucket_id = 'interview-audio');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'scan_results' and policyname = 'scan_results_public_select'
  ) then
    create policy scan_results_public_select on public.scan_results for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'scan_results' and policyname = 'scan_results_public_insert'
  ) then
    create policy scan_results_public_insert on public.scan_results for insert with check (true);
  end if;
end $$;