const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const users = {}; // Store users and their connections

app.use(express.static('public'));

wss.on('connection', (ws) => {
    let userId;

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'register') {
            userId = data.userId;
            users[userId] = ws; // Save the connection
            return;
        }

        // Handle messages between users
        if (data.type === 'message') {
            const recipientWs = users[data.recipientId];
            if (recipientWs) {
                recipientWs.send(JSON.stringify({ type: 'message', text: data.text, from: userId }));
            }
        }
    });

    ws.on('close', () => {
        if (userId) {
            delete users[userId]; // Remove user on disconnect
        }
    });
});

server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000');
});
