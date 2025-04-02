import typeUtils from '@/utils/typeUtils';

import {
  THUMBNAIL_STREAM_PLACEHOLDER,
  THUMBNAIL_STREAM_PATH,
  THUMBNAIL_PAGE_PATH
} from '@/config/config';

import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/stream';

const getPictureUrl = (radio: Radio|Stream|null, radioStreamCodeName: string|null = null) => {
  // @ts-expect-error defined on global scope
  // eslint-disable-next-line no-undef
  let img = `${cdnBaseUrl}${THUMBNAIL_STREAM_PLACEHOLDER}`;

  if (radio !== null && typeUtils.isRadio(radio)) {
    const logoFilename = radioStreamCodeName && radio.streams[radioStreamCodeName]
      && radio.streams[radioStreamCodeName].has_logo === true
      ? radioStreamCodeName : radio.code_name;

    // @ts-expect-error defined on global scope
    // eslint-disable-next-line no-undef
    img = `${cdnBaseUrl}${THUMBNAIL_PAGE_PATH}${logoFilename}.png`;
  } else if (radio !== null && radio.img_alt !== null) {
    // @ts-expect-error defined on global scope
    // eslint-disable-next-line no-undef
    img = `${cdnBaseUrl}${THUMBNAIL_PAGE_PATH}${radio.img_alt}.png`;
  } else if (radio !== null && radio.img !== null && radio.img !== '') {
    // @ts-expect-error defined on global scope
    // eslint-disable-next-line no-undef
    img = `${cdnBaseUrl}${THUMBNAIL_STREAM_PATH}${radio.img}`;
  }

  return img;
};

export default {
  getPictureUrl
};
