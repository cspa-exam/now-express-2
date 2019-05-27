const assert = require('assert')
const request = require('supertest')

const app = require('../index').default

describe('Journal API', function() {

  it('returns a fresh journal on demand for any id', async function () {
    const ids = [0,0,0].map(x => Math.round(Math.random() * 1000) + 1)
    for (let id of ids) {
      await request(app)
        .get(`/journals/${id}`)
        .expect(200)
        .expect(res => {
          assert.deepEqual(res.body, {
            id: id,
            name: `Journal Book ${id}`
          })
        })

      let entries = null
      await request(app)
        .get(`/journals/${id}/entries`)
        .expect(200)
        .expect(res => {
          entries = res.body
          assert.equal(entries.length, 2)

          assert.equal(entries[0].title, 'My Entry 1')
          assert.equal(typeof entries[0].id, 'number')
          assert.equal(typeof entries[0].summary, 'string')
          assert.equal(typeof entries[0].createdAt, 'number')

          assert.ok('body' in entries[0] === false, 'body should not be provided')

          assert.equal(entries[1].title, 'My Entry 2')
          assert.equal(typeof entries[1].id, 'number')
          assert.equal(typeof entries[1].summary, 'string')
          assert.equal(typeof entries[1].createdAt, 'number')

          assert.ok('body' in entries[1] === false, 'body should not be provided')
        })

      await request(app)
        .get(`/journals/${id}/entries/${entries[0].id}`)
        .expect(200)
        .expect(res => {
          const entry = res.body
          assert.ok(typeof entry.body === 'string', 'Body should be included')
          delete entry.body
          assert.deepEqual(entry, entries[0])
        })
    }
  })

  it('yields the body for an individual entry', async function () {
    let journal_id = 144
    let entries

    await request(app)
      .get(`/journals/${journal_id}/entries`)
      .expect(200)
      .expect(res => {
        entries = res.body
      })

    await request(app)
      .get(`/journals/${journal_id}/entries/${entries[0].id}`)
      .expect(200)
      .expect(res => {
        const entry = res.body
        assert.equal(typeof entry.body, 'string')
        assert.equal(typeof entry.summary, 'string')

        assert.ok(entry.body.length > entry.summary.length)
        assert.ok(entry.body.indexOf('<p>') >= 0, 'body should be html')
        assert.ok(entry.summary.indexOf('<p>') === -1, 'summary SHOULD NOT be html')
      })
  })

  it('posts a new journal entry', async function () {
    const id = 99

    let entries = null

    await request(app)
      .get(`/journals/${id}/entries`)
      .expect(res => {
        entries = res.body
        assert.equal(entries.length, 2)
      })

    let newEntry = null
    let payload = {
      title: 'Posted Entry',
      body: 'hi',
    }

    await request(app)
      .post(`/journals/${id}/entries`)
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(201)
      .expect(res => {
        newEntry = res.body
        assert.equal(newEntry.title, payload.title)
        assert.equal(newEntry.body, `<p>hi</p>`)
        assert.equal(typeof newEntry.id, 'number')
        assert.equal(typeof newEntry.createdAt, 'number')
      })

    await request(app)
      .get(`/journals/${id}/entries`)
      .expect(res => {
        delete newEntry.body
        assert.deepEqual(res.body, entries.concat([ newEntry ]))
      })
  })

  it('throws a 400 on invalid entry posts', async function () {
    await request(app)
      .post(`/journals/333/entries`)
      .set('Content-Type', 'application/json')
      .send({ title: 'missing body' })
      .expect(400)
      .expect('missing_body')

    await request(app)
      .post(`/journals/333/entries`)
      .set('Content-Type', 'application/json')
      .send({ body: 'missing title' })
      .expect(400)
      .expect('missing_title')
  })

  it('throws a 404 on non-existant journal entries', async function () {
    await request(app)
      .get(`/journals/123/entries/0`)
      .expect(404)
  })
  it('throws a 404 on unrecognized endpoints', async function () {
    await request(app)
      .get('/jj')
      .expect(404)
  })
})
