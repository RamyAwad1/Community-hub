require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { authenticateToken, authorizeRole } = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes.js')(pool);
const usersRoutes = require('./routes/users.routes.js')(pool);
const eventsRoutes = require('./routes/events.routes.js')(pool);
const adminRoutes = require('./routes/admin.routes.js')(pool);

app.get('/', (req, res) => {
  res.send('Welcome to the Community Hub Backend API!');
});

app.use('/api/auth', authRoutes);

app.use('/api/users', authenticateToken, usersRoutes);

app.use('/api/events', eventsRoutes);

app.use('/api/admin', authenticateToken, authorizeRole(['admin']), adminRoutes);

app.get('/api/admin-only', authenticateToken, authorizeRole(['admin']), (req, res) => {
    res.json({ message: `Welcome, admin! DB ID: ${req.user.user_id}.` });
});
app.get('/health', (req, res) => {
  res.status(200).send('Backend is healthy!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});