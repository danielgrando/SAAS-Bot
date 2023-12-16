const SaasService = require('../services/SaasService')
const CustomerService = require('../models/customerService.model')
const GeoLocationService = require('../services/GeoLocationService')
const config = require('../../config/config')
const events = require('../controllers/events.controller')
const dayjs = require('dayjs')

exports.returnMessageToUserByWebhook = async (req, res) => {
  if (req.body?.type.toLowerCase() === 'message') {
    const message = req.body.body?.message?.extendedTextMessage?.text
    const storeId = req.body.instanceKey
    const from = req.body.body.key.remoteJid

    console.log(message)

    const saasService = new SaasService()
    const resultStore = await saasService.getStore(storeId)
    if (resultStore?.error) {
      throw new Error(resultStore.error)
    }

    let customerService = await CustomerService.findOne({ phone: from, storeId })
    if (customerService) {
      const customerServiceStart = dayjs(customerService.createdAt).add(20, 'minute').format()
      if (customerServiceStart < dayjs().format()) {
        await CustomerService.deleteMany({ phone: from, storeId })
        customerService = null
      }
    }

    const { name, openClose, latitude, longitude } = resultStore?.data

    const choices = {
      '0': async () => {
        const data = await WhatsAppInstances[storeId].sendTextMessage(
          from,
          `👋 Olá, como vai? \nEu sou o *assistente virtual* da *${name}*. \n*Aqui está uma lista de coisas em que posso ajudar:* 🙋‍♂️ \n ------------------------------------------------------------- \n 1️⃣ - Ver cardápio/Fazer pedido \n 2️⃣ - Promoções \n 3️⃣ - Endereço \n 4️⃣ - Horários de funcionamento \n 5️⃣ - Problemas ou dúvidas\n 6️⃣ - Finalizar Atendimento`
        )

        return res.status(201).json({ error: false, data: data })
      },
      '1': async () => {
        const resultStoreMenu = await saasService.getMenuByStoreId(storeId)
        if (resultStoreMenu?.error) {
          throw new Error(resultStoreMenu.error)
        }

        if (!resultStoreMenu?.data?.name) {
          const data = await WhatsAppInstances[storeId].sendTextMessage(
            from,
            `Ainda não cadastramos nosso cardápio! 🙁`
          )

          return res.status(201).json({ error: false, data: data })
        }

        const menuLink = `${config.Url + '/menu/' + resultStoreMenu?.data?.name}`
        const data = await WhatsAppInstances[storeId].sendTextMessage(
          from,
          `✅ Aqui você pode conferir nosso cardápio completo e também fazer seus pedidos! 😉\n \n${menuLink}`
        )

        return res.status(201).json({ error: false, data: data })
      },
      '2': async () => {
        const resultStorePromotions = await saasService.getPromotionsByStoreId(storeId)
        if (resultStorePromotions?.error) {
          throw new Error(resultStorePromotions.error)
        }

        if (!resultStorePromotions?.data?.items.length) {
          const data = await WhatsAppInstances[storeId].sendTextMessage(
            from,
            `No momento não possuímos promoções ativas! 🙁`
          )

          return res.status(201).json({ error: false, data: data })
        }

        let promotionItems = ''
        for (const item of resultStorePromotions?.data?.items) {
          promotionItems += '\n'
          promotionItems += `- ${item.item.name}\n`
          promotionItems += `De: R$ ${item.price}\n`
          promotionItems += `Por: R$ ${item.discountPrice}\n`
        }

        const data = await WhatsAppInstances[storeId].sendTextMessage(
          from,
          `✅ Aqui estão nossas promoções ativas: \n ${promotionItems}`
        )

        return res.status(201).json({ error: false, data: data })
      },
      '3': async () => {
        const geoLocationService = new GeoLocationService()

        const responseAddressGeoApi = await geoLocationService.getAddress(latitude, longitude)
        if (responseAddressGeoApi?.error) {
          throw new Error(responseAddressGeoApi.error)
        }

        const { formatted } = responseAddressGeoApi?.data?.features[0]?.properties
        const locationLink = `https://maps.google.com/maps?q=${latitude},${longitude}&z=17&hl=en`

        const data = await WhatsAppInstances[storeId].sendTextMessage(
          from,
          `📍 Estamos localizados no endereço: \n${formatted} \n\n${locationLink}`
        )

        return res.status(201).json({ error: false, data: data })
      },
      '4': async () => {
        if (!openClose) {
          const data = await WhatsAppInstances[storeId].sendTextMessage(
            from,
            `No momento não cadastramos nossos horários de funcionamento!`
          )

          return res.status(201).json({ error: false, data: data })
        }

        const translateDaysOfWeek = (key) => {
          const days = { 0: "Segunda", 1: "Terça", 2: "Quarta", 3: "Quinta", 4: "Sexta", 5: "Sabádo", 6: "Domingo" }
          return days[key]
        }

        let daysOpenClose = ''
        for (let [key, value] of Object.entries(openClose)) {
          daysOpenClose += '\n'
          key = translateDaysOfWeek(Number(key))
          daysOpenClose += `${key}\n`
          daysOpenClose += `Abre: ${value.open}\n`
          daysOpenClose += `Fecha: ${value.close}\n`
        }

        const data = await WhatsAppInstances[storeId].sendTextMessage(
          from,
          `✅ Nossos horários de funcionamento são: \n${daysOpenClose}`
        )

        return res.status(201).json({ error: false, data: data })
      },
      '5': async () => {
        const req = { body: { storeId, phone: from, webhook: true } }
        await events.addEvent(req)

        const data = await WhatsAppInstances[storeId].sendTextMessage(
          from,
          `✅ O estabelecimento foi notificado, aguarde um momento por favor! 😊`
        )

        return res.status(201).json({ error: false, data: data })
      },
      '6': async () => {
        const customerService = await CustomerService.findOne({ phone: from, storeId })
        if (!customerService) {
          const data = await WhatsAppInstances[storeId].sendTextMessage(
            from,
            `✅ Nenhum atendimento foi requisitado! 😊`
          )
          return res.status(201).json({ error: false, data: data })
        }

        await CustomerService.deleteMany({ phone: from, storeId })

        const data = await WhatsAppInstances[storeId].sendTextMessage(
          from,
          `🔚 * Atendimento encerrado! * 🔚`
        )

        return res.status(201).json({ error: false, data: data })
      }
    }

    const choice = await choices[message]
    if (choice) {
      return choice()
    } else if (!customerService) {
      const choice = choices['0']
      return choice()
    }

    return res.status(201).json({ error: false, data: 'UP' })
  }
}