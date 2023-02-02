import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { Swiper, swiperInit } from './slider';

const refs = {
  searchImgForm: document.querySelector('#search-form'),
  galleryList: document.querySelector('.gallery'),
  swiperPagination: document.querySelector('.swiper-pagination'),
};

const answer = {
  answer: document.querySelector('.answer'),
  searhName: document.querySelector('.search_name span'),
  totalHits: document.querySelector('.total_hits span'),
  actualHits: document.querySelector('.actual_hits span'),
  loadHits: document.querySelector('.load_hits span'),
  totalPages: document.querySelector('.total_pages span'),
  loadPages: document.querySelector('.load_pages span'),
};

{
  /* <div class="answer">
  <p class="search_name">Шукали : <span></span></p>
  <p class="total_hits">Знайдено : <span></span></p>
  <p class="actual_hits">Доступно : <span></span></p>
  <p class="load_hits">Завантажено : <span></span></p>
  <p class="total_pages">Сторінок : <span></span></p>
  <p class="load_pages">Завантажено : <span></span></p>
</div> */
}

const searhParams = {
  searchString: '',
  pageNumber: 1,
  numPerSearch: 40,
  endSearh: false,
  totalPageHits: 1,
};

let swiper = new Swiper('.mySwiper', swiperInit);

const lighBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  doubleTapZoom: 1,
});

//== function
async function getImg(url, timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await axios.get(url, {
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

const makeGalleryItem = request => {
  const {
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
  } = request;
  return `
<a href=${largeImageURL} class="gallery__link gallery__item swiper-slide">
 <img src="${webformatURL}" alt="${tags}" width="400" height="300" loading="lazy" class="gallery__image" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</a>
`;
};

function makeGallery(className, hits) {
  const gallery = document.querySelector(className);
  const list = hits.map(makeGalleryItem).join('');
  gallery.insertAdjacentHTML('beforeend', list);
}

function makeURL(makeURLParams) {
  const { searchString, pageNumber, numPerSearch } = makeURLParams;
  const params = new URLSearchParams({
    key: '32938330-25a7d9530d370aeaa9b179f57',
    q: searchString,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: pageNumber,
    per_page: numPerSearch,
  });

  return `https://pixabay.com/api/?${params}`;
}

async function makeImg(makeImgParams) {
  const { pageNumber, numPerSearch, totalPageHits, searchString } =
    makeImgParams;
  const URL = makeURL(makeImgParams);
  const rowsCount = swiper.params.grid.rows;
  const collumnCount = swiper.params.slidesPerView;

  if (pageNumber > totalPageHits) {
    Notify.info(`дійшли до кінця`);
    return;
  }

  try {
    const imagesData = await getImg(URL, 2500);
    const { total, totalHits, hits } = imagesData.data;

    if (!totalHits) {
      throw new Error('Нічого не знайшлось');
    }

    if (pageNumber < 2) {
      const actualTotalHits =
        total >= totalHits + (totalHits % numPerSearch)
          ? totalHits + (totalHits % numPerSearch)
          : total;
      Notify.info(`Знайшли ${total} картинок. Доступно ${actualTotalHits} `);
      makeImgParams.totalPageHits = Math.ceil(totalHits / numPerSearch);
      answer.answer.classList.remove('hide');
      answer.searhName.textContent = searchString;
      answer.totalHits.textContent = total;
      answer.actualHits.textContent = actualTotalHits;
      answer.totalPages.textContent = makeImgParams.totalPageHits;
    }
    answer.loadPages.textContent = makeImgParams.pageNumber;

    makeImgParams.pageNumber += 1;

    makeGallery('.gallery', hits);

    if (totalHits > rowsCount * collumnCount) {
      refs.swiperPagination.classList.remove('swiper-bullet-hidden');
    }

    swiper.update();
    // if (pageNumber > 1) swiper.slideNext(1000);
    lighBox.refresh();
    answer.loadHits.textContent = lighBox.elements.length;
    //
  } catch (error) {
    const msg = error.name === 'CanceledError' ? 'Get timeout' : error;
    Notify.failure(`Oops ${msg}`);
  }
}

refs.searchImgForm.addEventListener('submit', evt => {
  evt.preventDefault();

  refs.galleryList.innerHTML = '';
  swiper.update();
  lighBox.refresh();
  searhParams.searchString = '';
  searhParams.pageNumber = 1;
  searhParams.endSearh = false;
  refs.swiperPagination.classList.add('swiper-bullet-hidden');
  answer.answer.classList.add('hide');

  const searchImgName = evt.target.searchQuery.value.trim();
  evt.currentTarget.reset();
  if (!searchImgName) {
    Notify.failure(`❌ Нема чого шукати`);
    return;
  }

  searhParams.searchString = searchImgName;

  makeImg(searhParams);
});

swiper.on('activeIndexChange', () => {
  // console.log(e);
  const { activeIndex } = swiper;
  const collumnCount = swiper.params.slidesPerView;
  const rowsCount = swiper.params.grid.rows;
  const slideCount = document.querySelectorAll('.swiper-slide').length;
  const totalRows = Math.ceil(slideCount / collumnCount);
  const endPosition = activeIndex + rowsCount;

  if (totalRows - endPosition <= 1) {
    //console.log('object :>> грузи');
    makeImg(searhParams);
  }
});
