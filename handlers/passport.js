import passport from 'passport'
import mongoose from 'mongoose'
const User = mongoose.model('User')

// User.createStrategy, serializeUser, and deserializeUser come
// from the passport-local-mongoose plugin
passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

