import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import { organizationsHandler } from "./organizations";
import { loginHandler } from "./login";
import { notificationshandler } from "./notifications";
import { registerHandler } from "./register";
import { userHandler } from "./user";
import { messagesHandler } from "./messages";
import { prisma } from "./prisma";
import { usersHandler } from "./users";
import { userUpdateHandler } from "./userUpdate";
import { isAdmin } from "./middlewares/isAdmin";
import { userGetHandler } from "./userGetHandler";
import { userDeleteHandler } from "./userDeleteHandler";
import { registerUserHandler } from "./registerUser";
import { pushSubscribeHandler } from "./pushSubscribeHandler";
import { sendWebPushToOrg } from "./pushUtils";
import { userEmailNotificationHandler } from "./userEmailNotificationHandler";
import { uploadImageHandler } from "./uploadImageHandler";
import { emergencyServiceHandler } from "./emergencyServiceHandler";
import { registerDeviceHandler } from "./registerDevice";
import { devicesHandler } from "./devicesHandler";
import { deviceGetHandler } from "./deviceGetHandler";
import { deviceDeleteHandler } from "./deviceDeleteHandler";
import { deviceUpdateHandler } from "./deviceUpdateHandler";
import { isUserOrDevice } from "./middlewares/isUserOrDevice";
import { alertTypeHandler } from "./alertTypeHandler";
import { monitoringAccessHandler } from "./monitoringAccess";
import { adminOrganizationsHandler } from "./adminOrganizations";
import { isSuperAdmin } from "./middlewares/isSuperAdmin";

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "capacitor://localhost",
      "https://localhost",
      "https://redalert.cz",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../../public/uploads"))
);
app.options("*", cors());

app.use(express.json());

// Vytvoření HTTP serveru pro Express
const server = http.createServer(app);

// Vytvoření WebSocket serveru s použitím Socket.io
export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://localhost",
      "capacitor://localhost",
      "https://redalert.cz",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io logika pro připojení a chat
io.on("connection", (socket) => {
  socket.on("joinOrganization", (organizationId: number) => {
    const room = `org-${organizationId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on("sendMessage", async (message) => {
    try {
      const {
        text,
        imageUrl,
        type = "TEXT",
        senderId,
        deviceId,
        organizationId,
      } = message;

      if (!organizationId) {
        console.error("Missing organizationId");
        return;
      }

      const senderIdNum = senderId ? Number(senderId) : null;
      const deviceIdNum = deviceId ? Number(deviceId) : null;

      const hasValidSenderId =
        typeof senderIdNum === "number" && senderIdNum > 0;
      const hasValidDeviceId =
        typeof deviceIdNum === "number" && deviceIdNum > 0;

      if (!hasValidSenderId && !hasValidDeviceId) {
        console.error("Missing valid senderId or deviceId");
        return;
      }

      const savedMessage = await prisma.message.create({
        data: {
          text: type === "TEXT" ? text : null,
          imageUrl: type === "IMAGE" ? imageUrl : null,
          type,
          senderId: senderIdNum || null,
          deviceId: deviceIdNum || null,
          organizationId,
        },
        include: {
          sender: true,
          device: true,
        },
      });

      io.to(`org-${message.organizationId}`).emit("newMessage", savedMessage);

      await sendWebPushToOrg(
        organizationId,
        "Nová zpráva",
        type === "TEXT" ? text : "📷 Obrázek",
        "/chat",
        senderIdNum || undefined,
        deviceIdNum || undefined  
      );

      console.log("Message saved and sent:", savedMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("sendNotification", async (notification) => {
    try {
      const {
        message,
        type = "",
        organizationId,
        userId,
        deviceId,
      } = notification;

      if (!organizationId || (!userId && !deviceId)) {
        console.error(
          "Missing organizationId or sender identifier (userId/deviceId)"
        );
        return;
      }

      const data: {
        message: string;
        type: string;
        organizationId: number;
        triggeredById?: number;
        triggeredByDeviceId?: number;
      } = {
        message: message ?? "",
        type: type || "",
        organizationId: Number(organizationId),
      };

      if (userId) {
        data.triggeredById = Number(userId);
      } else if (deviceId) {
        data.triggeredByDeviceId = Number(deviceId);
      }

      const savedNotification = await prisma.notification.create({ data });

      io.to(`org-${organizationId}`).emit("newNotification", savedNotification);

      console.log("Notification saved and sent:", savedNotification);
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Definice API rout pro Express
app
  .route("/api/organizations")
  .post(isUserOrDevice, organizationsHandler)
  .get(isUserOrDevice, organizationsHandler);

app
  .route("/api/notifications")
  .get(isUserOrDevice, notificationshandler)
  .post(isUserOrDevice, notificationshandler);

app
  .route("/api/messages")
  .get(isUserOrDevice, messagesHandler)
  .post(isUserOrDevice, messagesHandler);

app.post("/api/messages/image", isUserOrDevice, uploadImageHandler);

app.get("/api/user", isUserOrDevice, userHandler);
app.get("/api/users", isAdmin, usersHandler);

app.post("/api/login", loginHandler);
app.post("/api/register", registerHandler);

app.post("/api/push/subscribe", isUserOrDevice, pushSubscribeHandler);

app.get("/api/alert-types", isUserOrDevice, alertTypeHandler);
app.post("/api/alert-types", isAdmin, alertTypeHandler);
app.put("/api/alert-types", isAdmin, alertTypeHandler);
app.delete("/api/alert-types", isAdmin, alertTypeHandler);

app.use('/api/monitoring-access', monitoringAccessHandler);

app.get("/api/adminOrganizations", adminOrganizationsHandler);
app.post("/api/adminOrganizations", isSuperAdmin, adminOrganizationsHandler);
app.put("/api/adminOrganizations", isSuperAdmin, adminOrganizationsHandler);
app.delete("/api/adminOrganizations", isSuperAdmin, adminOrganizationsHandler);

app.get("/api/emergency-services", isUserOrDevice, emergencyServiceHandler);
app.post("/api/emergency-services", isAdmin, emergencyServiceHandler);
app.put("/api/emergency-services", isAdmin, emergencyServiceHandler);
app.delete("/api/emergency-services", isAdmin, emergencyServiceHandler);

app.get("/api/devices", isAdmin, devicesHandler);
app
  .route("/api/devices/:id")
  .get(isAdmin, deviceGetHandler)
  .delete(isAdmin, deviceDeleteHandler)
  .put(isAdmin, deviceUpdateHandler);

app
  .route("/api/users/:id")
  .get(isAdmin, userGetHandler)
  .delete(isAdmin, userDeleteHandler)
  .put(isAdmin, userUpdateHandler);

app.post("/api/register-user", isAdmin, registerUserHandler);
app.post("/api/register-device", isAdmin, registerDeviceHandler);
app.put(
  "/api/user/email-notifications",
  isUserOrDevice,
  userEmailNotificationHandler
);

// Nastavení portu a spuštění serveru
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
