function autocomplete (input, lngInput, latInput) {
    if(!input) return

    const dropdown = new google.maps.places.Autocomplete(input)

    dropdown.addListener('place_changed', function (event) {
        const place = dropdown.getPlace()
        
        input.value = place.formatted_address
        lngInput.value = place.geometry.location.lng()
        latInput.value = place.geometry.location.lat()
    })

    // If someone hits enter on the address field, don't submit form
    input.on('keydown', e => { // on comes from bling.js
        if(e.keyCode === 13) e.preventDefault()
    })
}

export default autocomplete