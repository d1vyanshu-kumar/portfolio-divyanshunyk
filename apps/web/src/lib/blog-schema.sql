-- ============================================================
-- BLOG SYSTEM — Supabase SQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- POSTS table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  category text not null check (category in ('lifemode', 'deepwork', 'setgoals', 'brainrots')),
  excerpt text,
  content jsonb not null default '{}',
  cover_image_url text,
  published_at timestamp with time zone,
  is_published boolean default false,
  read_time_minutes int default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- POST IMAGES (album/gallery per post)
create table if not exists public.post_images (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  url text not null,
  caption text,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

-- COMMENTS
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  author_name text not null,
  author_email text,
  content text not null,
  is_approved boolean default true,
  created_at timestamp with time zone default now()
);

-- LIKES (anonymous, fingerprint-based)
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  fingerprint text not null,
  created_at timestamp with time zone default now(),
  unique(post_id, fingerprint)
);

-- Enable Row Level Security
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- RLS Policies
-- Posts: anyone reads published, authenticated can write all
create policy "Public read published posts" on public.posts for select using (is_published = true);
create policy "Admin full access posts" on public.posts for all using (auth.role() = 'authenticated');

-- Post images: public read, authenticated write
create policy "Public read post images" on public.post_images for select using (true);
create policy "Admin write post images" on public.post_images for all using (auth.role() = 'authenticated');

-- Comments: public read approved, anyone can insert
create policy "Public read approved comments" on public.comments for select using (is_approved = true);
create policy "Anyone can comment" on public.comments for insert with check (true);

-- Likes: full anonymous access
create policy "Public read likes" on public.likes for select using (true);
create policy "Anyone can like" on public.likes for insert with check (true);
create policy "Anyone can unlike" on public.likes for delete using (true);

-- Enable Realtime for live updates
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.likes;

-- Storage: Create bucket via Supabase Dashboard
-- Storage > New bucket > Name: "blog-images" > Public: ON
-- Then add policy: INSERT allowed for authenticated users only

-- SUBSCRIBERS (Email notifications)
create table if not exists public.subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  is_active boolean default true,
  subscribed_at timestamp with time zone default now()
);

alter table public.subscribers enable row level security;

-- Subscribers policies
create policy "Anyone can subscribe" on public.subscribers for insert with check (true);
create policy "Admin read subscribers" on public.subscribers for select using (auth.role() = 'authenticated');
create policy "Admin update subscribers" on public.subscribers for update using (auth.role() = 'authenticated');
create policy "Admin delete subscribers" on public.subscribers for delete using (auth.role() = 'authenticated');

-- Enable pg_net extension for async HTTP requests (Resend integration)
create extension if not exists pg_net with schema extensions;

-- Function to notify all active subscribers when a post is published
create or replace function public.notify_subscribers_on_publish()
returns trigger as $$
declare
  sub record;
  post_title text;
  post_slug text;
  post_excerpt text;
  post_category text;
  site_url text := coalesce(nullif(current_setting('app.settings.site_url', true), ''), 'https://divyanshunyk.dev');
  resend_api_key text := coalesce(nullif(current_setting('app.settings.resend_api_key', true), ''), 're_YOUR_RESEND_API_KEY');
  email_html text;
  email_subject text;
begin
  if (NEW.is_published = true and (OLD is null or OLD.is_published is not true)) then
    post_title := coalesce(NEW.title, 'New Post');
    post_slug := coalesce(NEW.slug, '');
    post_excerpt := coalesce(NEW.excerpt, 'A new post was just published on Divyanshu Kumar''s blog.');
    post_category := upper(coalesce(NEW.category, 'LIFEMODE'));
    email_subject := '⚡ New Post: ' || post_title;

    email_html := '<!DOCTYPE html>'
      || '<html><head><meta charset="utf-8">'
      || '<style>'
      || 'body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #0b0b0d; color: #ededef; }'
      || '.wrapper { max-width: 600px; margin: 40px auto; background-color: #141418; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }'
      || '.header { padding: 32px 32px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }'
      || '.badge { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #ff5436; background: rgba(255,84,54,0.14); padding: 4px 12px; border-radius: 100px; }'
      || '.title { font-size: 26px; font-weight: 800; color: #ffffff; margin: 16px 0 8px; line-height: 1.25; }'
      || '.meta { font-size: 13px; color: #94a3b8; }'
      || '.content { padding: 24px 32px; font-size: 16px; line-height: 1.6; color: #cbd5e1; }'
      || '.btn-wrapper { padding: 0 32px 32px; }'
      || '.btn { display: inline-block; background-color: #ff5436; color: #ffffff !important; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 100px; }'
      || '.footer { padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #64748b; text-align: center; }'
      || '</style></head>'
      || '<body>'
      || '<div class="wrapper">'
      || '  <div class="header">'
      || '    <span class="badge">' || post_category || '</span>'
      || '    <h1 class="title">' || post_title || '</h1>'
      || '    <div class="meta">By Divyanshu Kumar &middot; Just published</div>'
      || '  </div>'
      || '  <div class="content">'
      || '    <p>' || post_excerpt || '</p>'
      || '  </div>'
      || '  <div class="btn-wrapper">'
      || '    <a class="btn" href="' || site_url || '/blog/' || post_slug || '">Read Full Post &rarr;</a>'
      || '  </div>'
      || '  <div class="footer">'
      || '    You are receiving this because you subscribed to Divyanshu Kumar''s blog.<br>'
      || '    &copy; ' || to_char(now(), 'YYYY') || ' Divyanshu Kumar. All rights reserved.'
      || '  </div>'
      || '</div>'
      || '</body></html>';

    for sub in select email from public.subscribers where is_active = true loop
      perform net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || resend_api_key,
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'from', 'Divyanshu Kumar <onboarding@resend.dev>',
          'to', sub.email,
          'subject', email_subject,
          'html', email_html
        )
      );
    end loop;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_notify_subscribers on public.posts;
create trigger trigger_notify_subscribers
  after insert or update of is_published
  on public.posts
  for each row
  execute function public.notify_subscribers_on_publish();
