function loginVerification(req, res, next) {
    const key = req.query['key']?.toString()
    const keyWebhook = req.body?.instanceKey

    if (!key && !keyWebhook) {
        return res
            .status(403)
            .send({ error: true, message: 'no key query was present' })
    }
    const instance = WhatsAppInstances[key || keyWebhook]
    if (!instance.instance?.online) {
        return res
            .status(401)
            .send({ error: true, message: "phone isn't connected" })
    }
    next()
}

module.exports = loginVerification
