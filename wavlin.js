console.log("Wavlin Media Player running...")

let currentsong = new Audio()
let songs = []
let currentIndex = -1

// GitHub Pages ke liye hamesha relative path use karo (root slash "/" kabhi mat lagao)
const SONGS_FOLDER = "songs"

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00"
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function setPlayIcon(playing) {
    let btn = document.getElementById("play")
    if (!btn) return
    btn.src = playing ? "pause.svg" : "play.svg"
    btn.title = playing ? "Pause" : "Play"
}

// Ek specific song ko index se play karo
function playSongAt(index) {
    if (index < 0 || index >= songs.length) return
    currentIndex = index

    // encodeURIComponent zaroori hai kyun ke filenames mein spaces, & , ( ) waghera hain
    const fileName = songs[currentIndex]
    currentsong.src = `${SONGS_FOLDER}/${encodeURIComponent(fileName)}`

    currentsong.play()
        .then(() => setPlayIcon(true))
        .catch(err => console.error("Play error:", err))

    updateSongInfo(currentIndex)
}

function updateSongInfo(index) {
    let cards = document.querySelectorAll(".card")
    let card = cards[index]
    let infoBox = document.querySelector(".songinfo")
    if (card && infoBox) {
        let title = card.querySelector("h4")?.innerText || "Unknown"
        let artist = card.querySelector(".page")?.innerText || ""
        infoBox.innerText = artist ? `${title} - ${artist}` : title
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // songs.json root se load karo (relative path, GitHub Pages ke liye zaroori)
    fetch("songs.json")
        .then(res => res.json())
        .then(data => {
            songs = data
            setupCardClicks()
        })
        .catch(err => console.error("songs.json load error:", err))

    // Play/Pause button
    let playBtn = document.getElementById("play")
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (currentIndex === -1) {
                if (songs.length > 0) playSongAt(0)
                return
            }
            if (currentsong.paused) {
                currentsong.play()
                setPlayIcon(true)
            } else {
                currentsong.pause()
                setPlayIcon(false)
            }
        })
    }

    // Next / Previous
    let nextBtn = document.getElementById("next")
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (songs.length === 0) return
            playSongAt((currentIndex + 1) % songs.length)
        })
    }

    let prevBtn = document.getElementById("previous")
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (songs.length === 0) return
            playSongAt((currentIndex - 1 + songs.length) % songs.length)
        })
    }

    // Seekbar drag/click
    let seekbar = document.querySelector(".seekbar")
    if (seekbar) {
        seekbar.addEventListener("click", (e) => {
            let percent = (e.offsetX / seekbar.getBoundingClientRect().width)
            currentsong.currentTime = currentsong.duration * percent
            let circle = seekbar.querySelector(".circle")
            if (circle) circle.style.left = (percent * 100) + "%"
        })
    }

    // Volume slider
    let volumeInput = document.querySelector(".range input[type='range']")
    if (volumeInput) {
        volumeInput.addEventListener("input", (e) => {
            currentsong.volume = e.target.value / 100
        })
    }

    // Sidebar hamburger open/close (agar page par mojood ho)
    let hamburger = document.querySelector(".hamburger")
    let closeBtn = document.querySelector(".close")
    let left = document.querySelector(".left")
    if (hamburger && left) {
        hamburger.addEventListener("click", () => {
            left.style.display = "block"
            left.style.left = "0"
        })
    }
    if (closeBtn && left) {
        closeBtn.addEventListener("click", () => {
            left.style.left = "-200%"
            setTimeout(() => left.style.display = "none", 300)
        })
    }
})

// Audio events
currentsong.addEventListener("timeupdate", () => {
    let seekbar = document.querySelector(".seekbar")
    let circle = seekbar?.querySelector(".circle")
    let songtime = document.querySelector(".songtime")
    if (currentsong.duration) {
        let percent = (currentsong.currentTime / currentsong.duration) * 100
        if (circle) circle.style.left = percent + "%"
    }
    if (songtime) {
        songtime.innerText = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
    }
})

currentsong.addEventListener("ended", () => {
    if (songs.length === 0) return
    playSongAt((currentIndex + 1) % songs.length)
})

function setupCardClicks() {
    let cards = document.querySelectorAll(".card")
    cards.forEach((card, index) => {
        let playIcon = card.querySelector(".play")
        if (playIcon) {
            playIcon.style.cursor = "pointer"
            playIcon.addEventListener("click", (e) => {
                e.preventDefault()
                playSongAt(index)
            })
        }
    })
}
