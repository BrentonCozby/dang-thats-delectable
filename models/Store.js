import mongoose from 'mongoose'
mongoose.Promise = Promise
import slug from 'slugs'
import sanitizeHTML from 'sanitize-html'

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must provide coordinates!'
        }],
        address: {
            type: String,
            required: 'You must provide an address!'
        }
    },
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'Author required'
    }
})

// Define Indexes
storeSchema.index({
    name: 'text',
    description: 'text'
})

storeSchema.index({
    location: '2dsphere'
})

storeSchema.pre('save', function(next) {
    this.name = sanitizeHTML(this.name, {
        allowedTags: []
    })

    this.description = sanitizeHTML(this.description, {
        allowedTags: ['b', 'i', 'strong', 'em', 'a', 'ul', 'li', 'ol', 'br', 'p', 'abbr'],
        allowedAttributes: {
            'a': ['href']
        }
    })

    this.location.address = sanitizeHTML(this.location.address, {
        allowedTags: []
    })

    this.photo = sanitizeHTML(this.photo, {
        allowedTags: []
    })

    if(this.photo === 'undefined')
        this.photo = undefined

    next()
})

// must use regular function instead of arrow so that this keyword works properly
storeSchema.pre('save', async function(next) {
    if(this.isModified('name') === false) {
        return next()
    }
    this.slug = slug(this.name)

    const pattern = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i')

    // this.constructor is the Store model (which is created from this Schema)
    const storesWithSlug = await this.constructor.find({slug: pattern})

    if(storesWithSlug.length) {
        this.slug = `${this.slug}-${storesWithSlug.length + 1}`
    }

    next()
})

storeSchema.statics.getTagsList = function() {
    return this.aggregate([
        {$unwind: '$tags'},
        {$group: {_id: '$tags', count: {$sum: 1}}},
        {$sort: {count: -1}}
    ])
}

storeSchema.statics.getTopStores = function() {
    return this.aggregate([
        // lookup stores and populate their reviews
        {$lookup: {
            from: 'reviews', // MongoDB will change the model name ('Review') to be lowercase and have an 's' at the end
            localField: '_id',
            foreignField: 'store',
            as: 'reviews'
        }},
        // filter for only items that have 2 or more reviews
        {$match: {
            'reviews.1': { $exists: true } // reviews.1 means the second item (first index). We check if it exists
        }},
        // add the 'average reviews' field
        {$addFields: {
            averageRating: { $avg: '$reviews.rating' }
        }},
        // sort by the new averageRating field
        {$sort: {
            averageRating: -1 // -1 is descending order
        }},
        // limit to 10
        {$limit: 10}
    ])
}

// virtual populate. Find stores where store._id === review.store
storeSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id', // _id field on the store
    foreignField: 'store' // store field on the review
})

function autoPopulate (next) {
    this.populate('reviews')
    next()
}

storeSchema.pre('find', autoPopulate)
storeSchema.pre('findOne', autoPopulate)

export default mongoose.model('Store', storeSchema)
