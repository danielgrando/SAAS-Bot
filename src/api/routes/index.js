const express = require('express')
const router = express.Router()
const instanceRoutes = require('./instance.route')
const messageRoutes = require('./message.route')
const miscRoutes = require('./misc.route')
const groupRoutes = require('./group.route')
const clientRoutes = require('./client.route')
const eventsRoutes = require('./events.route')

router.get('/', (req, res) => { return res.json({ 'Online': true, 'Server': 'UP' }) })
router.get('/status', (req, res) => res.send('OK'))
router.use('/instance', instanceRoutes)
router.use('/message', messageRoutes)
router.use('/group', groupRoutes)
router.use('/misc', miscRoutes)
router.use('/webhook', clientRoutes)
router.use('/events', eventsRoutes)

module.exports = router
