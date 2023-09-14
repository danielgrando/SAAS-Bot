import axios from "axios"
import { ResultRequest } from "../utils/customTypes"
import { printErrorInService, printInfoMessage } from "../utils/utilsService"

class GeoLocationService {
  async getAddress(lat: string, long: string): Promise<ResultRequest> {
    try {
      printInfoMessage('Request to GeoApi to getAddress!')

      const { status, data } = await axios({
        url: process.env.GEO_API_URL + `v1/geocode/reverse?lat=${lat}&lon=${long}&apiKey=${process.env.GEO_API_KEY}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      printInfoMessage('Successful request! 🚀')

      return { status, data }
    } catch (error: any) {
      printErrorInService(error, 'GeoApi', 'getAddress')

      return { status: error?.response?.status || 500, error: error?.response?.data || 'An unknown error has ocurred' }
    }
  }
}

export { GeoLocationService }