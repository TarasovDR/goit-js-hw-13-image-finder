import ApiService from './apiService';
import imageCardTpl from '../templates/imageCardTpl.hbs';
import debounce from 'lodash.debounce';
import LoadMoreBtn from './components/load-more-btn';

import { alert, error } from '@pnotify/core';
import '@pnotify/core/dist/BrightTheme.css';
import '@pnotify/core/dist/PNotify.css';

const refs = {
  searchInput: document.querySelector('.js-search-input'),
  galleryList: document.querySelector('.js-gallery__list'),
};

const apiService = new ApiService();
const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});

refs.searchInput.addEventListener('input', debounce(onSearch, 500));
loadMoreBtn.refs.button.addEventListener('click', onLoadMore);

function onSearch(e) {
  clearImageList();

  apiService.query = e.target.value;

  if (!apiService.query) {
    loadMoreBtn.hide();
  } else {
    loadMoreBtn.show();
    apiService.resetPage();
    fetchImagesList();
  }
}

const clearImageList = () => {
  refs.galleryList.innerHTML = '';
};

const imageListMarkup = data => {
  const contriesArr = data.length;
  console.log(contriesArr);
  if (contriesArr === 0) {
    loadMoreBtn.hide();
    error({
      type: 'notice',
      text: 'Нет изображений по Вашему запросу',
      delay: 3000,
      sticker: false,
      animateSpeed: 'slow',
    });
  }
  if (contriesArr > 0 && contriesArr === data.length - 1) {
    alert({
      type: 'notice',
      text: 'Это всё, что есть. Будем очень благодарны, если пополните нашу коллекцию изображений!',
      delay: 3000,
      sticker: false,
      animateSpeed: 'slow',
    });
  }

  loadMoreBtn.enable();
  const imageMarkup = imageCardTpl(data);
  render(imageMarkup);
};

const render = hits => {
  refs.galleryList.insertAdjacentHTML('beforeend', hits);
};

function fetchError(error) {
  console.log(error);
}

function onLoadMore() {
  fetchImagesList();

  const totalScrollHeight = refs.galleryList.clientHeight + 80;
  setTimeout(() => {
    window.scrollTo({
      top: totalScrollHeight,
      behavior: 'smooth',
    });
  }, 500);
}

function fetchImagesList() {
  loadMoreBtn.disable();
  apiService.fetchImages().then(imageListMarkup).catch(fetchError);
}
