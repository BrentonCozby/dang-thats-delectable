import mongoose from 'mongoose'
mongoose.Promise = Promise
import sanitizeHTML from 'sanitize-html'

const reviewSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'Author required'
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: 'Store required'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    created: {
        type: Date,
        default: Date.now
    },
    text: {
        type: String,
        trim: true
    }
})

function autoPopulate (next) {
    this.populate('author')
    next()
}

reviewSchema.pre('find', autoPopulate)
reviewSchema.pre('findOne', autoPopulate)

reviewSchema.pre('save', function(next) {
    this.text = sanitizeHTML(this.text, {
        allowedTags: ['b', 'i', 'strong', 'em', 'a', 'ul', 'li', 'ol', 'br', 'p', 'abbr'],
        allowedAttributes: {
            'a': ['href']
        }
    })

    next()
})

export default mongoose.model('Review', reviewSchema)