const express = require('express')
const router = express.Router()
import * as storeController from '../controllers/storeController'
import * as userController from '../controllers/userController'
import * as authController from '../controllers/authController'
import * as reviewController from '../controllers/reviewController'
import { catchErrors } from '../handlers/errorHandlers'
import { PUBLIC_PATH } from '../config.js'

function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object
}

// Wrap all async functions in catchErrors

// STORE
router.get(PUBLIC_PATH + '', catchErrors(storeController.getStores))
router.get(PUBLIC_PATH + 'add',
    authController.isLoggedIn,
    storeController.addStore
)
router.post(PUBLIC_PATH + 'add',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore)
)
router.post(PUBLIC_PATH + 'update/:id',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.updateStore)
)
router.get(PUBLIC_PATH + 'stores', catchErrors(storeController.getStores))
router.get(PUBLIC_PATH + 'stores/page/:page', catchErrors(storeController.getStores))
router.get(PUBLIC_PATH + 'stores/:slug', catchErrors(storeController.getStoreBySlug))
router.get(PUBLIC_PATH + 'stores/:id/edit', catchErrors(storeController.editStore))
router.get(PUBLIC_PATH + 'tags', catchErrors(storeController.getStoresByTag))
router.get(PUBLIC_PATH + 'tags/:tag', catchErrors(storeController.getStoresByTag))
router.get(PUBLIC_PATH + 'map', storeController.mapPage)
router.get(PUBLIC_PATH + 'top', catchErrors(storeController.getTopStores))


// USER
router.get(PUBLIC_PATH + 'login', userController.loginForm)
router.post(PUBLIC_PATH + 'login',authController.login)
router.get(PUBLIC_PATH + 'register', userController.registerForm)
router.post(PUBLIC_PATH + 'register',
    userController.validateRegister,
    userController.register,
    authController.login
)
router.get(PUBLIC_PATH + 'logout', authController.logout)
router.get(PUBLIC_PATH + 'likes',
    authController.isLoggedIn,
    catchErrors(storeController.getLikes)
)
router.get(PUBLIC_PATH + 'likes/page/:page',
    authController.isLoggedIn,
    catchErrors(storeController.getLikes)
)
router.post(PUBLIC_PATH + 'reviews/:id',
    authController.isLoggedIn,
    catchErrors(reviewController.addReview)
)


// ACCOUNT
router.get(PUBLIC_PATH + 'account',
    authController.isLoggedIn,
    userController.account
)
router.post(PUBLIC_PATH + 'account', catchErrors(userController.updateAccount))
router.post(PUBLIC_PATH + 'account/forgot', catchErrors(authController.forgot))
router.get(PUBLIC_PATH + 'account/reset/:token', catchErrors(authController.reset))
router.post(PUBLIC_PATH + 'account/reset/:token',
    authController.confirmPasswords,
    catchErrors(authController.update)
)


// API
router.get(PUBLIC_PATH + 'api/search', catchErrors(storeController.searchStores))
router.get(PUBLIC_PATH + 'api/stores/near', catchErrors(storeController.mapStores))
router.post(PUBLIC_PATH + 'api/stores/:id/likes', catchErrors(storeController.likesStore))

module.exports = router
