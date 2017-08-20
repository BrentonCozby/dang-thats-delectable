import axios from 'axios'
import DOMpurify from 'dompurify'
import {PUBLIC_PATH} from '../../../config.js'

function _generateResultsHTML(stores = []) {
    return stores.map(store => `
        <a href="${PUBLIC_PATH}stores/${store.slug}" class="search__result">
            <strong>${store.name}</strong>
        </a>
    `).join('')
}

export default function typeAhead(search) {
    if(!search) return false

    const input = search.querySelector('input[name="search')
    const results = search.querySelector('.search__results')

    input.on('input', e => {
        const searchTerm = DOMpurify.sanitize(e.currentTarget.value)

        if(!searchTerm) {
            results.style.display = 'none'
            return false
        }

        results.style.display = 'block'

        axios
            .get(`${PUBLIC_PATH}api/search?q=${searchTerm}`)
            .then(res => {
                if(res.data.length) {
                    results.innerHTML = _generateResultsHTML(res.data)
                }
                else {
                    results.innerHTML = `
                        <span class="search__result">No results found for <strong>${searchTerm}</strong></span>
                    `
                }
            })
            .catch(err => console.error)
    })

    input.on('keyup', e => {
        if(![38, 40, 13].includes(e.keyCode)) return false

        const current = results.querySelector('.search__result--active')
        const items = results.querySelectorAll('.search__result')
        let next;

        if(e.keyCode === 40) {
            if(current)
                next = current.nextElementSibling || items[0]
            else
                next = items[0]
        }

        if(e.keyCode === 38) {
            if(current)
                next = current.previousElementSibling || items[items.length - 1]
            else
                next = items[items.length - 1]
        }

        if(e.keyCode === 13 && current && current.href)
            return window.location = current.href

        
        if(current)
            current.classList.remove('search__result--active')
    
        next.classList.add('search__result--active')
    })
}