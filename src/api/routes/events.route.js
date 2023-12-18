const express = require('express')
const router = express.Router()
const controller = require('../controllers/events.controller')

router.route('/').get(controller.eventsHandler)
router.route('/').post(controller.addEvent)


module.exports = router