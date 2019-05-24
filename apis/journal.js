"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var entryIdCounter = 400;
var database = {};
var router = express_1.Router();
router.get('/journals/:id', function (req, res) {
    var journal = getOrCreateJournal(req.params.id);
    res.send({
        id: journal.id,
        name: journal.name,
    });
});
router.get('/journals/:id/entries', function (req, res) {
    var journal = getOrCreateJournal(req.params.id);
    res.send(journal.entries);
});
router.post('/journals/:id/entries', function (req, res) {
    if (!req.body.body)
        return res.status(400).send('missing_body');
    if (!req.body.title)
        return res.status(400).send('missing_title');
    var journal = getOrCreateJournal(req.params.id);
    var newEntry = {
        id: entryIdCounter++,
        title: req.body.title,
        body: req.body.body,
        createdAt: Date.now(),
    };
    journal.entries.push(newEntry);
    res.status(201).send(newEntry);
});
router.get('/journals/:journal_id/entries/:id', function (req, res) {
    var journal = getOrCreateJournal(req.params.journal_id);
    var entry_id = parseInt(req.params.id, 10);
    var entry = journal.entries.find(function (e) { return e.id === entry_id; });
    if (entry) {
        res.send(entry);
    }
    else {
        res.status(404).send({});
    }
});
exports.default = router;
function getOrCreateJournal(id) {
    var journal = database[id] || {
        id: id,
        name: "Journal Book " + id,
        entries: generateEntries(),
    };
    if (!database[id]) {
        database[id] = journal;
    }
    return journal;
}
function generateEntries() {
    return [
        {
            id: entryIdCounter++,
            title: 'My Entry 2',
            body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            createdAt: 1552719600000,
        },
        {
            id: entryIdCounter++,
            title: 'My Entry 1',
            body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            createdAt: 1552374000000,
        }
    ];
}
