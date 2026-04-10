const express = require('express');
const webpush = require('web-push');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

let subscriptions = [];
let lastContent = "";

// Generate keys ONCE and replace here after first run
const vapidKeys = webpush.generateVAPIDKeys();
console.log("Public Key:", vapidKeys.publicKey);
console.log("Private Key:", vapidKeys.privateKey);

webpush.setVapidDetails(
  'mailto:test@test.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  res.sendStatus(201);
});

setInterval(async () => {
  try {
    const res = await fetch('http://vgim.jelgava.lv/lv/par-skolu/stundu-izmainas');
    const text = await res.text();

    if (text !== lastContent) {
      lastContent = text;

      subscriptions.forEach(sub => {
        webpush.sendNotification(sub, JSON.stringify({
          title: "Jaunas izmaiņas!",
          body: "Stundu izmaiņas ir atjauninātas"
        }));
      });
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}, 5 * 60 * 1000);

app.listen(3000, () => console.log("Server running on port 3000"));
