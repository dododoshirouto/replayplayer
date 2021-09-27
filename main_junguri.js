videoId = 0;
videos = [];

inp_file.addEventListener('change', ev => {
    console.log(inp_file.files)
    if (inp_file.files.length == 0) return;
    videos = inp_file.files;
    video.src = window.URL.createObjectURL(videos[0]);
    video.load();
    videoId = 0;
    inp_file.setAttribute('hidden', 'hidden');
});

video.addEventListener('ended', _ => {
    endflag = false;
    black.classList.remove('black');
    videoId++;
    if (videoId == videos.length) {
        videoId = 0;
        inp_file.value = "";
        inp_file.removeAttribute('hidden');
        return;
    }
    video.src = window.URL.createObjectURL(videos[videoId]);
    video.play();
})

// video.addEventListener('dragenter', _ => { video.style.pointerEvents = 'none'; });

// inp_file.addEventListener('dragleave', _ => { video.style.pointerEvents = 'all'; });
// inp_file.addEventListener('drop', _ => { video.style.pointerEvents = 'all'; });
// inp_file.addEventListener('dragend', _ => { video.style.pointerEvents = 'all'; });

// video.addEventListener('click', _=>{ if(!video.readyState)return; if(video.paused){video.play();}else{video.pause();} });

// seeking = false;
// seekstarttime = 0;
// seekstartmousex = 0;
// video.addEventListener('mousedown', ev => { if (!video.readyState) return; seeking = true; seekstarttime = video.currentTime; seekstartmousex = ev.clientX; });
// video.addEventListener('mouseup', _ => { seeking = false; });
// video.addEventListener('mouseleave', _ => { seeking = false; });
// video.addEventListener('mousemove', ev => {
//     if (!video.readyState) return;
//     if (!seeking) return;
//     if (!video.paused) video.pause();
//     video.currentTime = Math.clip((ev.clientX - seekstartmousex) * (video.duration / window.innerWidth) + seekstarttime, video.duration, 0);
//     return false;
// })

window.addEventListener('keydown', ev => {
    document.getElementsByTagName('TITLE')[0].innerText = ev.key;
    if (ev.key == 'Escape') {
        video.src = '';
        inp_file.value = '';
        inp_file.removeAttribute('hidden');
        return false;
    }
    if (!video.readyState) return;
    if (ev.key == ' ') {
        if (video.paused) { video.play(); } else { video.pause(); }
        black.classList.remove('black');
        setIntv();
        return false;
    }
    if (ev.key == 'r') {
        video.pause();
        video.currentTime = 0;
        return false;
    }
})


intvId = -1;
function setIntv() {
    if (intvId>=0) clearInterval(intvId);
    intvId = setInterval(intvMain, 20);
}
endflag = false;
function intvMain() {

    info.innerText = '$1/$2 $3:$4'.format(videoId+1, videos.length, Math.floor((video.duration - video.currentTime) / 60), ('0'+Math.floor((video.duration - video.currentTime)%60)).slice(-2) );

    if (video.currentTime <= 0.55) {
        video.volume = Math.clip( video.currentTime / 0.55 , 1, 0);
    }
    else
    if (video.duration - video.currentTime <= 0.55) {
        video.volume = Math.clip((video.duration - video.currentTime) / 0.55, 1, 0);

        if (!endflag) {
            black.classList.add('black');
            endflag = true;
        }
    }

}