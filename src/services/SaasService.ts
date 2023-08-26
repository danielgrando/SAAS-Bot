import axios from "axios";
import { printErrorInService, printInfoMessage } from "../utils/utilsService";
import { ResultRequest } from "../utils/customTypes";

class SaasService {
  async getStore(storeId: string): Promise<ResultRequest> {
    try {
      printInfoMessage('Request to SAAS to getStore!')

      const { status, data } = await axios({
        url: process.env.SAAS_URL + '/v1/store/' + storeId,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      printInfoMessage('Successful request! 🚀')

      return { status, data }
    } catch (error: any) {
      printErrorInService(error, 'SAAS', 'getStore')

      return { status: error?.response?.status || 500, error: error?.response?.data || 'An unknown error has ocurred' }
    }
  }

  async getMenuByStoreId(storeId: string): Promise<ResultRequest> {
    try {
      printInfoMessage('Request to SAAS to getMenuByStoreId!')

      const { status, data } = await axios({
        url: process.env.SAAS_URL + '/v1/menu/store/' + storeId,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      printInfoMessage('Successful request! 🚀')

      return { status, data }
    } catch (error: any) {
      printErrorInService(error, 'SAAS', 'getMenuByStoreId')

      return { status: error?.response?.status || 500, error: error?.response?.data || 'An unknown error has ocurred' }
    }
  }

  async getPromotionsByStoreId(storeId: string): Promise<ResultRequest> {
    try {
      printInfoMessage('Request to SAAS to getPromotionsByStoreId!')

      const { status, data } = await axios({
        url: process.env.SAAS_URL + '/v1/store-promotion',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        params: { storeId, active: true }
      })

      printInfoMessage('Successful request! 🚀')

      return { status, data }
    } catch (error: any) {
      printErrorInService(error, 'SAAS', 'getPromotionsByStoreId')

      return { status: error?.response?.status || 500, error: error?.response?.data || 'An unknown error has ocurred' }
    }
  }
}

export { SaasService }