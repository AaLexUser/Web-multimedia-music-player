import AbstractView from "../AbstractView.js";
import { songs } from "../../data.js";
export default class extends AbstractView{
  constructor(){
    super()
    this.set_title("Player")
  }
  get_html_path(){
    return "./views/player/player.html";
  }
  async set_page(){
    let now_playing = document.querySelector(".now-playing");
    let track_art = document.querySelector(".track-art");
    let track_name = document.querySelector(".track-name");
    let track_artist = document.querySelector(".track-artist");

    let playpause_btn = document.querySelector(".playpause-track");
    let next_btn = document.querySelector(".next-track");
    let prev_btn = document.querySelector(".prev-track");

    let seek_slider = document.querySelector(".seek_slider");
    let curr_time = document.querySelector(".current-time");
    let total_duration = document.querySelector(".total-duration");
    let wave = document.querySelector(".wave");
    let curr_track = document.querySelector("#current-track");

    let track_index = 0;
    let isPlaying = false;
    let updateTimer;

    let num = 7
    let analyser;
    let array = new Uint8Array(num*2);
    let smoothedArray = new Uint8Array(num * 2);
    let strokes = document.getElementsByClassName("stroke")

    let Color1;
    let Color2;

    loadTrack(track_index);

    function loadTrack(track_index) {
      clearInterval(updateTimer);
      reset();
      curr_track = new Audio();
      curr_track.src = songs[track_index].path;
      curr_track.preload = 'auto'
      curr_track.load();
      console.log(songs[track_index].cover);
      let coverImage = new Image();
      coverImage.src = songs[track_index].cover;
      coverImage.onload = function() {
        track_art.style.backgroundImage = `url(${songs[track_index].cover})`;
      }
      track_name.textContent = songs[track_index].name;
      track_artist.textContent = songs[track_index].artist;
      now_playing.textContent = `PLAYING ${track_index + 1} OF ${songs.length}`;
      curr_track.addEventListener("loadedmetadata", function() {
        curr_track.addEventListener("ended", nextTrack);
        updateTimer = setInterval(seekUpdate, 100);
        seek_slider.addEventListener("mousedown", function() {
          clearInterval(updateTimer);
        });
        seek_slider.addEventListener("mouseup", function() {
          seekTo();
          updateTimer = setInterval(seekUpdate, 100);
        });
        seek_slider.addEventListener("input", updateCurrentTime);
      });
      random_bg_color()
    }

    function random_bg_color() {
      let hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a','b', 'c', 'd', 'e'];
      let a;

      function populate(a) {
        for (let i = 0; i < 6; i++) {
          let x = Math.round(Math.random() * 14);
          let y = hex[x];
          a += y;
        }
        return a;
      }
      Color1 = populate('#');
      Color2 = populate('#');
      let angle = "to right"
      let gradient = "linear-gradient(" + angle + ", " + Color1 + ", " + Color2 + ")";
      document.body.style.background = gradient;
    }

    function reset() {
      curr_time.textContent = "00:00";
      total_duration.textContent = "00:00";
      seek_slider.value = 0;
    }

    function playpauseTrack() {
      isPlaying ? pauseTrack() : playTrack();
    }

    function playTrack() {
      curr_track.play();
      isPlaying = true;
      track_art.classList.add("rotate-animation");
      wave.classList.add('loader');
      playpause_btn.firstElementChild.classList.add("paused");
      draw()
    }
    function pauseTrack() {
      curr_track.pause();
      isPlaying = false;
      track_art.classList.remove("rotate-animation");
      wave.classList.remove('loader');
      playpause_btn.firstElementChild.classList.remove("paused");
    }

    function nextTrack() {
      pauseTrack()
      if (track_index < songs.length - 1)
        track_index += 1;
      else track_index = 0;
      loadTrack(track_index);
      playTrack();
    }

    function prevTrack() {
      pauseTrack()
      if (track_index > 0)
        track_index -= 1;
      else track_index = songs.length;
      loadTrack(track_index);
      playTrack();
    }

    function seekTo() {
      let seekto = curr_track.duration * (seek_slider.value / 100);
      curr_track.currentTime = seekto;
      seekUpdate();
    }

    function seekUpdate(){
      let seekPosition = 0;
      if (!isNaN(curr_track.duration)) {
        seekPosition = curr_track.currentTime * (100 / curr_track.duration);
        seek_slider.value = seekPosition;
        let currentMinutes = Math.floor(curr_track.currentTime / 60);
        let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
        let durationMinutes = Math.floor(curr_track.duration / 60);
        let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);
        if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
        if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
        if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
        if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }
        curr_time.textContent = currentMinutes + ":" + currentSeconds;
        total_duration.textContent = durationMinutes + ":" + durationSeconds;
      }
    }

    function draw(){
      let width = 10;
      for(var i = 0; i < strokes.length; i++){
        strokes[i].style.minWidth = width+'px';
        // Calculate the gradient position (0 to 1) for the current stroke
        let gradientPosition = i / (strokes.length - 1);

        // Create a gradient for the current stroke's background
        let gradient = `linear-gradient(${Color1}, ${Color2})`;
        strokes[i].style.backgroundImage = gradient;
        strokes[i].style.backgroundPositionX = `${gradientPosition * 100}%`;
      }
      let audioContext = new AudioContext();
      var source = audioContext.createMediaElementSource(curr_track);
      analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      loop();
    }

    function loop() {
      window.requestAnimationFrame(loop);
      const minHeight = 1;
      const maxHeight = 100;
      analyser.getByteFrequencyData(array);
      applyEMA(array, smoothedArray, 0.3);
      let maxFrequency = Math.max(...smoothedArray);
      for(var i = 0 ; i < num ; i++){
        let normalizedHeight = smoothedArray[i + num] / maxFrequency;
        let height = minHeight + (maxHeight - minHeight) * (normalizedHeight**5);
        strokes[i].style.height = height + "px";
        strokes[i].style.opacity = 0.008 * smoothedArray[i + num];
      }
    }

    function applyEMA(dataArray, smoothedArray, alpha) {
      for (let i = 0; i < dataArray.length; i++) {
        smoothedArray[i] = alpha * dataArray[i] + (1 - alpha) * smoothedArray[i];
      }
    }

    function updateCurrentTime() {
      let seekPosition = curr_track.duration * (seek_slider.value / 100);
      let currentMinutes = Math.floor(seekPosition / 60);
      let currentSeconds = Math.floor(seekPosition - currentMinutes * 60);

      if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
      if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }

      curr_time.textContent = currentMinutes + ":" + currentSeconds;
    }

    // Add event listeners
    playpause_btn.addEventListener("click", playpauseTrack);
    next_btn.addEventListener("click", nextTrack);
    prev_btn.addEventListener("click", prevTrack);
    
  }
}