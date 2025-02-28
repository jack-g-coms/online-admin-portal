const express = require('express');
const app = express();
const server = require('http').createServer(app);
const dotenv = require('dotenv');
const config = require('./config.json');

const DiscordModerationService = require('./Services/DiscordModerationService');

const io = require('socket.io')(server, {
    path: '/api/gateway'
});

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const fs = require('fs');
const cors = require('cors');
const path = require('path');

dotenv.config({
    path: __dirname + "/.env"
});
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors({
    origin: [`https://${config.communityName}portal.communityshield.app`, 'http://localhost:3000', 'https://communityshield.app'],
    credentials: true,
    exposedHeaders: ['set-cookie']
}));
app.use(cookieParser());
server.listen(5051, () => {
    console.log('Server Started Listening on Port 5051');
});

process.Server = app;

process.io = io;
require('./SocketRouter');

fs.readdir(`${__dirname}/API`, (err, files) => {
    const jsFile = files.filter(f => f.split('.').pop() === 'js');
    if (jsFile.length <= 0) { return };

    jsFile.forEach((f, i) => {
        require(`./API/${f}`);
    });
});

setInterval(async () => {
    DiscordModerationService.getActiveModerations()
        .then(async moderations => {
            for (var i = 0; i < moderations.length; i++) {
                const moderation = moderations[i];
                if ((moderation.extraInfo.expires && moderation.extraInfo.expires <= Math.round(Date.now() / 1000))) {
                    console.log('remove moderation: ' + moderation.moderationID)
                    process.io.to('Automation').emit('deactivateDiscordModeration', moderation);
                }
            }
        }).catch((err) => {
            console.log('Moderation loop failed: ' + err);
        });
}, 10000);