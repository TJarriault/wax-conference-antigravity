document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeIcon = themeToggleBtn.querySelector('.theme-icon');
  
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // Fetch and render posts
  fetchPosts();
  fetchComments();

  // Comment form handler
  const commentForm = document.getElementById('commentForm');
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const author = document.getElementById('authorInput').value.trim();
    const comment = document.getElementById('commentInput').value.trim();

    if (!author || !comment) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: 1, author, comment })
      });

      if (response.ok) {
        document.getElementById('authorInput').value = '';
        document.getElementById('commentInput').value = '';
        fetchComments();
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  });
});

async function fetchPosts() {
  const postsGrid = document.getElementById('postsGrid');
  try {
    const response = await fetch('/api/posts');
    const posts = await response.json();

    postsGrid.innerHTML = posts.map(post => `
      <article class="post-card">
        <img src="${post.image}" alt="${post.title}" class="post-img">
        <div class="post-body">
          <div class="post-meta">
            <span class="post-category">${post.category}</span>
            <span class="post-date">${post.date}</span>
          </div>
          <h3 class="post-title">${post.title}</h3>
          <p class="post-summary">${post.summary}</p>
          <div class="post-author" style="font-size: 0.85rem; color: var(--text-muted);">
            By ${post.author}
          </div>
        </div>
      </article>
    `).join('');
  } catch (err) {
    console.error('Failed to fetch posts:', err);
    postsGrid.innerHTML = `<p style="text-align: center; color: var(--text-muted);">Unable to load articles.</p>`;
  }
}

async function fetchComments() {
  const commentsList = document.getElementById('commentsList');
  try {
    const response = await fetch('/api/comments?postId=1');
    const comments = await response.json();

    if (!comments || comments.length === 0) {
      commentsList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">Be the first to leave a comment!</p>`;
      return;
    }

    commentsList.innerHTML = comments.map(c => {
      const dateStr = new Date(c.created_at || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return `
        <div class="comment-item">
          <div class="comment-meta">
            <span class="comment-author">${escapeHtml(c.author)}</span>
            <span class="comment-date">${dateStr}</span>
          </div>
          <p class="comment-text">${escapeHtml(c.comment)}</p>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to fetch comments:', err);
  }
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
}
