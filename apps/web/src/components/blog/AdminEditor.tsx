import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import {
  supabase,
  upsertPost,
  uploadImage,
  addPostImage,
  getPostImages,
  getAllPosts, getSubscribersCount,
  deletePost,
  CATEGORIES,
  type Post,
  type PostImage,
  type Category,
} from "@/lib/supabase";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function useAdminAuth() {
  const [user, setUser] = useState<unknown>(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (!error) setSent(true);
    setLoading(false);
  };

  const signOut = () => supabase.auth.signOut();

  return { user, email, setEmail, sent, loading, sendMagicLink, signOut };
}

function LoginScreen({ email, setEmail, sent, loading, sendMagicLink }: ReturnType<typeof useAdminAuth>) {
  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-icon">🔐</div>
        <h1 className="admin-login-title">Admin Portal</h1>
        <p className="admin-login-sub">Magic link login — no password needed</p>
        {sent ? (
          <div className="admin-login-sent">
            <span className="sent-icon">📬</span>
            <p>Check your inbox! A magic link has been sent to <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="admin-login-form">
            <input
              type="email"
              className="admin-login-input"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

interface EditorPaneProps {
  post: Partial<Post>;
  onSave: () => void;
  onBack: () => void;
}

function EditorPane({ post: initialPost, onSave, onBack }: EditorPaneProps) {
  const [title, setTitle] = useState(initialPost.title ?? "");
  const [slug, setSlug] = useState(initialPost.slug ?? "");
  const [category, setCategory] = useState<Category>(initialPost.category ?? "lifemode");
  const [excerpt, setExcerpt] = useState(initialPost.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(initialPost.cover_image_url ?? "");
  const [isPublished, setIsPublished] = useState(initialPost.is_published ?? false);
  const [_readTime, setReadTime] = useState(initialPost.read_time_minutes ?? 3);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(initialPost.id ?? "");
  const [images, setImages] = useState<PostImage[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({ inline: false, allowBase64: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Link.configure({ openOnClick: false }),
      Typography,
      Placeholder.configure({ placeholder: "Start writing... use / for commands" }),
    ],
    content: initialPost.content ?? {},
    editorProps: {
      attributes: { class: "tiptap-editor-content" },
    },
  });

  useEffect(() => {
    if (savedId) {
      getPostImages(savedId).then(setImages);
    }
  }, [savedId]);

  useEffect(() => {
    if (!initialPost.slug && title) {
      setSlug(slugify(title));
    }
  }, [title]);

  const handleSave = async (publish = false) => {
    if (!editor || !title.trim() || !slug.trim()) return;
    setSaving(true);
    const content = editor.getJSON();
    const words = editor.getText().split(/\s+/).length;
    const newReadTime = Math.max(1, Math.ceil(words / 200));

    try {
      const saved = await upsertPost({
        ...(savedId ? { id: savedId } : {}),
        title,
        slug,
        category,
        excerpt: excerpt || null,
        content,
        cover_image_url: coverUrl || null,
        is_published: publish || isPublished,
        published_at: (publish || isPublished) ? new Date().toISOString() : null,
        read_time_minutes: newReadTime,
      });
      setSavedId(saved.id);
      setIsPublished(saved.is_published);
      setReadTime(newReadTime);
      setSaveMsg(publish ? "✓ Published!" : "✓ Saved as draft");
      setTimeout(() => setSaveMsg(""), 2000);
      if (publish) onSave();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadImage(file, "covers");
      setCoverUrl(url);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !savedId) return;
    setUploadingGallery(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i], "gallery");
        const img = await addPostImage(savedId, url, "", images.length + i);
        if (img) setImages(prev => [...prev, img]);
      }
    } finally {
      setUploadingGallery(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="admin-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <button className="editor-toolbar-back" onClick={onBack}>← All Posts</button>
        <div className="editor-toolbar-actions">
          {saveMsg && <span className="editor-save-msg">{saveMsg}</span>}
          <button className="editor-btn-draft" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button className="editor-btn-publish" onClick={() => handleSave(true)} disabled={saving}>
            {isPublished ? "Update Post" : "Publish →"}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        {/* Main editor */}
        <div className="editor-main">
          {/* Cover image */}
          <div className="editor-cover-zone">
            {coverUrl ? (
              <div className="editor-cover-preview">
                <img src={coverUrl} alt="Cover" />
                <button className="editor-cover-remove" onClick={() => setCoverUrl("")}>✕</button>
              </div>
            ) : (
              <label className="editor-cover-upload">
                <input type="file" accept="image/*" onChange={handleCoverUpload} hidden />
                {uploadingCover ? "Uploading..." : "＋ Add Cover Image"}
              </label>
            )}
          </div>

          <input
            className="editor-title-input"
            type="text"
            placeholder="Untitled Post"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          {/* Bubble menu */}
          <BubbleMenu editor={editor} className="bubble-menu">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "active" : ""}>B</button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "active" : ""}>I</button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? "active" : ""}>U</button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? "active" : ""}>S</button>
            <button onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive("code") ? "active" : ""}>{"`"}</button>
            <button onClick={() => {
              const url = window.prompt("URL:");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }} className={editor.isActive("link") ? "active" : ""}>🔗</button>
          </BubbleMenu>

          {/* Floating menu for slash commands */}
          <FloatingMenu editor={editor} className="floating-menu">
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>"Quote"</button>
            <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{"</>"} Code</button>
            <button onClick={() => editor.chain().focus().toggleTaskList().run()}>☑ Task</button>
            <button onClick={() => {
              const url = window.prompt("Image URL:");
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}>🖼 Image</button>
            <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>─ Divider</button>
          </FloatingMenu>

          <EditorContent editor={editor} className="editor-content-area" />
        </div>

        {/* Sidebar */}
        <aside className="editor-sidebar">
          <div className="sidebar-section">
            <label className="sidebar-label">Category</label>
            <select className="sidebar-select" value={category} onChange={e => setCategory(e.target.value as Category)}>
              {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cat]) => (
                <option key={key} value={key}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <label className="sidebar-label">URL Slug</label>
            <input
              className="sidebar-input"
              type="text"
              value={slug}
              onChange={e => setSlug(slugify(e.target.value))}
              placeholder="my-post-slug"
            />
            <span className="sidebar-hint">/blog/{slug || "..."}</span>
          </div>

          <div className="sidebar-section">
            <label className="sidebar-label">Excerpt</label>
            <textarea
              className="sidebar-textarea"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Short description..."
              rows={3}
              maxLength={300}
            />
          </div>

          <div className="sidebar-section">
            <label className="sidebar-label sidebar-label-row">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
                className="sidebar-checkbox"
              />
              Published
            </label>
          </div>

          {/* Gallery upload */}
          <div className="sidebar-section">
            <label className="sidebar-label">Photo Album</label>
            {!savedId ? (
              <p className="sidebar-hint">Save the post first to enable album uploads.</p>
            ) : (
              <>
                <label className="gallery-upload-btn">
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} hidden />
                  {uploadingGallery ? "Uploading..." : "＋ Add Photos"}
                </label>
                {images.length > 0 && (
                  <div className="gallery-thumbs">
                    {images.map(img => (
                      <img key={img.id} src={img.url} alt={img.caption ?? ""} className="gallery-thumb" />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

interface DashboardProps {
  posts: Post[];
  onNew: () => void;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
}

function Dashboard({ posts, onNew, onEdit, onDelete }: DashboardProps) {
  const [subCount, setSubCount] = useState<number>(0);

  useEffect(() => {
    getSubscribersCount().then(setSubCount).catch(() => {});
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">✍️ Your Blog</h1>
          <p className="dashboard-sub">
            {posts.length} post{posts.length !== 1 ? "s" : ""} · 📬 {subCount} subscriber{subCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="dashboard-new-btn" onClick={onNew}>＋ New Post</button>
      </div>

      <div className="dashboard-posts">
        {posts.length === 0 ? (
          <div className="dashboard-empty">
            <span className="dashboard-empty-icon">📝</span>
            <p>No posts yet. Write your first one!</p>
            <button className="dashboard-empty-btn" onClick={onNew}>Start Writing</button>
          </div>
        ) : (
          posts.map(post => {
            const cat = CATEGORIES[post.category];
            return (
              <div key={post.id} className="dashboard-post-row">
                <div className="dashboard-post-info">
                  <span className="dashboard-post-cat" style={{ color: cat.color }}>{cat.emoji} {cat.label}</span>
                  <h3 className="dashboard-post-title">{post.title || "Untitled"}</h3>
                  <span className={`dashboard-post-status ${post.is_published ? "published" : "draft"}`}>
                    {post.is_published ? "● Published" : "○ Draft"}
                  </span>
                </div>
                <div className="dashboard-post-actions">
                  <a href={`/blog/${post.slug}`} target="_blank" className="post-view-btn" rel="noreferrer">View</a>
                  <button className="post-edit-btn" onClick={() => onEdit(post)}>Edit</button>
                  <button className="post-delete-btn" onClick={() => {
                    if (window.confirm("Delete this post?")) onDelete(post.id);
                  }}>Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AdminEditor() {
  const auth = useAdminAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPost, setCurrentPost] = useState<Partial<Post> | null>(null);
  const [view, setView] = useState<"dashboard" | "editor">("dashboard");

  useEffect(() => {
    if (auth.user) {
      getAllPosts().then(setPosts).catch(console.error);
    }
  }, [auth.user]);

  const handleNew = () => { setCurrentPost({}); setView("editor"); };
  const handleEdit = (post: Post) => { setCurrentPost(post); setView("editor"); };
  const handleBack = () => { setView("dashboard"); getAllPosts().then(setPosts); };
  const handleDelete = async (id: string) => {
    await deletePost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  if (auth.loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  if (!auth.user) {
    return <LoginScreen {...auth} />;
  }

  if (view === "editor" && currentPost !== null) {
    return <EditorPane post={currentPost} onSave={handleBack} onBack={handleBack} />;
  }

  return <Dashboard posts={posts} onNew={handleNew} onEdit={handleEdit} onDelete={handleDelete} />;
}