import { useState, useEffect, useRef } from "react";
import {
  supabase,
  getComments,
  getLikeCount,
  hasLiked,
  toggleLike,
  addComment,
  getPostImages,
  getPostBySlug,
  getFingerprint,
  CATEGORIES,
  type Post,
  type Comment,
  type PostImage,
} from "@/lib/supabase";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import SubscribeBox from "@/components/blog/SubscribeBox";

const TIPTAP_EXTENSIONS = [
  StarterKit,
  TiptapImage,
  TaskList,
  TaskItem,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Underline,
  Link.configure({ openOnClick: true }),
  Typography,
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function ImageAlbum({ images }: { images: PostImage[] }) {
  const [lightbox, setLightbox] = useState<PostImage | null>(null);
  if (images.length === 0) return null;
  return (
    <section className="post-album">
      <h3 className="post-album-title">📸 Gallery</h3>
      <div className={`album-grid album-grid-${Math.min(images.length, 3)}`}>
        {images.map((img) => (
          <button key={img.id} className="album-item" onClick={() => setLightbox(img)}>
            <img src={img.url} alt={img.caption ?? "Gallery image"} loading="lazy" />
            {img.caption && <span className="album-caption">{img.caption}</span>}
          </button>
        ))}
      </div>
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">✕</button>
            <img src={lightbox.url} alt={lightbox.caption ?? ""} />
            {lightbox.caption && <p className="lightbox-caption">{lightbox.caption}</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [fp, setFp] = useState("");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    getFingerprint().then(async (fingerprint) => {
      setFp(fingerprint);
      const [c, l] = await Promise.all([getLikeCount(postId), hasLiked(postId, fingerprint)]);
      setCount(c);
      setLiked(l);
    });

    const channel = supabase
      .channel(`likes-${postId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "likes", filter: `post_id=eq.${postId}` }, async () => {
        const c = await getLikeCount(postId);
        setCount(c);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  const handleLike = async () => {
    if (!fp) return;
    setAnimating(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? c - 1 : c + 1));
    await toggleLike(postId, fp, wasLiked);
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <button
      className={`like-btn ${liked ? "liked" : ""} ${animating ? "pop" : ""}`}
      onClick={handleLike}
      aria-label={liked ? "Unlike this post" : "Like this post"}
    >
      <span className="like-heart">{liked ? "❤️" : "🤍"}</span>
      <span className="like-count">{count}</span>
      <span className="like-label">{liked ? "Liked" : "Like this"}</span>
    </button>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getComments(postId).then(setComments);
    const channel = supabase
      .channel(`comments-${postId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `post_id=eq.${postId}` }, (payload) => {
        const c = payload.new as Comment;
        if (c.is_approved) {
          setComments((prev) => [...prev, c]);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSubmitting(true);
    await addComment(postId, name.trim(), text.trim());
    setName("");
    setText("");
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="comment-section">
      <h3 className="comment-section-title">
        💬 {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? "s" : ""}` : "Be the first"}
      </h3>
      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <div className="comment-avatar">{c.author_name[0].toUpperCase()}</div>
            <div className="comment-bubble">
              <div className="comment-meta">
                <strong className="comment-author">{c.author_name}</strong>
                <span className="comment-time">{timeAgo(c.created_at)}</span>
              </div>
              <p className="comment-text">{c.content}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="comment-form" onSubmit={handleSubmit}>
        <input className="comment-input" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
        <textarea className="comment-textarea" placeholder="Write your thoughts..." value={text} onChange={(e) => setText(e.target.value)} required maxLength={1000} rows={3} />
        <button type="submit" className="comment-submit" disabled={submitting || !name.trim() || !text.trim()}>
          {submitting ? "Sending..." : submitted ? "✓ Posted!" : "Post Comment"}
        </button>
      </form>
    </section>
  );
}

export default function BlogPost({ slug }: { slug: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [images, setImages] = useState<PostImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getPostBySlug(slug).then((p) => {
      setPost(p);
      if (p) getPostImages(p.id).then(setImages);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="post-loading-state">
        <div className="post-loading-cover skeleton-pulse" />
        <div className="post-loading-body">
          <div className="skeleton-line short" />
          <div className="skeleton-line" style={{ height: "3rem" }} />
          <div className="skeleton-line" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-not-found">
        <span className="post-not-found-emoji">🌌</span>
        <h1>Post not found</h1>
        <p>This post may have been removed or the URL is wrong.</p>
        <a href="/blog" className="post-back-link">← Back to Blog</a>
      </div>
    );
  }

  const cat = CATEGORIES[post.category];

  const contentHTML = (() => {
    try {
      if (!post.content || Object.keys(post.content).length === 0) return "";
      return generateHTML(post.content as Parameters<typeof generateHTML>[0], TIPTAP_EXTENSIONS);
    } catch {
      return "<p>Could not render content.</p>";
    }
  })();

  return (
    <article className="blog-post-full">
      {post.cover_image_url && (
        <div className="post-full-cover">
          <img src={post.cover_image_url} alt={post.title} />
          <div className="post-full-cover-overlay" />
        </div>
      )}
      <div className="post-full-body">
        <div className="post-full-meta">
          <span className="post-full-category" style={{ color: cat.color, borderColor: `${cat.color}40` }}>
            {cat.emoji} {cat.label}
          </span>
          <span className="post-full-read">{post.read_time_minutes} min read</span>
          {post.published_at && (
            <time className="post-full-date" dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          )}
        </div>
        <h1 className="post-full-title">{post.title}</h1>
        {post.excerpt && <p className="post-full-excerpt">{post.excerpt}</p>}
        {contentHTML && <div className="post-full-content tiptap-content" dangerouslySetInnerHTML={{ __html: contentHTML }} />}
        <ImageAlbum images={images} />
        <div className="post-full-actions">
          <LikeButton postId={post.id} />
          <a href="/blog" className="post-back-link">← Back to Blog</a>
        </div>
        <SubscribeBox variant="compact" />
        <CommentSection postId={post.id} />
      </div>
    </article>
  );
}
