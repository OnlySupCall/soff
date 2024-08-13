function toggleExtend(button) {
    button.parentNode.parentNode.children[2].classList.toggle("extended");
}

function play(button) {
    button.parentNode.children[1].play();
    button.classList.remove("play");
    button.classList.add("pause");
    button.setAttribute("onclick", "pause(this)");
}

function pause(button) {
    button.parentNode.children[1].pause();
    button.classList.remove("pause");
    button.classList.add("play");
    button.setAttribute("onclick", "play(this)");
}

function restart(button) {
    let source = button.parentNode.children[1];
    source.pause();
    source.currentTime = 0;
    source.play();
}

// const [red, green, blue] = [100, 100, 100]
// const section1 = document;
//
// document.addEventListener("scroll", () => {
//     let height = window.innerHeight;
//     let y = 1 + (window.scrollY || window.pageYOffset);
//     let ratio = (height-y)/height;
//     let color = [255*ratio, 255*ratio, 255*ratio].map(Math.round);
//     document.body.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
// })