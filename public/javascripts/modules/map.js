import axios from 'axios'
import { $ } from './bling.js'
import { PUBLIC_PATH } from '../../../config.js'

const mapOptions = {
    center: {
        lng: -79.842,
        lat: 43.251
    },
    zoom: 12,
    gestureHandling: 'cooperative'
}

function _getCurrentPosition () {
    return new Promise((resolve, reject) => {
        if(navigator && navigator.geolocation) {
            const success = function(position) {
                resolve({
                    lng: position.coords.longitude,
                    lat: position.coords.latitude
                })
            }

            const error = function(err) {
                console.warn(`ERROR(${err.code}): ${err.message}`)
            }
            
            navigator.geolocation.getCurrentPosition(success, error)
        }

        else {
            resolve(null)
        }
    })
}

function _createMarkers(map, places) {
    const bounds = new google.maps.LatLngBounds()
    const infoWindow = new google.maps.InfoWindow()
    
    const markers = places.map(place => {
        const [placeLng, placeLat] = place.location.coordinates
        const position = {lng: placeLng, lat: placeLat}

        bounds.extend(position)

        const marker = new google.maps.Marker({
            map,
            position
        })

        marker.place = place

        return marker
    })

    markers.forEach(marker => {
        marker.addListener('click', function() {
            const { place } = this

            const html = `
                <div class="popup">
                    <a href="${PUBLIC_PATH}stores/${place.slug}">
                        <img src="${PUBLIC_PATH}uploads/${place.photo || 'store.png'}" alt="${place.name}">
                        <h4 class="name">${place.name}</h4>
                        <p class="address">${place.location.address}</p>
                    </a>
                </div>
            `

            infoWindow.setContent(html)
            infoWindow.open(map, this)
        })
    })

    map.panTo(bounds.getCenter())
    map.fitBounds(bounds)
}

function _loadPlaces (map, lng, lat) {
    if(!lng || !lat) {
        _getCurrentPosition().then(coords => {
            if(!coords) return false

            _loadPlaces(map, coords.lng, coords.lat).then(places => {
                if(!places.length)
                    return console.log('No places found within 30 km of your location')

                _createMarkers(map, places)
            })
        })
    }

    return new Promise((resolve, reject) => {
        axios
            .get(`${PUBLIC_PATH}api/stores/near?lng=${lng || -79.842}&lat=${lat || 43.251}`)
            .then(res => {
                resolve(res.data)
            })
            .catch(console.error)
    })
}


export default function makeMap(mapDiv) {
    if(!mapDiv) return false
    
    const map = new google.maps.Map(mapDiv, mapOptions)

    _loadPlaces(map).then(places => {
        if(!places.length)
            return alert('No stores found!')

        _createMarkers(map, places)
    })

    const input = $('input[name="geolocate')
    const autocomplete = new google.maps.places.Autocomplete(input)

    autocomplete.addListener('place_changed', function (event) {
        const place = autocomplete.getPlace()

        _loadPlaces(map, place.geometry.location.lng(), place.geometry.location.lat()).then(places => {
            if(!places.length)
                return alert('No stores found!')
    
            _createMarkers(map, places)
        })
    })
}