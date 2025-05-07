import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import { organizationsHandler } from './organizations';
import { loginHandler } from './login';
import { notificationshandler } from './notifications';
import { registerHandler } from './register';
import { userHandler } from './user';
import { messagesHandler } from './messages';
import { prisma } from './prisma';
import { usersHandler } from './users';
import { userUpdateHandler } from './userUpdate';
import { isAdmin } from './middlewares/isAdmin';
import { isUser } from './middlewares/isUser';
import { userGetHandler } from './userGetHandler';
import { userDeleteHandler } from './userDeleteHandler';
import { registerUserHandler } from './registerUser';

const app = express();
app.use(cors({
  origin: [
    "http://localhost:3000",
    "capacitor://localhost",
    "https://redalert.onrender.com",
    "https://redalert.cyberdev.cz",
  ],
  credentials: true,
}));
app.use(express.json());

// Vytvoření HTTP serveru pro Express
const server = http.createServer(app);

// Vytvoření WebSocket serveru s použitím Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://localhost", "capacitor://localhost", "https://redalert.onrender.com", "https://redalert.cyberdev.cz"], // Odkud mohou pocházet připojení (frontend URL)
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],  // Specifikujte hlavičky, které jsou povolené
    credentials: true, // Umožní přenos cookies (pokud používáte autentizaci na serveru)
  },
});

// Socket.io logika pro připojení a chat
io.on('connection', (socket) => {
  console.log('A user connected');

  // Posílání zpráv mezi klienty a ukládání zpráv do databáze
  socket.on('sendMessage', async (message) => {
    try {
      // Uložení zprávy do databáze
      const savedMessage = await prisma.message.create({
        data: {
          text: message.text,
          senderId: message.senderId,
          organizationId: message.organizationId,
        },
      });

      // Odeslání uložené zprávy všem připojeným uživatelům
      io.emit('newMessage', savedMessage);

      console.log('Message saved and sent:', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('sendNotification', async (notification) => {
    try {
      const savedNotification = await prisma.notification.create({
        data: {
          message: notification.message,
          type: notification.type || '',
          triggeredBy: notification.triggeredBy || 'system',
          organization: notification.organization || 'defaultOrganization',
          ...(notification.userId ? { userId: notification.userId } : {}),
        },
      });

      io.emit('newNotification', savedNotification);

      console.log('Notification saved and sent:', savedNotification);
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Definice API rout pro Express
app.route('/api/organizations')
   .post(isUser, organizationsHandler)
   .get(isUser, organizationsHandler);

app.route('/api/notifications')
   .get(isUser, notificationshandler)
   .post(isUser, notificationshandler);

app.route('/api/messages')
   .get(isUser, messagesHandler)
   .post(isUser, messagesHandler);

app.get('/api/user', isUser, userHandler);
app.get('/api/users', isUser, usersHandler);

app.post('/api/login', loginHandler);
app.post('/api/register', registerHandler);

app.route('/api/users/:id')
  .get(isAdmin, userGetHandler)  
  .delete(isAdmin, userDeleteHandler)
  .put(isAdmin, userUpdateHandler);

app.post('/api/register-user', isAdmin, registerUserHandler);

// Nastavení portu a spuštění serveru
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
