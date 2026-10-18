import { useState, useEffect } from "react";
import { CATEGORIES, getPublishedPosts, type Post, type Category } from "@/lib/supabase";
import SubscribeBox from "@/components/blog/SubscribeBox";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function PostCard({ post }: { post: Post }) {
  const cat = CATEGORIES[post.category];
  return (
    <a href={`/blog/${post.slug}`} className="blog-post-card" style={{ "--cat-color": cat.color } as React.CSSProperties}>
      {post.cover_image_url && (
        <div className="post-card-cover">
          <img src={post.cover_image_url} alt={post.title} loading="lazy" />
        </div>
      )}
      <div className="post-card-body">
        <div className="post-card-meta">
          <span className="post-card-category" style={{ color: cat.color }}>{cat.emoji} {cat.label}</span>
          <span className="post-card-time">{post.published_at ? timeAgo(post.published_at) : "Draft"}</span>
        </div>
        <h2 className="post-card-title">{post.title}</h2>
        {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}
        <div className="post-card-footer">
          <span className="post-card-read">{post.read_time_minutes} min read</span>
          <span className="post-card-arrow">→</span>
        </div>
      </div>
    </a>
  );
}

export default function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPublishedPosts(activeCategory ?? undefined)
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="blog-index">
      {/* Category filter pills */}
      <div className="blog-categories" role="tablist" aria-label="Blog categories">
        <button
          role="tab"
          className={`cat-pill ${activeCategory === null ? "active" : ""}`}
          onClick={() => setActiveCategory(null)}
          aria-selected={activeCategory === null}
        >
          ALL
        </button>
        {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => (
          <button
            key={key}
            role="tab"
            className={`cat-pill ${activeCategory === key ? "active" : ""}`}
            onClick={() => setActiveCategory(key)}
            aria-selected={activeCategory === key}
            style={{ "--cat-color": cat.color } as React.CSSProperties}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Category hero cards */}
      {activeCategory === null && (
        <div className="blog-cat-grid">
          {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => (
            <button
              key={key}
              className="cat-card"
              onClick={() => setActiveCategory(key)}
              style={{ "--cat-color": cat.color } as React.CSSProperties}
            >
              <span className="cat-card-emoji">{cat.emoji}</span>
              <span className="cat-card-label">{cat.label}</span>
              <span className="cat-card-desc">{cat.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Posts grid */}
      {loading ? (
        <div className="blog-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="post-skeleton">
              <div className="skeleton-cover" />
              <div className="skeleton-body">
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
                <div className="skeleton-line medium" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="blog-empty">
          <span className="blog-empty-emoji">🌱</span>
          <p>Nothing here yet. Check back soon.</p>
        </div>
      ) : (
        <div className="blog-posts-grid">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}

      <SubscribeBox variant="banner" />
    </div>
  );
}