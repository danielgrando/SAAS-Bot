interface IStore {
  id: string
  name: string
  email: string
  type: string
  logo: string
  frontCover: string
  status?: boolean | null
  openClose?: object
  latitude: string
  longitude: string
  settings?: any
}

export { IStore }