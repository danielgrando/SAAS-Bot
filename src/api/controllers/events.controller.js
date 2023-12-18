const CustomerService = require('../models/customerService.model')

let clients = []

exports.eventsHandler = async (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  }

  if (!req.query?.storeId) {
    res.writeHead(404, headers)
    const data = `${JSON.stringify('Need querystring storeId!')}`

    return res.write(data)
  }

  res.writeHead(200, headers)

  const storeId = req.query?.storeId

  const findServiceByStoreId = await CustomerService.findOne({ storeId })

  const data = `${JSON.stringify(findServiceByStoreId)}`

  res.write(data)

  const clientId = Date.now()

  const newClient = {
    id: clientId,
    storeId,
    res
  };

  clients.push(newClient)

  req.on('close', () => {
    console.log(`${clientId} Connection closed`)
    clients = clients.filter(client => client.id !== clientId)
  });
}

module.exports.addEvent = async (req, res) => {
  const { storeId, phone, webhook } = req.body

  await CustomerService.deleteMany({ phone, storeId })
  const newEvent = await CustomerService.create({ phone, storeId })

  if (!webhook) { res.json(newEvent) }

  return sendEventsToAll(newEvent.storeId, phone)
}

async function sendEventsToAll(storeId, phone) {
  const findServiceByStoreId = await CustomerService.findOne({ storeId, phone })

  const clientsByStore = clients.filter(client => client.storeId === storeId)
  clientsByStore.forEach(client => client.res.write(`${JSON.stringify(findServiceByStoreId)}`))
}
