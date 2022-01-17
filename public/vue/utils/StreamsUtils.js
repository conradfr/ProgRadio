import {
  THUMBNAIL_STREAM_PLACEHOLDER,
  THUMBNAIL_STREAM_PATH,
  THUMBNAIL_PAGE_PATH
} from '../config/config';

const getPictureUrl = (radio) => {
  let img = THUMBNAIL_STREAM_PLACEHOLDER;

  if (radio !== null && radio.img_alt !== null) {
    img = `${THUMBNAIL_PAGE_PATH}${radio.img_alt}.png`;
  } else if (radio !== null && radio.img !== null && radio.img !== '') {
    img = `${THUMBNAIL_STREAM_PATH}${radio.img}`;
  }

  return img;
};

export default {
  getPictureUrl
};
