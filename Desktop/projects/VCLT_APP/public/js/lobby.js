let form = document.getElementById('lobby__form')
let displayName = sessionStorage.getItem('display_name')
if (displayName) {
    form.name.value = displayName
}
var count = 0;
form.addEventListener('submit', (e) => {
    e.preventDefault()
    count++;
    sessionStorage.setItem('display_name', e.target.name.value)

    let inviteCode = e.target.room.value
    let email = e.target.name.value
    if (!inviteCode) {
        inviteCode = String(Math.floor(Math.random() * 10000))
    }
    window.location = `/checkroom/?inviteCode=${inviteCode}&email=${email}`;
    window.location = `/room?room=${inviteCode}&name=${email}`;
})