import path from "path";
import { create, Whatsapp } from 'venom-bot'
import { SaasService } from "./services/SaasService";
import fs from 'fs'
import { GeoLocationService } from "./services/GeoLocationService";
import { IStore } from "./interfaces/IStore";

export default (io: { on: (arg0: string, arg1: (socket: any) => void) => void }) => {
  io.on("connection", (socket) => {
    console.log('User connected:', socket.id)

    const createSession = (storeId: string) => {
      create(storeId,
        (base64Qr) => {
          var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response: any = {};

          if (matches.length !== 3) {
            return new Error('Invalid input string');
          }
          response.type = matches[1]
          response.data = Buffer.from(matches[2], 'base64')

          var imageBuffer = response;
          require('fs').writeFile(
            storeId + '.png',
            imageBuffer['data'],
            'binary',
            function (err) {
              if (err != null) {
                console.log(err);
              }
            }
          );
        },
      )
        .then((client) => {
          start(client);
        })
        .catch((error) => {
          console.log(error);
        });

      function start(client: Whatsapp) {
        client.onStateChange((state) => {
          socket.emit('server:status', 'Status: ' + state)
        })

        client.onMessage(async (message) => {
          if (!message.isGroupMsg) {
            const saasService = new SaasService()

            const resultStore = await saasService.getStore(storeId)
            if (resultStore?.error) {
              throw new Error(resultStore.error)
            }

            const { name, openClose, latitude, longitude }: IStore = resultStore?.data

            const choices = {
              '0': () => {
                return client.sendText(message.from, `👋 Olá, como vai? \nEu sou o *assistente virtual* da *${name}*. \n*Aqui está uma lista de coisas em que posso ajudar ?* 🙋‍♂️ \n ------------------------------------------------------------- \n 1️⃣ - Ver cardápio/Fazer pedido \n 2️⃣ - Promoções \n 3️⃣ - Endereço \n 4️⃣ - Horários de funcionamento \n 5️⃣ - Finalizar Atendimento`)
              },
              '1': async () => {
                const resultStoreMenu = await saasService.getMenuByStoreId(storeId)
                if (resultStoreMenu?.error) {
                  throw new Error(resultStoreMenu.error)
                }

                if (!resultStoreMenu?.data?.name) {
                  return client.sendText(message.from, `Ainda não cadastramos nosso cardápio! 🙁}`)
                }

                const menuLink = `${process.env.URL + '/' + resultStoreMenu?.data?.name}`
                return client.sendText(message.from, `Aqui você pode ver nosso cardápio completo e também fazer seus pedidos! \n \n${menuLink}`)
              },
              '2': async () => {
                const resultStorePromotions = await saasService.getPromotionsByStoreId(storeId)
                if (resultStorePromotions?.error) {
                  throw new Error(resultStorePromotions.error)
                }

                if (!resultStorePromotions?.data?.items.length) {
                  return client.sendText(message.from, `No momento não possuímos promoções ativas! 🙁`)
                }

                let promotionItems: string = ''
                for (const item of resultStorePromotions?.data?.items) {
                  promotionItems += '\n'
                  promotionItems += `- ${item.item.name}\n`
                  promotionItems += `De: R$ ${item.price}\n`
                  promotionItems += `Por: R$ ${item.discountPrice}\n`
                }

                return client.sendText(message.from, `✅ Aqui estão nossas promoções ativas: \n ${promotionItems}`)
              },
              '3': async () => {
                const geoLocationService = new GeoLocationService()

                const responseAddressGeoApi = await geoLocationService.getAddress(latitude, longitude)
                if (responseAddressGeoApi?.error) {
                  throw new Error(responseAddressGeoApi.error)
                }

                const { formatted } = responseAddressGeoApi?.data?.features[0]?.properties

                client.sendText(message.from, `📍 Estamos localizados no endereço: \n${formatted}`)
                client.sendLocation(message.from, latitude, longitude, `${formatted}`)
              },
              '4': () => {
                if (!openClose) {
                  return client.sendText(message.from, `No momento não cadastramos nossos horários de funcionamento!`)
                }

                const translateDaysOfWeek = (key: number) => {
                  const days = { 0: "Segunda", 1: "Terça", 2: "Quarta", 3: "Quinta", 4: "Sexta", 5: "Sabádo", 6: "Domingo" }
                  return days[key]
                }

                let daysOpenClose: string = ''
                for (let [key, value] of Object.entries(openClose)) {
                  daysOpenClose += '\n'
                  key = translateDaysOfWeek(Number(key))
                  daysOpenClose += `${key}\n`
                  daysOpenClose += `Abre: ${value.open}\n`
                  daysOpenClose += `Fecha: ${value.close}\n`
                }

                return client.sendText(message.from, `✅ Nossos horários de funcionamento são: \n${daysOpenClose}`)
              },
              '5': () => {
                return client.sendText(message.from, `🔚 *Atendimento encerrado!* 🔚`)
              }
            }

            const choice = await choices[message.body]
            if (choice) {
              return choice()
            } else {
              const choice = choices['0']
              return choice()
            }
          }
        })
      }
    }

    // https://emojiterra.com/pt/ ❌⚠️
    socket.on('client:create-session', (storeId: string) => {
      createSession(storeId)
      setTimeout(() => {
        const qrCode = fs.readFileSync(path.resolve(storeId + '.png'), { encoding: 'base64' });
        socket.emit('server:session', 'data:image/png;base64,' + qrCode)
      }, 10000)
    })

    socket.on('client:qrCode', (storeId: string) => {
      const qrCode = fs.readFileSync(path.resolve(storeId + '.png'), { encoding: 'base64' });
      socket.emit('server:qrCode', 'data:image/png;base64,' + qrCode)
    })

    socket.on('client:list-session', () => {
      const files = fs.readdirSync('./tokens')
      const filesName = files.toString()

      socket.emit('server:list-session', filesName)
    })

    socket.on('client:status', (storeId: string) => {
      const allStatus = fs.readdirSync('./tokens')

      const storeInstanceStatus = allStatus.find((storeInstanceStatus) => storeInstanceStatus === storeId)
      if (storeInstanceStatus) {
        return socket.emit('server:status', true)
      }
      return socket.emit('server:status', false)
    })

    socket.on('client:delete-session', (storeId: string) => {
      const files = './tokens/' + storeId
      const qrcodes = storeId + '.png'
      fs.unlinkSync(files)
      fs.unlinkSync(qrcodes)
    })

  })
}

// let stage: string = '0'
// const allDayChatMessages = await client.getAllMessagesInChat(message.from, false, false)
// if (stage !== '0') {
//   const messageClient = message.body.trim()
//   const isMsgValid = /[1|2|3|4|5]/.test(messageClient)
//   if (!isMsgValid) {
//     return client.sendText(message.from, '❌ *Digite uma opção válida, por favor.* \n⚠️ ```APENAS UMA OPÇÃO POR VEZ``` ⚠️')
//   } else if (!message.isGroupMsg) {
//     return
//   }
// }