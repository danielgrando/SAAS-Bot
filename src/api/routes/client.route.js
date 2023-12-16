const express = require('express')
const router = express.Router()
const keyVerify = require('../middlewares/keyCheck')
const loginVerify = require('../middlewares/loginCheck')
const controller = require('../controllers/client.controller')

router.route('/').post(loginVerify, keyVerify, controller.returnMessageToUserByWebhook)

module.exports = router