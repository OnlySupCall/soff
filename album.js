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