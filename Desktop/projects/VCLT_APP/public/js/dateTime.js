function updateDateTime() {
    const currentDate = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    }).format(currentDate);
    document.getElementById('currentDateTime').textContent = formattedDate;
}
setInterval(updateDateTime, 500);