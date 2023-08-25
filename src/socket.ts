import path from "path";
import { create, Whatsapp, Message, SocketState } from 'venom-bot'
import { SaasService } from "./services/SaasService";
import fs from 'fs'

interface IStore {
  id: string
  name: string
  email: string
  type: string
  logo: string
  frontCover: string
  status?: boolean | null
  openClose?: any
  latitude: string
  longitude: string
  settings?: any
}

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
          socket.emit('server:message', 'Status: ' + state)
          console.log('State changed: ' + state)
        })

        client.onMessage(async (message) => {
          const saasService = new SaasService()

          const resultStore = await saasService.getStore(storeId)
          if (resultStore?.error) {
            throw new Error(resultStore.error)
          }

          const { name, openClose, latitude, longitude }: IStore = resultStore.data

          if (!message.isGroupMsg) {
            client.sendText(message.from, `
              👋 Olá, como vai?
              Eu sou o *assistente virtual* da *${name}*.
              *Aqui está uma lista de coisas em que posso ajudar ?* 🙋‍♂️
              ----------------------------------------
              1️⃣ - Ver cardápio/Fazer pedido
              2️⃣ - Promoções
              3️⃣ - Endereço
              4️⃣ - Horários de funcionamento
              5️⃣ - Finalizar Atendimento
              `)
              .then((result) => {
                console.log('Result: ', result)
              })
              .catch((error) => {
                console.error('Error when sending: ', error)
              });
          }

          const choices = {
            '1': async () => {
              const resultStoreMenu = await saasService.getMenuByStoreId(storeId)
              if (resultStoreMenu?.error) {
                throw new Error(resultStoreMenu.error)
              }

              client.sendText(message.from, `Aqui você pode ver nosso cardápio completo e também fazer seus pedidos!
              ${process.env.URL + '/' + resultStoreMenu.data.name}`)
            },
            '2': async () => {
              const resultStorePromotions = await saasService.getPromotionsByStoreId(storeId)
              if (resultStorePromotions?.error) {
                throw new Error(resultStorePromotions.error)
              }
              //TODO Formatter in text and send filters started e active to true ✅

              client.sendText(message.from, `${resultStorePromotions.data.items}`)
            },
            '3': () => {
              //TODO Get address with latitude and longitude 🗺️ 📍 

              client.sendText(message.from, `${''}`)
            },
            '4': () => {
              //TODO Formatter

              client.sendText(message.from, `Nossos horários de funcionamento são: ${openClose}`)
            },
            '5': () => {
              client.sendText(message.from, `🔚 *Atendimento encerrado* 🔚`)
            }
          }

          await choices[message.body]
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

    socket.on('client:qrCode', (storeId) => {
      const qrCode = fs.readFileSync(path.resolve(storeId + '.png'), { encoding: 'base64' });
      socket.emit('server:qrCode', 'data:image/png;base64,' + qrCode)
    })

    socket.on('client:list-session', () => {
      const files = fs.readdirSync('./tokens')
      const filesName = files.toString()
      console.log(filesName)
      socket.emit('server:list-session', filesName)
    })


    socket.on('client:delete-session', (storeId) => {
      const files = './tokens/' + storeId
      const qrcodes = storeId + '.png'
      fs.unlinkSync(files)
      fs.unlinkSync(qrcodes)
    })

  })
}