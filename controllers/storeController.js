import mongoose from 'mongoose'
const Store = mongoose.model('Store') // able to do this because we import Store.js in start.js
const User = mongoose.model('User')
import multer from 'multer'
import jimp from 'jimp'
import uuid from 'uuid'

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/')

        if(isPhoto) {
            next(null, true)
        }
        else {
            next({message: 'That file type isn\'t allowed'}, false)
        }
    }
}

export const upload = multer(multerOptions).single('photo')

export async function resize(req, res, next) {
    if(!req.file) return next()
    
    const extension = req.file.mimetype.split('/')[1]

    req.body.photo = `${uuid.v4()}.${extension}`
    const photo = await jimp.read(req.file.buffer)
    await photo.resize(800, jimp.AUTO)
    await photo.write(`./public/uploads/${req.body.photo}`)

    next()
}

export function homepage(req, res) {
    res.render('index', {title: 'Home'})
}

export function addStore(req, res) {
    res.render('editStore', {title: 'Add Store'})
}

// Async functions must be wrapped in the catchErrors function in routes/index.js
export async function createStore(req, res) {
    req.body.author = req.user._id
    const store = await (new Store(req.body)).save()
    req.flash('success', `Successfully created ${store.name}. Help out this store by leaving a review!`)
    res.redirect(`/stores/${store.slug}`)
}

const _confirmOwner = (store, user) => {
    // when comparing an ObjectId to a string, you need to use the .equals() method
    if(!user || !store.author.equals(user._id)) {
        throw new Error('You must own that store in order to edit it!')
    }
}

// Async functions must be wrapped in the catchErrors function in routes/index.js
export async function getStores(req, res) {
    const page = req.params.page || 1
    const limit = 6
    const skip = (page * limit) - limit
    
    const storesPromise = Store
        .find()
        .skip(skip)
        .limit(limit)
        .sort({created: 'desc'})

    const countPromise = Store.count()

    const [stores, count] = await Promise.all([storesPromise, countPromise])

    const pages = Math.ceil(count / limit)

    if(!stores.length && skip) {
        req.flash('info', `You asked for page ${page}, but it doesn't exist! So we've put you on the last page.`)
        res.redirect(`/stores/page/${pages}`)
    }

    res.render('stores', {title: 'Stores', stores, page, pages, count })
}

export async function getStoreBySlug(req, res, next) {
    // the .populate('author') method will replace the 'author' property's value from
    // an ObjectId string to the full object data that this ObjectId belongs to
    const store = await Store.findOne({slug: req.params.slug}).populate('author reviews')
    if(!store) return next()

    res.render('store', {store, title: store.name})
}

// go to the form with the store data
export async function editStore(req, res) {
    const store = await Store.findOne({_id: req.params.id})
    _confirmOwner(store, req.user)
    res.render('editStore', {title: `Edit ${store.name}`, store})
}

// update the store data in MongoDB
export async function updateStore(req, res) {
    // findOneAndUpdate doesn't use the Scehma validation
    // so we have to set the location type here
    req.body.location.type = 'Point'
    
    const store = await Store.findOneAndUpdate(
        {_id: req.params.id},
        req.body,
        {
            new: true, // findOneAndUpdate will return the new store, not the old one
            runValidators: true // validate against the Model definitions
        }
    ).exec()

    req.flash('success', `Successfully update <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store →</a>`)
    res.redirect(`/stores/${store._id}/edit`)
}

export async function getStoresByTag(req, res) {
    const activeTag = req.params.tag

    const [ tags, stores ] = await Promise.all([
        Store.getTagsList(),
        Store.find({tags: activeTag || {$exists: true}})
    ])

    res.render('tags', {
        tags,
        stores,
        title: 'tags',
        activeTag
    })
}

export async function searchStores (req, res) {
    const stores = await Store.find({
        $text: {
            $search: req.query.q
        }
    }, {
        score: {
            $meta: 'textScore'
        }
    })
    .sort({
        score: {
            $meta: 'textScore'
        }
    })
    .limit(5)

    res.json(stores)
}

export async function mapStores (req, res) {
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat)

    const q = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates
                },
                $maxDistance: 30000 // meters
            }
        }
    }

    const stores = await Store
        .find(q)
        .select('slug name description location photo')
    
    res.json(stores)
}

export function mapPage(req, res) {
    res.render('map', {title: 'Map'})
}

export async function likesStore (req, res) {
    const likes = req.user.likes.map(obj => obj.toString())
    
    const operator = likes.includes(req.params.id)
        ? '$pull'
        : '$addToSet'

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { [operator]: { likes: req.params.id } },
        { new: true }
    )

    res.json(user)
}

export async function getLikes (req, res) {
    const likedStores = await Store.find({_id: { $in: req.user.likes }})

    res.render('stores', {title: 'Liked Stores', stores: likedStores })
}

export async function getTopStores (req, res) {
    const topStores = await Store.getTopStores()
    res.render('topStores', {title: 'Top Stores', stores: topStores})
}