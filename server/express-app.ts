import dotenv from 'dotenv';
import express from 'express';
import { apiRouter } from './routes/index.ts';

dotenv.config();

export function createExpressApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use('/api', apiRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get(['/api/auth/callback/google', '/auth/callback', '/auth/callback/'], (_req, res) => {
    res.type('html').send(`<!DOCTYPE html>
<html>
  <head>
    <title>Google OAuth Authorization</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
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
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', code, error }, '*');
          setTimeout(function() { window.close(); }, 600);
        } else {
          window.location.href = '/#/login?oauth_code=' + encodeURIComponent(code || '');
        }
      })();
    </script>
  </body>
</html>`);
  });

  return app;
}

export const expressApp = createExpressApp();
