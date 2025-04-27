const API_URL = 'http://your-ec2-public-ip:3000/api/albums'; // Update this

// Detect which page we're on
const path = window.location.pathname;

// Home (List albums)
if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
  const albumList = document.getElementById('albumList');

  async function fetchAlbums() {
    try {
      const res = await fetch(API_URL);
      const albums = await res.json();
      albumList.innerHTML = '';

      albums.forEach(album => {
        const div = document.createElement('div');
        div.className = 'col-md-4 mb-4';
        div.innerHTML = `
          <div class="card h-100">
            <img src="${album.cover_url}" class="card-img-top" alt="${album.title}">
            <div class="card-body">
              <h5 class="card-title">${album.title} - ${album.artist}</h5>
              <p class="card-text">$${album.price}</p>
              <a href="edit.html?id=${album.id}" class="btn btn-warning me-2">Edit</a>
              <button class="btn btn-danger" onclick="deleteAlbum(${album.id})">Delete</button>
            </div>
          </div>
        `;
        albumList.appendChild(div);
      });
    } catch (error) {
      console.error('Fetch albums error:', error);
      albumList.innerHTML = 'Failed to load albums.';
    }
  }

  async function deleteAlbum(id) {
    if (!confirm('Are you sure you want to delete this album?')) return;

    try {
      const response = await fetch(`${API_URL}/delete/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchAlbums();
      } else {
        alert('Failed to delete album.');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  }

  window.deleteAlbum = deleteAlbum; // Expose to global
  fetchAlbums();
}

// Create Album
if (path.includes('create.html')) {
  const albumForm = document.getElementById('albumForm');
  const responseMessage = document.getElementById('responseMessage');

  albumForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(albumForm);

    try {
      const response = await fetch(`${API_URL}/add`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        responseMessage.textContent = 'Album uploaded successfully!';
        responseMessage.style.color = 'green';
        albumForm.reset();
      } else {
        responseMessage.textContent = result.message || 'Upload failed.';
        responseMessage.style.color = 'red';
      }
    } catch (error) {
      console.error('Upload error:', error);
      responseMessage.textContent = 'Server error.';
      responseMessage.style.color = 'red';
    }
  });
}

// Edit Album
if (path.includes('edit.html')) {
  const urlParams = new URLSearchParams(window.location.search);
  const albumId = urlParams.get('id');

  const editForm = document.getElementById('editForm');
  const editTitle = document.getElementById('editTitle');
  const editArtist = document.getElementById('editArtist');
  const editPrice = document.getElementById('editPrice');

  async function fetchAlbumDetails() {
    try {
      const res = await fetch(API_URL);
      const albums = await res.json();
      const album = albums.find(a => a.id == albumId);

      if (!album) {
        alert('Album not found');
        window.location.href = 'index.html';
        return;
      }

      editTitle.value = album.title;
      editArtist.value = album.artist;
      editPrice.value = album.price;
    } catch (error) {
      console.error('Fetch album error:', error);
    }
  }

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = editTitle.value;
    const artist = editArtist.value;
    const price = editPrice.value;

    try {
      const response = await fetch(`${API_URL}/update/${albumId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, artist, price })
      });

      if (response.ok) {
        window.location.href = 'index.html';
      } else {
        alert('Failed to update album.');
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  });

  fetchAlbumDetails();
}
