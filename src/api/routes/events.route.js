const express = require('express')
const router = express.Router()
const events = require('../controllers/events.controller')


router.route('/').get(events.eventsHandler)
router.route('/').post(events.addEvent)


module.exports = router