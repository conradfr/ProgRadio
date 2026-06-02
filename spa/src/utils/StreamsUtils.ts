import typeUtils from '@/utils/typeUtils';

import {
  THUMBNAIL_STREAM_PLACEHOLDER,
  THUMBNAIL_STREAM_PATH,
  THUMBNAIL_PAGE_PATH
} from '@/config/config';

import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/stream';

const getPictureUrl = (stream: Stream, radio: Radio|null = null): string|null => {
  // @ts-expect-error defined on global scope
  // eslint-disable-next-line no-undef
  let img = `${cdnBaseUrl}${THUMBNAIL_STREAM_PLACEHOLDER}`;

  if (!stream) {
    return img;
  }

  // this is the newest behavior from the API
  // todo migrate the Symfony side
  if (stream && stream.img && stream.img.startsWith('http')) {
    return stream.img;
  }

  if (radio && typeUtils.isRadio(radio)) {
    const logoFilename = stream.has_logo === true && stream.radio_stream_code_name
      ? stream.radio_stream_code_name : radio.code_name;

    // @ts-expect-error defined on global scope
    // eslint-disable-next-line no-undef
    img = `${cdnBaseUrl}${THUMBNAIL_PAGE_PATH}${logoFilename}.png`;
  } else if (stream.img_alt && stream.img_alt) {
    // @ts-expect-error defined on global scope
    // eslint-disable-next-line no-undef
    img = `${cdnBaseUrl}${THUMBNAIL_PAGE_PATH}${stream.img_alt}.png`;
  } else if (stream['radio_code_name']) {
    // @ts-expect-error defined on global scope
    // eslint-disable-next-line no-undef
    img = `${cdnBaseUrl}${THUMBNAIL_PAGE_PATH}${stream.radio_code_name}.png`;
    // this is the old behavior, kept for now
  }  else if (stream && stream.img && stream.img !== '') {
    // @ts-expect-error defined on global scope
    // eslint-disable-next-line no-undef
    img = `${cdnBaseUrl}${THUMBNAIL_STREAM_PATH}${stream.img}`;
  }

  return img;
};

export default {
  getPictureUrl
};
