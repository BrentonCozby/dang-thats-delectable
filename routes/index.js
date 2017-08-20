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
router.get('/', catchErrors(storeController.getStores))
router.get('/add',
    authController.isLoggedIn,
    storeController.addStore
)
router.post('/add',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore)
)
router.post('/update/:id',
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.updateStore)
)
router.get('/stores', catchErrors(storeController.getStores))
router.get('/stores/page/:page', catchErrors(storeController.getStores))
router.get('/stores/:slug', catchErrors(storeController.getStoreBySlug))
router.get('/stores/:id/edit', catchErrors(storeController.editStore))
router.get('/tags', catchErrors(storeController.getStoresByTag))
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag))
router.get('/map', storeController.mapPage)
router.get('/top', catchErrors(storeController.getTopStores))


// USER
router.get('/login', userController.loginForm)
router.post('/login',authController.login)
router.get('/register', userController.registerForm)
router.post('/register',
    userController.validateRegister,
    userController.register,
    authController.login
)
router.get('/logout', authController.logout)
router.get('/likes',
    authController.isLoggedIn,
    catchErrors(storeController.getLikes)
)
router.get('/likes/page/:page',
    authController.isLoggedIn,
    catchErrors(storeController.getLikes)
)
router.post('/reviews/:id',
    authController.isLoggedIn,
    catchErrors(reviewController.addReview)
)


// ACCOUNT
router.get('/account',
    authController.isLoggedIn,
    userController.account
)
router.post('/account', catchErrors(userController.updateAccount))
router.post('/account/forgot', catchErrors(authController.forgot))
router.get('/account/reset/:token', catchErrors(authController.reset))
router.post('/account/reset/:token',
    authController.confirmPasswords,
    catchErrors(authController.update)
)


// API
router.get('/api/search', catchErrors(storeController.searchStores))
router.get('/api/stores/near', catchErrors(storeController.mapStores))
router.post('/api/stores/:id/likes', catchErrors(storeController.likesStore))

module.exports = router
