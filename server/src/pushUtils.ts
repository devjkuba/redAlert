import { prisma } from "./prisma";
import webpush from "web-push";

const vapidKeys = {
  publicKey: process.env.PUBLIC_KEY ?? "",
  privateKey: process.env.PRIVATE_KEY ?? "",
};

webpush.setVapidDetails(
  "mailto:redalert@cyberdev.cz",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function sendWebPushToOrg(
  organizationId: number,
  title: string,
  body: string
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      user: {
        organizationId,
        isActive: true,
      },
    },
  });

  const payload = JSON.stringify({ title, body });

  const pushPromises = subscriptions.map((sub) =>
    webpush
      .sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.keysAuth,
            p256dh: sub.keysP256dh,
          },
        },
        payload
      )
      .catch((err) => {
        console.error("WebPush error for user:", sub.userId, err);
      })
  );

  await Promise.all(pushPromises);
}
