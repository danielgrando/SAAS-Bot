import parsePhoneNumberFromString, { isValidPhoneNumber } from 'libphonenumber-js'
import { create, Whatsapp, Message, SocketState } from 'venom-bot'

export type QRCode = {
  base64Qr: string
  attempts: number
}

class Sender {
  private client: Whatsapp
  private connected: boolean
  private qr: QRCode

  constructor() {
    this.initialize()
  }

  get isConnected(): boolean {
    return this.connected
  }

  get qrCode(): QRCode {
    return this.qr
  }

  async sendText(to: string, body: string) {

    if (!isValidPhoneNumber(to)) {
      throw new Error('This number is not valid!')
    }

    let phoneNumber = parsePhoneNumberFromString(to, "BR")?.format("E.164").replace("+", "") as string

    phoneNumber = phoneNumber.includes("@c.us") ? phoneNumber : `${phoneNumber}@c.us`

    await this.client.sendText(phoneNumber, body)
  }

  private initialize() {
    const qr = (base64Qr: string, asciiQr: string, attempts: number, urlCode: string) => {
      this.qr = { base64Qr, attempts }
    }

    const status = (statusSession: string) => {
      this.connected = ['isLogged', 'qrReadSuccess', 'chatsAvailable'].includes(statusSession)
    }

    const start = (client: Whatsapp) => {
      this.client = client

      client.onStateChange((state) => {
        this.connected = state === SocketState.CONNECTED
      })
    }

    create('new-store-connection', qr, status)
      .then((client) => start(client))
      .catch((error) => console.error(error))
  }
}

export default Sender