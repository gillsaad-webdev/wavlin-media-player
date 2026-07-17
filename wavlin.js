console.log("Spotify script running...")

let currentsong = new Audio()
let songs = []

const SERVER = "." // GitHub Pages ke liye relative path use karo

// Time format helper
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00"
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Play/Pause icon update helper
function setPlayIcon(playing) {
    let btn = document.getElementById("play")
    if (playing) {
        btn.src = "pause.svg"
        btn.title = "Pause"
    } else {
        btn.src = "play.svg"
        btn.title = "Play"
    }
}

// Sidebar ka active song icon update karo
function updateSidebarIcon(activeIndex, playing) {
    document.querySelectorAll(".playnow img").forEach(img => img.src = "play.svg")
    if (activeIndex != -1) {
        let sideIcon = document.getElementById(`sideicon-${activeIndex}`)
        if (sideIcon) sideIcon.src = playing ? "pause.svg" : "play.svg"
    }
}

// Baqi ka sara code wese hi rehne do
// Bas jahan bhi fetch ya audio.src me SERVER use hua hai wo ab "." ban jayega
// Example: fetch(`${SERVER}/songs.json`) => fetch(`./songs.json`)