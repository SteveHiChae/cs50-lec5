
document.addEventListener("DOMContentLoaded", function() {

    document.querySelector('form').onsubmit = function() {
        const base = document.querySelector('#currency').value.toUpperCase()

        fetch_currency(base)

        return false
    }
})


function fetch_currency(unit) {

    fetch('http://api.exchangeratesapi.io/v1/latest?access_key=32f01be4832926906d4301480d01b7fc&base=EUR')
    .then(response => response.json())
    .then(data => {

        // console.log(data.rates)
        const rate = data.rates[unit]

        if (rate !== undefined) {
            document.querySelector('.currency').innerHTML = `1 EUR currency equals to ${rate.toFixed(2)} ${unit}`
        } else {
            document.querySelector('.error').innerHTML = 'Invalid currency'
        }

    })
    .catch(error => {
        document.querySelector('.error').innerHTML = error
    })

}