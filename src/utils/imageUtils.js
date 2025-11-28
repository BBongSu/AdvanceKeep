import { MAX_IMAGE_SIZE } from '../constants';

export const validateImageSize = (file) => {
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('이미지 크기는 5MB 이하여야 합니다.');
  }
  return true;
};

export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

