import passport from 'passport'
import mongoose from 'mongoose'
const User = mongoose.model('User')
import { randomBytes } from 'crypto'
import promisify from 'es6-promisify'
import * as mail from '../handlers/mail.js'
import { PUBLIC_PATH } from '../config.js'

// need to configure passport to use 'local' or any other passport strategy in handlers/passport.js
export const login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed login.',
    successRedirect: '/',
    successFlash: 'You are now logged in.'
})

export function logout(req, res) {
    req.logout()
    req.flash('success', 'You are now logged out.')
    res.redirect(PUBLIC_PATH + '')
}

export function isLoggedIn(req, res, next) {
    // isAuthenticated is a passport.js method
    if(req.isAuthenticated()) {
        return next()
    }

    req.flash('error', 'Oops! You must be logged in to do that!')
    res.redirect(PUBLIC_PATH + 'login')
}

export async function forgot (req, res) {
    const user = await User.findOne({email: req.body.email})

    if(!user) {
        // Don't tell the user that no email exists: this would allow bad people to check if
        // someone has an account, and then create one for them if there is no account
        req.flash('success', 'You have been emailed a password reset link!')
        return res.redirect(PUBLIC_PATH + 'login')
    }

    user.resetPasswordToken = randomBytes(20).toString('hex')
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour from now
    await user.save()

    const resetURL = `http://${req.headers.host}${PUBLIC_PATH}account/reset/${user.resetPasswordToken}`
    mail.send({
        user,
        subject: 'Password Reset - Dang Thats Delectable',
        resetURL,
        filename: 'password-reset.ejs'
    })

    req.flash('success', 'You have been emailed a password reset link!')
    res.redirect(PUBLIC_PATH + 'login')
}

export async function reset (req, res) {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()} // token has been set for 1 hour in the future, so we check if the resetPasswordExpires is a time that is still greater than the current time
    })

    if(!user) {
        req.flash('error', 'Password reset link is invalied or has expired.')
        return res.redirect(PUBLIC_PATH + 'login')
    }

    res.render('reset', {title: 'Reset Your Password'})
}

export function confirmPasswords (req, res, next) {
    if(req.body.password === req.body['password-confirm']) {
        return next()
    }

    req.flash('error', 'Passwords do not match!')
    res.redirect('back')
}

export async function update (req, res) {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()} // token has been set for 1 hour in the future, so we check if the resetPasswordExpires is a time that is still greater than the current time
    })

    if(!user) {
        req.flash('error', 'Password reset link is invalied or has expired.')
        return res.redirect(PUBLIC_PATH + 'login')
    }

    const setPassword = promisify(user.setPassword, user)

    await setPassword(req.body.password)

    // in mongoose, if you have an instance of a model (user) and if a property on that instance has an undefined value, it will be deleted
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    const updatedUser = await user.save()

    await req.login(updatedUser)
    req.flash('success', 'Success! Your password has been reset.')

    res.redirect(PUBLIC_PATH + '')
}