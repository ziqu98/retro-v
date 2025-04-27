const express = require('express');
const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');
const multer = require('multer');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create Album
app.post('/api/albums/add', upload.single('cover'), async (req, res) => {
  try {
    const { title, artist, price } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'Album cover is required' });

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `albums/${uuidv4()}${path.extname(file.originalname)}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploadResult = await s3.upload(s3Params).promise();
    const coverUrl = uploadResult.Location;

    const [result] = await db.execute(
      'INSERT INTO albums (title, artist, price, cover_url) VALUES (?, ?, ?, ?)',
      [title, artist, price, coverUrl]
    );

    res.status(201).json({ message: 'Album added', albumId: result.insertId });
  } catch (error) {
    console.error('Error adding album:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Read All Albums
app.get('/api/albums', async (req, res) => {
  try {
    const [albums] = await db.execute('SELECT * FROM albums ORDER BY id DESC');
    res.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Album
app.put('/api/albums/update/:id', async (req, res) => {
  try {
    const { title, artist, price } = req.body;
    const { id } = req.params;

    const [result] = await db.execute(
      'UPDATE albums SET title = ?, artist = ?, price = ? WHERE id = ?',
      [title, artist, price, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Album not found' });
    }

    res.json({ message: 'Album updated' });
  } catch (error) {
    console.error('Error updating album:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Album
app.delete('/api/albums/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get album info before deleting
    const [albums] = await db.execute('SELECT cover_url FROM albums WHERE id = ?', [id]);
    if (albums.length === 0) {
      return res.status(404).json({ message: 'Album not found' });
    }
    const coverUrl = albums[0].cover_url;

    // Extract the key from the S3 URL
    const urlParts = coverUrl.split('/');
    const key = decodeURIComponent(urlParts.slice(3).join('/'));

    // Delete from S3
    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }).promise();

    // Delete from DB
    await db.execute('DELETE FROM albums WHERE id = ?', [id]);

    res.json({ message: 'Album deleted' });
  } catch (error) {
    console.error('Error deleting album:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
