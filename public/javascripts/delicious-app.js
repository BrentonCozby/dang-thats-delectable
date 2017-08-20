import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete'
import typeAhead from './modules/typeAhead.js'
import makeMap from './modules/map.js'
import ajaxLike from './modules/like.js'

autocomplete( $('#address'), $('#lng'), $('#lat') )

typeAhead( $('.search') )

makeMap( $('#map') )

const likeForms = $$('form.like')

likeForms.on('submit', ajaxLike)