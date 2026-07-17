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