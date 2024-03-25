const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())

function tryCatch(func, fail) {
    try { return func() }
    catch(e) { return fail }
}

var TrackerSchema = mongoose.Schema({
    Title: String,
    Year: String,
    Type: String,
    Poster: String,
    imdbID: String,
    Remarks: {
        jujuba: Number,
        tito: Number
    },
    Reviews: {
        jujuba: String,
        tito: String
    },
    Status: 'Watched' | 'To Watch' | 'In Progress'
});

var TokenSchema = mongoose.Schema({ token: String });

var Tracker = mongoose.model('Tracker', TrackerSchema, 'trackerstore');

var Token = mongoose.model('Token', TokenSchema, 'token');

app.get("/", (req, res) => {
    res.json({ message: 'Hello World!' })
});

const movies = require('./routes/index.js');
app.use('/movies', movies);

app.post('/tracker', (req, res) => {
    try {
        console.log(req.body)
        var tracker1 = new Tracker(req.body);

        tracker1.save(function (err, tracker) {
            if (err) return console.error(err);
            console.log(tracker.Title + " saved to trackerstore collection.");
            res.status(200).send()
        });
    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
})

app.patch('/tracker', (req, res) => {
    try {
        Tracker.updateOne({ imdbID: req.body.imdbID }, req.body, (err, tracker) => {
            if (!err) {
                res.json(req.body);
            } else {
                console.log("Error updating :" + err);
            }
        });
    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
})

app.delete('/tracker', (req, res) => {
    try {
        Tracker.remove({ imdbID: req.query.imdbID }, (err, tracker) => {
            if (!err) {
                res.json({ msg: "tracker deleted", deleted: tracker });
            } else {
                console.log("Error removing :" + err);
            }
        });
    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
})

app.get('/tracker', async (req, res) => {
    try {
        Tracker.find({}, function (err, trackers) {
            var trackerMap = [];

            trackers.forEach(function (tracker) {
                trackerMap.push(tracker);
            });

            res.send(trackerMap);
        });
    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
})

app.get('/tracker/:id', async (req, res) => {
    try {
        Tracker.find({ imdbID: req.params.id }, function (err, trackers) {
            res.send(trackers[0]);
        });
    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
})

app.post('/token',(req, res) => tryCatch(
    Token.findOne({ 'token': req.body.token }, (err, token) => token ? res.send(token) : res.status(404).send({message: 'Token inválido'})),
    (e) => res.status(500).send(e))
);

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = encodeURIComponent(process.env.DB_PASSWORD);
const PORT = 3000
mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@filminho.qsjn6y6.mongodb.net?retryWrites=true&w=majority`).then(e => {
    console.log("Conectando ao Banco de dados");
    app.listen(process.env.PORT || PORT)
    console.log("Conectado com sucesso, API iniciada na porta", process.env.PORT || PORT);
})
    .catch(err => console.error('Não foi possível conectar ao Banco de dados. Erro:', err));