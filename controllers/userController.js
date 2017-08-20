import mongoose from 'mongoose'
const User = mongoose.model('User') // able to do this because we import User.js in start.js
import promisify from 'es6-promisify'

export function loginForm(req, res) {
    res.render('login', {title: 'Login'})
}

export function registerForm(req, res) {
    res.render('register', {title: 'Register'})
}

export function validateRegister(req, res, next) {
    // The following validation methods come from expressValidator, set in app.js
    req.sanitizeBody('name')
    req.checkBody('name', 'Name is required').notEmpty()

    req.checkBody('email', 'Email is required').notEmpty()
    req.checkBody('email', 'Unacceptable email address').isEmail()
    req.sanitizeBody('email')
        .normalizeEmail({
            all_lowercase: true,
            gmail_convert_googlemaildotcom: true,
            gmail_remove_dots: false,
            remove_extension: false,
            gmail_remove_subaddress: false
        })

    req.checkBody('password', 'Password required').notEmpty()
    req.checkBody('password-confirm', 'Password confirmation required').notEmpty()
    req.checkBody('password-confirm', 'Passwords do not match').equals(req.body.password)

    const errors = req.validationErrors()

    if(errors) {
        req.flash('error', errors.map(err => err.msg))
        res.render('register', {
            title: 'Register',
            body: req.body,
            flashes: req.flash()
        })
        return
    }

    next()
}

export async function register(req, res, next) {
    const user = new User({email: req.body.email, name: req.body.name})

    // User.register method comes from passport-local-mongoose plugin
    const register = promisify(User.register, User)

    // save user to DB with a salt and a hash in place of the actual password
    await register(user, req.body.password)
    next()
}

export function account (req, res) {
    res.render('account', {title: 'Edit Your Account'})
}

export async function updateAccount (req, res) {
    const updates = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findOneAndUpdate(
        {_id: req.user._id},
        {$set: updates},
        {new: true, runValidators: true, context: 'query'}
    )

    req.flash('success', 'Account successfully updated!')
    res.redirect('back')
}