import DreamAPI from './server';

const api = new DreamAPI();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return api.generateDream(req, res);
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 