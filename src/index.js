import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';

const app = express();

app.use(cors());
app.use(express.json());

const participants = [];
const messages = [];
const names = [];

app.post('/participants', (req, res) => {
    let newParticipant = req.body;
    newParticipant.lastStatus = Date.now();
    if (!names.includes(req.body.name)) {
        names.push(req.body.name);
        participants.push(newParticipant);
        messages.push({
            from: req.body.name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('H:m:s'),
        });
        res.sendStatus(200);
        return;
    } else {
        res.sendStatus(400);
        return;
    }
});

app.get('/participants', (req, res) => {
    res.send(participants);
});

app.get('/messages', (req, res) => {
    const limit = req.query.limit;
    const filterMessages = messages.filter((m, i) => {
        return m.to === 'Todos' || m.to === req.headers.user;
    });
    res.send(filterMessages.slice(-limit));
});

app.post('/messages', (req, res) => {
    const username = req.headers.user;

    if (req.body.to === '' || req.body.text === '') {
        res.sendStatus(400);
    } else if (
        req.body.type !== 'message' &&
        req.body.type !== 'private_message'
    ) {
        res.sendStatus(422);
    } else if (!names.includes(username)) {
        res.sendStatus(422);
    } else {
        let newMessages = req.body;
        newMessages.from = username;
        newMessages.time = dayjs().format('HH:MM:SS');
        messages.push(newMessages);
        res.sendStatus(201);
    }
});

app.post('/status', (req, res) => {
    const username = req.headers.user;
    if (!names.includes(username)) {
        res.sendStatus(400);
    }
    if (participants.length !== 0) {
        participants.find((p, i) => {
            return p.name === username;
        }).lastStatus = Date.now();
    }
});

setInterval(() => {
    participants.forEach((p, i) => {
        if (p.lastStatus < Date.now() - 10000) {
            messages.push({
                from: `${p.name}`,
                to: 'Todos',
                text: 'sai da sala...',
                type: 'status',
                time: `${dayjs().format('H:m:s')}`,
            });
            participants.splice(i, 1);
            names.splice(i, 1);
        }
    });
}, 15000);

app.listen(5000, () => {
    console.log('Tudo certo pra dar errado');
});