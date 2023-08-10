import http from 'http';
import express, { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import config from './config';
import SocketService from './shared/service/socket/socket.service';
import { errorHandler } from './shared/composables/middleware';
import swaggerDocs from './shared/service/swagger/swagger';

const app: Express = express();
const httpServer = http.createServer(app);
const { PORT, IS_PRODUCTION, CORS } = config;

new SocketService(httpServer);

// SERVER SETTINGS
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: CORS, credentials: true }));

if (IS_PRODUCTION) {
  app.use(express.static('public'));
}

// SET ROUTES
import { equipmentRoute } from './api/equipment/equipment.route';
import { authRoutes } from './api/auth/auth.route';
import { userRoutes } from './api/user/user.route';
import { notificationRoutes } from './api/notification/notification.route';
import { jobRoute } from './api/job/job.route';
import { employeeRoute } from './api/employee/employee.route';
import { locationRoutes } from './api/location/location.route';
import { currencyRoutes } from './api/currency/currency.route';
import { mediaRoutes } from './api/media/media.route';
import { chatRoutes } from './api/chat/chat.routes';
import FirebaseService from './shared/service/googleapis/firebase.service';
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/job', jobRoute);
app.use('/api/employee', employeeRoute);
app.use('/api/location', locationRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/equipment', equipmentRoute);
app.use('/api/media', mediaRoutes);
app.use('/api/chat', chatRoutes);
app.use('*', errorHandler);

// START SERVER
httpServer.listen(PORT, () => {
  console.log('Server is running', `${IS_PRODUCTION ? 'Production' : 'Development'} mode`, `Address: http://localhost:${PORT}`);
});

export const firebaseService = new FirebaseService();

if (!IS_PRODUCTION) {
  swaggerDocs(app);
  console.log(`Docs available at http://localhost:${PORT}/docs`);
}
