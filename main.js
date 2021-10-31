version = document.querySelector('meta[name=version]').content;
document.title += ' ver.' + version;


videoId = 0;
videos = [];

// フェードタイムを指定
transition_time_s = 0.55;

black.style.transition = 'opacity ' + (transition_time_s * 1000) +'ms ease-in-out';

inp_file.addEventListener('change', ev => {
    // ファイル読み込み時の動作

    // console.log(inp_file.files);
    if (inp_file.files.length == 0) return;
    videos = inp_file.files;
    video.src = window.URL.createObjectURL(videos[0]);
    video.load();
    videoId = 0;
    speedMultip = 0;
    video.playbackRate = getSpeedMultip();
    setTimeout(_=>{
        inp_file.setAttribute('hidden', 'hidden');
        videoEndTime = video.duration;
        setInfoText();
    }, 100);
});

window.addEventListener('keydown', e=>{
    document.activeElement.blur();
});

video.addEventListener('ended', _ => {
    endflag = false;
    startNext();
})

// video.addEventListener('dragenter', _ => { video.style.pointerEvents = 'none'; });

// inp_file.addEventListener('dragleave', _ => { video.style.pointerEvents = 'all'; });
// inp_file.addEventListener('drop', _ => { video.style.pointerEvents = 'all'; });
// inp_file.addEventListener('dragend', _ => { video.style.pointerEvents = 'all'; });

// video.addEventListener('click', _=>{ if(!video.readyState)return; if(video.paused){video.play();}else{video.pause();} });

seeking = false;
seekstarttime = 0;
seekstartmousex = 0;
video.addEventListener('mousedown', ev => { if (!video.readyState) {seeking = false; return;} seeking = true; seekstarttime = video.currentTime; seekstartmousex = ev.clientX; video.requestPointerLock(); });
video.addEventListener('mouseup', _ => { seeking = false; document.exitPointerLock() });
video.addEventListener('mouseleave', _ => { seeking = false; document.exitPointerLock() });
video.addEventListener('mousemove', ev => {
    if (!video.readyState) return;
    if (!seeking) return;
    if (!video.paused) video.pause();
    // video.currentTime = Math.clip((ev.clientX - seekstartmousex) * (video.duration / window.innerWidth) + seekstarttime, video.duration, 0);
    video.currentTime += (ev.movementX) * (video.duration / window.innerWidth);
    return false;
});
setInterval(_ => {
    consoles.innerText = "";
    consoles.innerText += "video.readyState: "+video.readyState;
    consoles.innerText += "\nseeking: "+seeking;
    consoles.innerText += "\nvideo.paused: "+video.paused;
}, 100);



window.addEventListener('keydown', ev => {
    // document.getElementsByTagName('TITLE')[0].innerText = ev.key;

    if (ev.key == 'Escape') {
        // 動画データを消去
        video.src = '';
        inp_file.value = '';
        inp_file.removeAttribute('hidden');
        setInfoText();
        return false;
    }
    if (ev.key == 'l') {
        is_loop.checked = !is_loop.checked;
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
        // 再生状態をリセット
        videoId = 0;
        video.src = window.URL.createObjectURL(videos[videoId]);
        video.load();
        video.pause();
        video.currentTime = 0;
        setInfoText();
        return false;
    }
    if (ev.key == 'ArrowRight') {
        // 次の動画へ
        videoEndTime = Math.min(video.currentTime + transition_time_s + 0.1, video.duration);
        videoId = Math.min(videoId + 1, videos.length);
        speedMultip = 0;
        video.playbackRate = getSpeedMultip();
        return false;
    }
    if (ev.key == 'ArrowLeft') {
        // 前の動画へ
        videoEndTime = Math.min( video.currentTime + transition_time_s + 0.1, video.duration );
        videoId = Math.max(videoId - 1, 0);
        speedMultip = 0;
        video.playbackRate = getSpeedMultip();
        return false;
    }

    if (ev.key == 'ArrowUp') {
        // 倍速
        if (speedMultip < 3) speedMultip++;
        video.playbackRate = getSpeedMultip();
        return false;
    }

    if (ev.key == 'ArrowDown') {
        // 減速
        if (speedMultip > -3) speedMultip--;
        video.playbackRate = getSpeedMultip();
        return false;
    }
})

// 倍速ランク
speedMultip = 0;
// 倍速率を取得する
getSpeedMultip = _=>{ return Math.pow(2,speedMultip); }


intvId = -1;
function setIntv() {
    if (intvId>=0) clearInterval(intvId);
    intvId = setInterval(intvMain, 20);
}
function unsetIntv() {
    if (intvId >= 0) clearInterval(intvId);
}
endflag = false;
function intvMain() {

    setInfoText();
    // info.innerText = '$1/$2 $3:$4'.format(videoId+1, videos.length, Math.floor((video.duration - video.currentTime) / 60), ('0'+Math.floor((video.duration - video.currentTime)%60)).slice(-2) );

    if (video.currentTime <= transition_time_s*getSpeedMultip()) {
        video.volume = Math.clip(video.currentTime / transition_time_s*getSpeedMultip(), 1, 0) * (getSpeedMultip() == 1?1:0.5);
    }
    else
    if (videoEndTime - video.currentTime <= transition_time_s*getSpeedMultip()+0.1) {
        video.volume = Math.clip((videoEndTime - video.currentTime) / transition_time_s*getSpeedMultip()+0.1, 1, 0) * (getSpeedMultip() == 1 ? 1 : 0.5);

        if (!endflag) {
            // フェードアウトし始めの1回

            // 最後だけフェードアウトしない
            // if (!is_loop.checked && (videoId == videos.length-1 || videos.length==0)) void(0);
            // else black.classList.add('black');

            black.classList.add('black');
            endflag = true;
        }

        if (videoEndTime <= video.currentTime) {
            // フェードアウト終わり

            endflag = false;
            unsetIntv();
            startNext();
        }
    } else {
        // 再生速度が1じゃないときは音量を半分にする
        video.volume = 1 * (getSpeedMultip() == 1 ? 1 : 0.5);
    }
}

videoEndTime = -1;
function startNext() {
    if (!is_loop.checked) {
        // ループじゃなかったら次の曲
        videoId++;
        speedMultip = 0;
    }
    if (videoId >= videos.length) {
        // 最後の動画だったら処理終わり
        videoId = 0;
        inp_file.value = "";
        inp_file.removeAttribute('hidden');
        return;
    }
    setIntv();
    // 次の動画を読み込んで再生
    video.src = window.URL.createObjectURL(videos[videoId]);
    video.play();
    video.playbackRate = getSpeedMultip();
    setTimeout(_ => { videoEndTime = video.duration; black.classList.remove('black'); }, 100);
}

function setInfoText() {
    // 動画の数と秒数の表示
    if (videos.length==0) document.getElementsByTagName('TITLE')[0].innerText = info.innerText = 'No Video';
    else document.getElementsByTagName('TITLE')[0].innerText = info.innerText = '$1/$2 $3:$4'.format(Math.min(videoId + 1, videos.length), videos.length, Math.floor((video.duration - video.currentTime) / 60), ('0' + Math.floor((video.duration - video.currentTime) % 60)).slice(-2));

    // 動画サイズの設定
    overlay.style.width = video.clientWidth + 'px';
    overlay.style.height = (video.clientWidth * 9 / 16) + 'px';
    overlay.style.top = 0 + 'px';
    // overlay.style.top = (video.clientHeight - video.clientWidth * 9 / 16)/2 +'px';
    speedMultText.innerText = (video.paused ? 'll' : 'x' + getSpeedMultip());
    speedMultipWrapper.toggleAttribute('hidden', getSpeedMultip() == 1 && !video.paused);

    // OBS用でクロップの数字を表示
    // crop_info.innerText = "(1080pで全画面想定)\nleft: $1 px , top: $2 px\nright: $3 px , bottom: $4 px".format(0, window.outerHeight - window.innerHeight, window.innerWidth - video.clientWidth, 1080 - (window.outerHeight - window.innerHeight) - video.clientHeight);
    crop_info.innerText = "left: $1 px , top: $2 px\nright: $3 px , bottom: $4 px"
        .format(
            window.screenLeft + (window.outerWidth - window.innerWidth)/2,
            window.screenTop + (window.outerHeight - window.innerHeight) - (window.outerWidth - window.innerWidth) / 2,
            screen.width - (window.screenLeft + video.clientWidth) - (window.outerWidth - window.innerWidth) / 2,
            screen.height - (window.screenTop + video.clientHeight + (window.outerHeight - window.innerHeight)) + (window.outerWidth - window.innerWidth) / 2
        );
    // crop_info.innerText = "left: $1 px , top: $2 px\nwidth: $3 px , height: $4 px".format(0, window.outerHeight - window.innerHeight, video.clientWidth, video.clientHeight);
}
setInfoText();



function checkVersionTags(updatefunc = function(data){}, noupdatefunc = function(data){}) {
    $.ajax({
        url: 'https://api.github.com/repos/dododoshirouto/replayplayer/tags'
    })
    .done(function(d){
        data = d;

        if (data[0].name == version) {
            noupdatefunc(data);
        } else {
            updatefunc(data);
        }
    })
}
checkVersionTags(
    function(data){
        versionInfo.innerHTML = `
        <p>$1</p>
        <a href="https://github.com/dododoshirouto/replayplayer" target="_blank">更新があります。 $2</a>
        `.format(version, data[0].name);
    },
    function(data){
        versionInfo.innerHTML = "<p>$1</p>".format(version);
    }
);