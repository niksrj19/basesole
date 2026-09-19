import type { NextApiRequest, NextApiResponse } from 'next';
import { expressApp } from '../../server/express-app.ts';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return expressApp(req, res);
}
