import axios from 'axios'
import { $ } from './bling.js'

function ajaxLike (e) {
    e.preventDefault()

    axios
        .post(this.action)
        .then(res => {
            // form.like where 'like' is the name property of an element in the form
            const isLiked = this.like.classList.toggle('like__button--liked')

            if(isLiked) {
                this.like.classList.add('like__button--float')
                setTimeout(() =>  this.like.classList.remove('like__button--float'), 2500)
            }

            $('.like-count').textContent = res.data.likes.length
        })
        .catch(console.error)
}

export default ajaxLike