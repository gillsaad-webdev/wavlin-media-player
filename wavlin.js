console.log("Spotify script running...")

let currentsong = new Audio()
let songs = []

const SERVER = "http://192.168.0.105:8080"

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
    if (activeIndex !== -1) {
        let sideIcon = document.getElementById(`sideicon-${activeIndex}`)
        if (sideIcon) sideIcon.src = playing ? "pause.svg" : "play.svg"
    }
}

// Songs fetch karo server se
async function getsongs() {
    try {
        let res = await fetch(`${SERVER}/songs/`)
        let text = await res.text()
        let div = document.createElement("div")
        div.innerHTML = text
        let links = div.getElementsByTagName("a")
        let list = []
        for (let link of links) {
            if (link.href.endsWith(".mp3")) {
                let filename = link.getAttribute("href")
                list.push(`${SERVER}/songs/${filename}`)
            }
        }
        return list
    } catch (err) {
        console.error("Songs fetch nahi hui:", err)
        alert("Server se connect nahi ho saka!\nCheck karo:\n1. Server chal raha hai?\n2. SERVER address sahi hai spotify.js mein?")
        return []
    }
}

// Song play karo
const playMusic = (track, pause = false) => {
    currentsong.src = track
    if (!pause) {
        currentsong.play()
        setPlayIcon(true)
    } else {
        setPlayIcon(false)
    }
    let name = decodeURIComponent(track)
        .split("/").pop()
        .replace(".mp3", "")
        .replaceAll("_", " ")
    document.querySelector(".songinfo").innerHTML = name
    document.querySelector(".songtime").innerHTML = "00:00 : 00:00"
}

// Current song ka index
function getCurrentIndex() {
    let currentName = decodeURIComponent(currentsong.src).split("/").pop()
    return songs.findIndex(s => decodeURIComponent(s).split("/").pop() === currentName)
}

async function main() {

    songs = await getsongs()
    console.log("Songs mili:", songs.length, songs)

    if (songs.length === 0) {
        document.querySelector(".songinfo").innerHTML = "Koi song nahi mila"
        return
    }

    playMusic(songs[0], true)

    // Sidebar list banao
    let songul = document.querySelector(".songlist ul")
    songul.innerHTML = ""

    songs.forEach((song, i) => {
        let name = decodeURIComponent(song)
            .split("/").pop()
            .replace(".mp3", "")
            .replaceAll("_", " ")

        let li = document.createElement("li")
        li.dataset.src = song
        li.innerHTML = `
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${name}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img width="26px" class="invert" src="play.svg" alt="" id="sideicon-${i}">
            </div>
        `

        // ✅ FIXED: Same song click = toggle, doosra song = naya play
        li.addEventListener("click", () => {
            let currentIndex = getCurrentIndex()

            if (currentIndex === i) {
                // Same song - toggle karo
                if (currentsong.paused) {
                    currentsong.play()
                    setPlayIcon(true)
                    updateSidebarIcon(i, true)
                } else {
                    currentsong.pause()
                    setPlayIcon(false)
                    updateSidebarIcon(i, false)
                }
            } else {
                // Naya song play karo
                updateSidebarIcon(i, true)
                playMusic(song)
            }
        })

        songul.appendChild(li)
    })

    // Bottom bar Play/Pause button
    document.getElementById("play").addEventListener("click", () => {
        let index = getCurrentIndex()
        if (currentsong.paused) {
            currentsong.play()
            setPlayIcon(true)
            updateSidebarIcon(index, true)
        } else {
            currentsong.pause()
            setPlayIcon(false)
            updateSidebarIcon(index, false)
        }
    })

    // Space bar se play/pause
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space" && e.target.tagName !== "INPUT") {
            e.preventDefault()
            let index = getCurrentIndex()
            if (currentsong.paused) {
                currentsong.play()
                setPlayIcon(true)
                updateSidebarIcon(index, true)
            } else {
                currentsong.pause()
                setPlayIcon(false)
                updateSidebarIcon(index, false)
            }
        }
    })

    // Arrow keys se seek
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
            currentsong.currentTime = Math.min(currentsong.currentTime + 5, currentsong.duration)
        } else if (e.key === "ArrowLeft") {
            currentsong.currentTime = Math.max(currentsong.currentTime - 5, 0)
        }
    })

    // Seekbar update
    currentsong.addEventListener("timeupdate", () => {
        if (!currentsong.duration) return
        let pct = (currentsong.currentTime / currentsong.duration) * 100
        document.querySelector(".circle").style.left = pct + "%"
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentsong.currentTime)} : ${secondsToMinutesSeconds(currentsong.duration)}`
    })

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let pct = (e.offsetX / e.currentTarget.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = pct + "%"
        currentsong.currentTime = (currentsong.duration * pct) / 100
    })

    // Song khatam - next chalao
    currentsong.addEventListener("ended", () => {
        let index = getCurrentIndex()
        if (index + 1 < songs.length) {
            updateSidebarIcon(index + 1, true)
            playMusic(songs[index + 1])
        } else {
            playMusic(songs[0], true)
            setPlayIcon(false)
            updateSidebarIcon(-1, false)
        }
    })

    // Next button
    document.getElementById("next").addEventListener("click", () => {
        let index = getCurrentIndex()
        if (index + 1 < songs.length) {
            updateSidebarIcon(index + 1, true)
            playMusic(songs[index + 1])
        }
    })

    // Previous button
    document.getElementById("previous").addEventListener("click", () => {
        if (currentsong.currentTime > 3) {
            currentsong.currentTime = 0
            return
        }
        let index = getCurrentIndex()
        if (index - 1 >= 0) {
            updateSidebarIcon(index - 1, true)
            playMusic(songs[index - 1])
        }
    })

    // Volume slider
    document.querySelector(".range input").addEventListener("input", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
    })

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        let left = document.querySelector(".left")
        left.style.display = "block"
        left.style.left = "0"
    })

    // Close sidebar
    document.querySelector(".close").addEventListener("click", () => {
        let left = document.querySelector(".left")
        left.style.left = "-200%"
        setTimeout(() => left.style.display = "none", 300)
    })

    // Cards pe click
    document.querySelectorAll(".card .play").forEach((btn, i) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation()

            const cardKeywords = ["safar", "Cartel", "Drake", "On the Floor", "Kami", "khasara", "Olivia Rodrigo", "on top", "Opening Credits", "Sadi Sun", "Broken",
                "Moves", "Udi Udi", "wavy"]

            let keyword = cardKeywords[i]
            let matched = songs.find(song =>
                decodeURIComponent(song).toLowerCase().includes(keyword.toLowerCase())
            )

            if (matched) {
                let matchedIndex = songs.indexOf(matched)
                updateSidebarIcon(matchedIndex, true)
                playMusic(matched)
            } else {
                alert("Song nahi mila: " + keyword)
            }
        })
    })
}

main()
// http-server -p 8080 --cors