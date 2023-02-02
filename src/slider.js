import Swiper, { Pagination, Mousewheel, Keyboard } from 'swiper';
import Grid from './grid';
// import 'swiper/swiper.scss';
//import 'swiper/modules/navigation/navigation.min.css';
//import 'swiper/modules/pagination/pagination.min.css';
//import 'swiper/modules/grid/grid.min.css';

const swiperInit = {
  modules: [Pagination, Mousewheel, Keyboard, Grid],
  setWrapperSize: false,
  direction: 'vertical',
  spaceBetween: 20,
  mousewheel: {
    //invert: true,
    thresholdDelta: 100,
    thresholdTime: 100,
  },
  keyboard: {
    enabled: true,
    onlyInViewport: true,
  },
  slidesPerView: 3,
  slidesPerGroup: 2,
  grid: {
    rows: 3,
  },
  breakpoints: {
    1200: {
      slidesPerView: 4,
      slidesPerGroup: 3,
      grid: {
        rows: 4,
      },
    },

    1600: {
      slidesPerView: 5,
      slidesPerGroup: 4,
      grid: {
        rows: 5,
      },
    },
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    enabled: true,
  },
  // init: false,
  //watchOverflow: true,
};

export { Swiper, swiperInit };
