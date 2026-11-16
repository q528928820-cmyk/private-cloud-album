
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  album_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  cloud_public_id TEXT NOT NULL,
  cloud_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
