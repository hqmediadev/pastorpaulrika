import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

// Ensure upload and data directories exist
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'videos');
const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });

const TRIBUTES_FILE = path.join(DATA_DIR, 'tributes.json');

// Helper to read tributes
function getTributesFromFile(): any[] {
  try {
    if (fs.existsSync(TRIBUTES_FILE)) {
      const content = fs.readFileSync(TRIBUTES_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading tributes file:', err);
  }
  return [];
}

// Helper to save tributes
function saveTributesToFile(tributes: any[]) {
  try {
    fs.writeFileSync(TRIBUTES_FILE, JSON.stringify(tributes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving tributes file:', err);
  }
}

// Multer storage config on VPS disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `pastor-paul-rika-tribute-${Date.now()}-${cleanName}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded videos statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API ROUTES ---

// 1. Direct VPS Video Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    return res.json({
      success: true,
      url: videoUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message || 'Failed to save video on server' });
  }
});

// 2. Tributes API (Get / Save / Delete)
app.get('/api/tributes', (_req, res) => {
  const tributes = getTributesFromFile();
  res.json({ tributes });
});

app.post('/api/tributes', (req, res) => {
  const newTribute = req.body;
  if (!newTribute || !newTribute.id) {
    return res.status(400).json({ error: 'Invalid tribute payload' });
  }
  const tributes = getTributesFromFile();
  const existingIdx = tributes.findIndex((t: any) => t.id === newTribute.id);
  if (existingIdx >= 0) {
    tributes[existingIdx] = newTribute;
  } else {
    tributes.unshift(newTribute);
  }
  saveTributesToFile(tributes);
  res.json({ success: true, tribute: newTribute });
});

// 3. Admin Verification
app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, message: 'Admin authenticated' });
  }
  return res.status(401).json({ success: false, error: 'Incorrect admin password' });
});

// 4. Admin-Only Delete
app.delete('/api/tributes/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  const adminSecret = req.headers['x-admin-password'];
  
  if (adminSecret !== ADMIN_PASSWORD && authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(403).json({ error: 'Unauthorized: Admin access required' });
  }

  const { id } = req.params;
  const tributes = getTributesFromFile();
  const tributeToDelete = tributes.find((t: any) => t.id === id);

  if (!tributeToDelete) {
    return res.status(404).json({ error: 'Tribute not found' });
  }

  // If tribute has a server file, optionally remove from disk
  if (tributeToDelete.videoUrl && tributeToDelete.videoUrl.startsWith('/uploads/videos/')) {
    const filename = path.basename(tributeToDelete.videoUrl);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Failed to delete file from disk:', e);
      }
    }
  }

  const updated = tributes.filter((t: any) => t.id !== id);
  saveTributesToFile(updated);

  res.json({ success: true, message: 'Tribute deleted successfully', id });
});

// 5. Admin-Only Video Download
app.get('/api/admin/download/:filename', (req, res) => {
  const password = req.query.key;
  if (password !== ADMIN_PASSWORD) {
    return res.status(403).send('Unauthorized: Only Admin can download videos.');
  }

  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Video file not found');
  }

  res.download(filePath, filename);
});

// Setup Vite middlewares in dev or serve dist in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
