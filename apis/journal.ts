import {loremIpsum} from "lorem-ipsum"
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
  title: string
  body: string
  summary: string
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
  res.send(journal.entries.map(entry => {
    const copy = {...entry}
    delete copy.body
    return copy
  }))
})

router.post('/journals/:id/entries', (req, res) => {

  if (!req.body.body) return res.status(400).send('missing_body')
  if (!req.body.title) return res.status(400).send('missing_title')

  const journal = getOrCreateJournal(req.params.id)

  const paragraphs = (req.body.body as string).split('\n\n')

  const newEntry: Entry = {
    id: entryIdCounter++,
    title: req.body.title,
    summary: paragraphs[0],
    body: paragraphs.map(content => `<p>${content}</p>`).join('\n'),
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
      title: 'My Entry 1',
      summary: loremIpsum({ count: 3 }),
      createdAt: 1552374000000,
    },
    {
      id: entryIdCounter++,
      title: 'My Entry 2',
      summary: loremIpsum({ count: 4 }),
      createdAt: 1552719600000,
    },
  ].map(entry => ({
    ...entry,
    body: `<p>${entry.summary}</p>\n` + loremIpsum({ count: 4, units: 'paragraph', format: 'html' }),
  }))
}
