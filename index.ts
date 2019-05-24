import express from 'express'
import bodyParser from 'body-parser'

import journal from './apis/journal'

const app = express()

app.use(bodyParser.json())
app.use(journal)

export default app

if (!process.env.IS_NOW && process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 7777
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
}
