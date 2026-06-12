import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://jsonplaceholder.typicode.com/posts";

function App() {
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({ title: "", body: "" });
  const [editingPostId, setEditingPostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}?_limit=6`);

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const createPost = async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        title: formData.title,
        body: formData.body,
        userId: 1,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    const newPost = await response.json();
    setPosts([{ ...newPost, id: Date.now() }, ...posts]);
  };

  const updatePost = async () => {
    const response = await fetch(`${API_URL}/${editingPostId}`, {
      method: "PUT",
      body: JSON.stringify({
        id: editingPostId,
        title: formData.title,
        body: formData.body,
        userId: 1,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    const updatedPost = await response.json();

    setPosts(
      posts.map((post) =>
        post.id === editingPostId ? { ...post, ...updatedPost } : post
      )
    );

    setEditingPostId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.body.trim()) return;

    try {
      setLoading(true);
      setError("");

      if (editingPostId) {
        await updatePost();
      } else {
        await createPost();
      }

      setFormData({ title: "", body: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setFormData({
      title: post.title,
      body: post.body,
    });
  };

  const deletePost = async (postId) => {
    try {
      setLoading(true);
      setError("");

      await fetch(`${API_URL}/${postId}`, {
        method: "DELETE",
      });

      setPosts(posts.filter((post) => post.id !== postId));
    } catch {
      setError("Unable to delete post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <section className="hero">
        <h1>REST API Post Manager</h1>
        <p>
          Task 4 - Demonstrating GET, POST, PUT, and DELETE API requests with
          React.
        </p>
      </section>

      <form className="post-form" onSubmit={handleSubmit}>
        <h2>{editingPostId ? "Update Post" : "Create Post"}</h2>

        <input
          type="text"
          name="title"
          placeholder="Post title"
          value={formData.title}
          onChange={handleChange}
        />

        <textarea
          name="body"
          placeholder="Post body"
          value={formData.body}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {editingPostId ? "Update Post" : "Create Post"}
        </button>
      </form>

      {loading && <p className="status">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <section className="posts-grid">
        {posts.map((post) => (
          <article className="post-card" key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.body}</p>

            <div className="post-actions">
              <button onClick={() => startEdit(post)}>Edit</button>
              <button className="delete-btn" onClick={() => deletePost(post.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;