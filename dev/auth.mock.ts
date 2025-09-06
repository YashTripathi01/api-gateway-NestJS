import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || '';

// Simple in-memory users
const users = {
  admin: {
    userId: '1',
    role: 'admin',
    permissions: ['service1.*'],
  },
  user: {
    userId: '2',
    role: 'user',
    permissions: ['service1.resource.read'],
  },
};

// Login endpoint
app.post('/login', (req, res) => {
  const { username } = req.body;
  const user = users[username];
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = {
    sub: user.userId,
    role: user.role,
    permissions: user.permissions,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Protected endpoint
app.get('/me', (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json(decoded);
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

const PORT = process.env.AUTH_PORT || 4000;
app.listen(PORT, () =>
  console.log(`Mock Auth Service running at http://localhost:${PORT}`),
);
