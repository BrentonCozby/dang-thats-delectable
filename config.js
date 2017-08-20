import { resolve } from 'path'

export const DEV_PATH = __dirname
export const PUBLIC_PATH = '/dang-thats-delectable/'

export const SITE_TITLE = 'Dang That\'s Delectable!'
export const SITE_NAME = 'dang-thats-delectable'
export const DESCRIPTION = 'Boilerplate for a Static website using EJS and SASS'
export const SITE_URL = 'example.com'
export const DEVELOPER_NAME = 'Brenton Cozby'
export const DEVELOPER_URL = 'https://brentoncozby.com'

const Dir = {
    root: __dirname,
    controllers: resolve(__dirname, 'controllers'),
    data: resolve(__dirname, 'data'),
    handlers: resolve(__dirname, 'handlers'),
    models: resolve(__dirname, 'models'),
    images: resolve(__dirname, 'public', 'images'),
    routes: resolve(__dirname, 'routes'),
    views: resolve(__dirname, 'views')
}

export { Dir }
