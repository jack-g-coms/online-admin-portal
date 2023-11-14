const express = require('express');
const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server);

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const fs = require('fs');
const cors = require('cors');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://reqbin.com'],
    credentials: true,
    exposedHeaders: ['set-cookie']
}));
app.use(cookieParser());
server.listen(5000, () => {
    console.log('Server Started Listening on Port 5000');
});

process.Server = app;
process.IO = io;

fs.readdir('./server/API', (err, files) => {
    const jsFile = files.filter(f => f.split('.').pop() === 'js');
    if (jsFile.length <= 0) { return };

    jsFile.forEach((f, i) => {
        require(`./API/${f}`);
    });
});