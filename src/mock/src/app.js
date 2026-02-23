import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import applicationRoutes from './routes/applications.js';
import aiAuditRoutes from './routes/aiAudits.js';
import reviewRoutes from './routes/reviews.js';
import teacherRoutes from './routes/teacher.js';
import archiveRoutes from './routes/archives.js';
import fileRoutes from './routes/files.js';
import notificationRoutes from './routes/notifications.js';
import systemRoutes from './routes/system.js';
import announcementRoutes from './routes/announcements.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/ai-audits', aiAuditRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/teacher', teacherRoutes);
app.use('/api/v1/archives', archiveRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/announcements', announcementRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Mock API server is running on http://localhost:${PORT}`);
});