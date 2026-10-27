import { createClient } from "@supabase/supabase-js";

// Ensure safe server-side static rendering across all Node versions
if (typeof globalThis.WebSocket === "undefined" && typeof window === "undefined") {
  // @ts-ignore
  globalThis.WebSocket = class DummyWebSocket {
    constructor() {}
    addEventListener() {}
    removeEventListener() {}
    send() {}
    close() {}
  };
}


const supabaseUrl = (import.meta.env.PUBLIC_SUPABASE_URL as string) || "https://ntfiyynlsfplntnxevak.supabase.co";
const supabaseAnonKey = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string) || "sb_publishable_XPqOE8BuZF8cKmrpupqo8g_v8Z5VVRB";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export type Category = "lifemode" | "deepwork" | "setgoals" | "brainrots";

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: Category;
  excerpt: string | null;
  content: Record<string, unknown>;
  cover_image_url: string | null;
  published_at: string | null;
  is_published: boolean;
  read_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface PostImage {
  id: string;
  post_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export const CATEGORIES: Record<
  Category,
  { label: string; description: string; emoji: string; color: string }
> = {
  lifemode: {
    label: "LIFEMODE",
    description: "Raw thoughts, grind, and real talk",
    emoji: "⚡",
    color: "#f59e0b",
  },
  deepwork: {
    label: "DEEP WORK",
    description: "Engineering, craft, and systems thinking",
    emoji: "🔧",
    color: "#6366f1",
  },
  setgoals: {
    label: "SET GOALS",
    description: "Ambitions, discipline, and the long game",
    emoji: "🎯",
    color: "#10b981",
  },
  brainrots: {
    label: "BRAINROTS",
    description: "Shower thoughts, wild ideas, and chaos",
    emoji: "🌀",
    color: "#ec4899",
  },
};

export async function getFingerprint(): Promise<string> {
  const nav = window.navigator;
  const raw = [nav.userAgent, nav.language, nav.hardwareConcurrency, screen.width, screen.height, Intl.DateTimeFormat().resolvedOptions().timeZone].join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getPublishedPosts(category?: Category): Promise<Post[]> {
  let query = supabase.from("posts").select("*").eq("is_published", true).order("published_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return (data as Post[]) ?? [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).eq("is_published", true).single();
  if (error) return null;
  return data as Post;
}

export async function getPostImages(postId: string): Promise<PostImage[]> {
  const { data } = await supabase.from("post_images").select("*").eq("post_id", postId).order("sort_order");
  return (data as PostImage[]) ?? [];
}

export async function getComments(postId: string): Promise<Comment[]> {
  const { data } = await supabase.from("comments").select("*").eq("post_id", postId).eq("is_approved", true).order("created_at", { ascending: true });
  return (data as Comment[]) ?? [];
}

export async function getLikeCount(postId: string): Promise<number> {
  const { count } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", postId);
  return count ?? 0;
}

export async function hasLiked(postId: string, fingerprint: string): Promise<boolean> {
  const { data } = await supabase.from("likes").select("id").eq("post_id", postId).eq("fingerprint", fingerprint).maybeSingle();
  return !!data;
}

export async function toggleLike(postId: string, fingerprint: string, liked: boolean): Promise<void> {
  if (liked) {
    await supabase.from("likes").delete().eq("post_id", postId).eq("fingerprint", fingerprint);
  } else {
    await supabase.from("likes").insert({ post_id: postId, fingerprint });
  }
}

export async function addComment(postId: string, authorName: string, content: string, authorEmail?: string): Promise<Comment | null> {
  const { data, error } = await supabase.from("comments").insert({ post_id: postId, author_name: authorName, content, author_email: authorEmail || null }).select().single();
  if (error) return null;
  return data as Comment;
}

export async function getAllPosts(): Promise<Post[]> {
  const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Post[]) ?? [];
}

export async function upsertPost(post: Partial<Post> & { title: string; slug: string; category: Category }): Promise<Post> {
  const { data, error } = await supabase.from("posts").upsert({ ...post, updated_at: new Date().toISOString() }).select().single();
  if (error) throw error;
  return data as Post;
}

export async function deletePost(id: string): Promise<void> {
  await supabase.from("posts").delete().eq("id", id);
}

export async function uploadImage(file: File, folder = "posts"): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("blog-images").upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function addPostImage(postId: string, url: string, caption?: string, sortOrder = 0): Promise<PostImage | null> {
  const { data, error } = await supabase.from("post_images").insert({ post_id: postId, url, caption: caption || null, sort_order: sortOrder }).select().single();
  if (error) return null;
  return data as PostImage;
}

export interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
}

export async function subscribeEmail(email: string): Promise<{ success: boolean; message: string; alreadySubscribed?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  const { error } = await supabase.from("subscribers").insert({ email: cleanEmail });
  if (error) {
    if (error.code === "23505") {
      return { success: true, message: "You're already subscribed! 💌", alreadySubscribed: true };
    }
    return { success: false, message: "Could not subscribe right now. Please try again." };
  }
  return { success: true, message: "You're on the list! Welcome aboard 🎉" };
}

export async function getSubscribersCount(): Promise<number> {
  const { count, error } = await supabase.from("subscribers").select("*", { count: "exact", head: true }).eq("is_active", true);
  if (error) return 0;
  return count ?? 0;
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const { data, error } = await supabase.from("subscribers").select("*", { count: "exact" }).eq("is_active", true).order("subscribed_at", { ascending: false });
  if (error) return [];
  return (data as Subscriber[]) ?? [];
}
