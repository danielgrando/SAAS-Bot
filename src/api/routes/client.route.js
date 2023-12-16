const express = require('express')
const router = express.Router()

router.post('/', (req, res) => res.send('OK'))

module.exports = router
