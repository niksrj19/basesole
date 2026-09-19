import next from 'next';
import { expressApp } from './server/express-app.ts';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = Number(process.env.PORT) || 3000;
const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  expressApp.all('*', (req, res) => handle(req, res));
  expressApp.listen(port, hostname, () => {
    console.log(`SoleVault Next.js server running on http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Failed to start Next.js server:', error);
  process.exit(1);
});
