import path from "path";
import { create, Whatsapp, Message, SocketState } from 'venom-bot'
import { SaasService } from "./services/SaasService";
import fs from 'fs'

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

          const resultStore: any = await saasService.getStore(storeId)
          if (resultStore?.error) {
            throw new Error(resultStore.error)
          }

          if (!message.isGroupMsg) {
            client
              .sendText(message.from, `
              👋 Olá, como vai?
              Eu sou o *assistente virtual* da ${resultStore.name}.
              *Aqui está uma lista de coisas em que posso ajudar ?* 🙋‍♂️
              -----------------------------------
              1️⃣ - Ver cardápio
              2️⃣ - Fazer pedido
              3️⃣ - Promoções
              4️⃣ - Endereço
              5️⃣ - Horários de funcionamento
              6️⃣ - Finalizar Atendimento
              `)
              .then((result) => {
                console.log('Result: ', result)
              })
              .catch((erro) => {
                console.error('Error when sending: ', erro)
              });
          }
        });
      }
    }

    // https://emojiterra.com/pt/
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