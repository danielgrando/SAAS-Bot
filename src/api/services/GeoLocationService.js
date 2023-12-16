const axios = require('axios')
const config = require('../../config/config')
const { printErrorInService, printInfoMessage } = require('../utils/utilsService')
//📍 https://apidocs.geoapify.com/ 
class GeoLocationService {
  async getAddress(lat, long) {
    try {
      printInfoMessage('Request to GeoApi to getAddress!')

      const { status, data } = await axios({
        url: config.GeoApiUrl + `/v1/geocode/reverse?lat=${lat}&lon=${long}&apiKey=${config.GeoApiKey}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      printInfoMessage('Successful request! 🚀')

      return { status, data }
    } catch (error) {
      printErrorInService(error, 'GeoApi', 'getAddress')

      return { status: error?.response?.status || 500, error: error?.response?.data || 'An unknown error has ocurred' }
    }
  }
}

module.exports = GeoLocationService