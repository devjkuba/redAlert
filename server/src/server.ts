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

const app = express();
app.use(cors());
app.use(express.json());

// Vytvoření HTTP serveru pro Express
const server = http.createServer(app);

// Vytvoření WebSocket serveru s použitím Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "capacitor://localhost"], // Odkud mohou pocházet připojení (frontend URL)
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

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Definice API rout pro Express
app.route('/api/organizations')
   .post(organizationsHandler)
   .get(organizationsHandler); 

app.route('/api/notifications')
   .get(notificationshandler)
   .post(notificationshandler);

app.route('/api/messages')
   .get(messagesHandler)
   .post(messagesHandler);

app.get('/api/user', userHandler);
app.post('/api/login', loginHandler);
app.post('/api/register', registerHandler);

// Nastavení portu a spuštění serveru
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
