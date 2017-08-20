import mongoose from 'mongoose'
import sanitizeHTML from 'sanitize-html'
const Schema = mongoose.Schema
mongoose.Promise = Promise
import { createHash } from 'crypto'
import validator from 'validator'
import mongodbErrorHandler from 'mongoose-mongodb-errors'
import passportLocalMongoose from 'passport-local-mongoose'

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Unacceptable email address'],
        required: 'Email address required'
    },
    name: {
        type: String,
        required: 'Name required',
        trim: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Store'
    }]
})

userSchema.virtual('gravatar').get(function() {
    const hash = createHash('md5').update(this.email).digest("hex")
    return `https://gravatar.com/avatar/${hash}?s=200`
})

userSchema.pre('save', function(next) {
    this.email = sanitizeHTML(this.email, {
        allowedTags: []
    })

    this.name = sanitizeHTML(this.name, {
        allowedTags: []
    })

    next()
})

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'})
userSchema.plugin(mongodbErrorHandler)

export default mongoose.model('User', userSchema)