import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase on server using standard SDK
// Trying both bucket formats just in case
const storageBucket = firebaseConfig.storageBucket || `${firebaseConfig.projectId}.appspot.com`;
const firebaseApp = initializeApp({
  ...firebaseConfig,
  storageBucket: storageBucket
});
const storage = getStorage(firebaseApp);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Configure Multer
  const upload = multer({ dest: 'uploads/' });

  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const fileName = req.file.originalname;
      const fileBuffer = fs.readFileSync(filePath);
      const uint8Array = new Uint8Array(fileBuffer);

      // Try uploading to a specific path
      const storageRef = ref(storage, `data-files/${Date.now()}_${fileName}`);
      
      console.log(`Server: Uploading to bucket: ${storageBucket}`);
      const uploadResult = await uploadBytes(storageRef, uint8Array, {
        contentType: req.file.mimetype || 'application/octet-stream',
      });
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      fs.unlinkSync(filePath);
      res.json({ url: downloadURL, name: fileName });
    } catch (error: any) {
      console.error('DETAILED SERVER ERROR:', error);
      // Send back a more descriptive error to the UI
      const errorMessage = error.code === 'storage/unauthorized' 
        ? 'Firebase Storage Rules are blocking the upload. Please check your Firebase Console.'
        : error.message || 'Unknown server error';
      res.status(500).json({ error: errorMessage });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
