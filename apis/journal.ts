import {Router} from 'express'

type journal_id = number
type entry_id = number

type Journal = {
  id: journal_id
  name: string
  entries: Entry[]
}

type Entry = {
  id: number
  title:  string
  body: string
  createdAt: number
}

let entryIdCounter = 400
let database: Record<journal_id, Journal | undefined> = {}

const router = Router()

router.get('/journals/:id', (req, res) => {
  const journal = getOrCreateJournal(req.params.id)

  res.send({
    id: journal.id,
    name: journal.name,
  })
})

router.get('/journals/:id/entries', (req, res) => {
  const journal = getOrCreateJournal(req.params.id)
  res.send(journal.entries)
})

router.post('/journals/:id/entries', (req, res) => {

  if (!req.body.body) return res.status(400).send('missing_body')
  if (!req.body.title) return res.status(400).send('missing_title')

  const journal = getOrCreateJournal(req.params.id)
  const newEntry: Entry = {
    id: entryIdCounter++,
    title: req.body.title,
    body: req.body.body,
    createdAt: Date.now(),
  }
  journal.entries.push(newEntry)
  res.status(201).send(newEntry)
})

router.get('/journals/:journal_id/entries/:id', (req, res) => {
  const journal = getOrCreateJournal(req.params.journal_id)
  const entry_id = parseInt(req.params.id, 10)
  const entry = journal.entries.find(e => e.id === entry_id)

  if (entry) {
    res.send(entry)
  }
  else {
    res.status(404).send({})
  }
})

export default router

function getOrCreateJournal(id: number) {
  const journal = database[id] || {
    id: id,
    name: `Journal Book ${id}`,
    entries: generateEntries(),
  }

  if (!database[id]) {
    database[id] = journal
  }
  return journal
}

function generateEntries (): Entry[] {
  return [
    {
      id: entryIdCounter++,
      title: 'My Entry 2',
      body: `Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
      createdAt: 1552719600000,
    },
    {
      id: entryIdCounter++,
      title: 'My Entry 1',
      body: `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      createdAt: 1552374000000,
    }
  ]
}
