import AbstractView from "../AbstractView.js";
import { songs } from "../../data.js";
export default class extends AbstractView{
  constructor(){
    super()
    this.set_title('gallery')
  }

  get_html_path(){
    return "./views/gallery/gallery.html"
  }
  

  async set_page(){
    const carousel = document.querySelector('.carousel');
    const carousel_item = document.querySelector('.carousel-item');

    const stop_btn = document.querySelector('#carousel-stop');
    const next_arrow = document.querySelector('.arrow-next');
    const prev_arrow = document.querySelector('.arrow-prev');

    const current_time_delay = document.querySelector('.current-time-delay');
    let max_time_delay = document.querySelector('.max-time-delay');
    let carousel_slider = document.querySelector('.carousel-slider');
    const carousel_slider_container = document.querySelector('.carousel_slider_container');

    let carouselImageIndex = 0;
    carousel_item.style.backgroundImage = `url(${songs[carouselImageIndex].cover})`;
    let carouselInterval;
    let carouselIntervalTime = 5000;
    let isCarouselRunning = false;

    max_time_delay.textContent = 60;
    current_time_delay.textContent = '05';
    carousel_slider.value = (current_time_delay.textContent / 59) * 100;

    toggleCarousel();
    stop_btn.addEventListener('click', ()=>{
      stop_btn.innerHTML = isCarouselRunning ? 'Play' : 'Pause';
      toggleCarousel();
    });

    const nextCarouselImage = () => {
      if (carouselImageIndex === songs.length - 1) {
        carouselImageIndex = 0;
      }
      else {
        carouselImageIndex++;
      }
      carousel_item.style.backgroundImage = `url(${songs[carouselImageIndex].cover})`;
    };

    const prevCarouselImage = () => {
      if (carouselImageIndex === 0) {
        carouselImageIndex = songs.length - 1;
      }
      else {
        carouselImageIndex--;
      }
      carousel_item.style.backgroundImage = `url(${songs[carouselImageIndex].cover})`;
    };
  

    function toggleCarousel() {
      if (isCarouselRunning) {
        _stopCarousel();
      } else {
        _startCarousel();
      }
      isCarouselRunning = !isCarouselRunning;
    }

    function _startCarousel() {
      carouselInterval = setInterval(() => {
        nextCarouselImage();
      }, carouselIntervalTime);
    }
    function _stopCarousel() {
      clearInterval(carouselInterval);
    }

    function update_current_time_delay() {
      let seekPosition = Math.round(max_time_delay.textContent * (carousel_slider.value / 100));
      if (seekPosition < 10){
        seekPosition = '0' + seekPosition;
      }
      current_time_delay.textContent = seekPosition;
    }

    function set_image_delay() {
      carouselIntervalTime = current_time_delay.textContent * 1000;
      toggleCarousel();
      toggleCarousel();
    }

    carousel.addEventListener('mouseenter', () => {
      stop_btn.classList.add('show');
      next_arrow.classList.add('show');
      prev_arrow.classList.add('show');
      carousel_slider_container.classList.add('show');

    });
    carousel.addEventListener('mouseleave', () => {
      setTimeout(() => {
        stop_btn.classList.remove('show')
        next_arrow.classList.remove('show');
        prev_arrow.classList.remove('show');
        carousel_slider_container.classList.remove('show');
        }, 500);
    });

    carousel_slider.addEventListener("mouseup" , set_image_delay);
    carousel_slider.addEventListener('input', update_current_time_delay);
    next_arrow.addEventListener('click', nextCarouselImage);
    prev_arrow.addEventListener('click', prevCarouselImage);
  }
}