import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/index.ts';

dotenv.config({ override: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parser
  app.use(express.json({ limit: '10mb' }));

  // API routes FIRST
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // OAuth 2.0 Callback handler for Google OAuth popup
  app.get(
    ['/api/auth/callback/google', '/auth/callback', '/auth/callback/'],
    (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>Google OAuth Authorization</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #1e293b; }
      .card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; max-width: 400px; border: 1px solid #e2e8f0; }
      .spinner { border: 3px solid #f1f5f9; border-top: 3px solid #2563eb; border-radius: 50%; width: 36px; height: 36px; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="spinner"></div>
      <h2 style="font-size: 18px; margin: 0 0 8px;">Authenticating with Google...</h2>
      <p style="font-size: 13px; color: #64748b; margin: 0;">Connecting your account to SoleVault. This window will close automatically.</p>
    </div>
    <script>
      (function() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', code: code, error: error }, '*');
          setTimeout(function() { window.close(); }, 600);
        } else {
          window.location.href = '/#/login?oauth_code=' + encodeURIComponent(code || '');
        }
      })();
    </script>
  </body>
</html>`);
    }
  );

  // Vite middleware for development or static serving for production
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
    console.log(`SoleVault server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
