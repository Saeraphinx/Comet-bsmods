import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { HTTPTools } from './API/classes/HTTPTools';
import { DatabaseManager } from './Database/Database';
import path from 'path';
import { server, devmode } from '../storage/config.json';
import fileUpload from 'express-fileupload';

console.log(`Starting setup...`);
const app = express();
const memstore = MemoryStore(session);
const port = server.port;
new DatabaseManager();

app.use(express.json({ limit: 100000 }));
app.use(express.urlencoded({limit : 10000, parameterLimit: 10 }));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  }));
app.use(session({
    secret: server.sessionSecret,
    name: `session`,
    store: new memstore({
        checkPeriod: 86400000
    }),
    resave: false,
    saveUninitialized: false,
    unset: `destroy`,
    cookie: {
        maxAge: 86400000,
        secure: false,
        httpOnly: true,
        sameSite: `strict`
    }
}));

app.get(`/pinkcute`, (req, res) => {
    res.send({ message: `pink cute` });
});

app.get(`/`, (req, res) => {
    res.sendFile(path.resolve(`./assets/index.html`));
});

app.get(`/success`, (req, res) => {
    res.sendFile(path.resolve(`./assets/success.html`));
});

//new SubmissionRoutes(app);
//new BeatLeaderAuthRoutes(app);
//new MiscRoutes(app);

HTTPTools.handleExpressShenanigans(app);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    if (devmode) {
        console.log(`Running in devmode!`);
        //console.log(`http://localhost:${port}/ft/upload.html`);
        //console.log(`http://localhost:${port}/api/auth/discord/login`);
        //console.log(`http://localhost:${port}/api/auth/beatleader/login`);
        //console.log(`http://localhost:${port}/api/user`);
        //console.log(`http://localhost:${port}/api/posts`);
    }
});
console.log(`Setup complete.`);