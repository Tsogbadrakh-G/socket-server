const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3001 });
const admin = require("firebase-admin");
const { createServer } = require("node:http");

const hostname = "192.168.4.28";
//"192.168.4.28";
const port = 3000;
const serviceAccount = require("./chat-app-secure-firebase-adminsdk-ic9nr-5ae6b63ca6.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const server = createServer((req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.statusCode = 200;
  if (req.url === "/" && req.method === "GET") {
    console.log(`url: ${req.body}`);

    var title = "title";
    var body = "body";
    var token =
      "e_RBWlTrQjqtvZfn5bf_bv:APA91bEUSt3AU71FH33fyq2dsXovzgO34dGR86P-b4SGFkLQ76a1XUlIeV-ozxr2kXIP-cvFfkpUNFsn1CXLxA12TFDI11gcnV1mmijx5KOv71i-kTgP-Vw";
    const message = {
      notification: {
        title,
        body,
      },
      android: {
        notification: {
          channel_id: "MESSAGE_CHANNEL", // *
          icon: "message_icon", // *
          tag: "message", // *
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "chime.caf",
          },
        },
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK", // *
        type: "MESSAGE", // *
      },
      token,
    };
    admin.messaging().send(message);
    res.end("Hello World\n");
  }
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  wss.on("connection", (ws) => {
    console.log("New client connected, total clients: ");
    ws.on("message", (message) => {
      console.log(`sending message to client: ${message}`);
      // Broadcast received message to all connected clients
      wss.clients.forEach((client) => {
        console.log(
          `expression: ${client.readyState === WebSocket.OPEN}, client: ${
            client !== ws
          }`
        );
        if (
          //client !== ws &&
          client.readyState === WebSocket.OPEN
        ) {
          client.send(message.toString() + "");
        }
      });
    });
  });
});
