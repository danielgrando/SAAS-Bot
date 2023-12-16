const axios = require('axios')
const config = require('../../config/config')
const { printErrorInService, printInfoMessage } = require('../utils/utilsService')

class SaasService {
  async getStore(storeId) {
    try {
      printInfoMessage('Request to SAAS to getStore!')

      const { status, data } = await axios({
        url: config.SaasUrl + '/v1/store/' + storeId,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      printInfoMessage('Successful request! 🚀')

      return { status, data }
    } catch (error) {
      printErrorInService(error, 'SAAS', 'getStore')

      return { status: error?.response?.status || 500, error: error?.response?.data || 'An unknown error has ocurred' }
    }
  }

  async getMenuByStoreId(storeId) {
    try {
      printInfoMessage('Request to SAAS to getMenuByStoreId!')

      const { status, data } = await axios({
        url: config.SaasUrl + '/v1/menu/store/' + storeId,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      printInfoMessage('Successful request! 🚀')

      return { status, data }
    } catch (error) {
      printErrorInService(error, 'SAAS', 'getMenuByStoreId')

      return { status: error?.response?.status || 500, error: error?.response?.data || 'An unknown error has ocurred' }
    }
  }

  async getPromotionsByStoreId(storeId) {
    try {
      printInfoMessage('Request to SAAS to getPromotionsByStoreId!')

      const { status, data } = await axios({
        url: config.SaasUrl + '/v1/store-promotion',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        params: { storeId, active: true }
      })

      printInfoMessage('Successful request! 🚀')

      return { status, data }
    } catch (error) {
      printErrorInService(error, 'SAAS', 'getPromotionsByStoreId')

      return { status: error?.response?.status || 500, error: error?.response?.data || 'An unknown error has ocurred' }
    }
  }
}

module.exports = SaasService