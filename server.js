const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3001 });
const admin = require("firebase-admin");

const hostname = "192.168.4.28";
require("dotenv").config();
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountPath) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set"
  );
}

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const bodyParser = require("body-parser");
const express = require("express");
const app = express();
require("express");

//
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Endpoint to handle POST requests
app.get("/home", (req, res) => {
  res.status(200).send("hello server");
});

// Endpoint to handle POST requests
app.post("/", (req, res) => {
  const { fcm, message, sender_username } = req.body;

  console.log("FCM:", fcm);
  console.log("Message:", message);
  console.log("Sender Username:", sender_username);

  var title = sender_username;
  var body = message;
  var token = fcm;

  const Message = {
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
      type: "MESSAGE",
      username: sender_username, // *
    },
    token,
  };
  if (fcm !== "" && fcm !== null) {
    admin.messaging().send(Message);
  }

  res.status(200).send("FCM token received");
});

app.listen(port, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
  wss.on("connection", (ws) => {
    console.log("New client connected, total clients: ");
    ws.on("message", (message) => {
      console.log(`sending message to client: ${message}`);
      // Broadcast received message to all connected clients
      wss.clients.forEach((client) => {
        // console.log(
        //   `expression: ${client.readyState === WebSocket.OPEN}, client: ${
        //     client !== ws
        //   }`
        //);
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
