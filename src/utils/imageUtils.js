import { MAX_IMAGE_SIZE } from '../constants';

export const validateImageSize = (file) => {
  if (file.size > MAX_IMAGE_SIZE) {
    // 이제 5MB 넘어도 압축하면 되므로 경고만 하거나 통과시킬 수도 있지만,
    // 브라우저 메모리 부하 방지를 위해 입력 단계 제한은 유지하되 메시지 수정
    throw new Error('원본 이미지는 5MB를 초과할 수 없습니다.');
  }
  return true;
};

export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    // 1. 파일을 읽어서 이미지 객체 생성
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 2. 캔버스를 사용해 리사이징 및 압축
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024; // 최대 너비 대폭 축소 (기존 5MB -> 약 50~100KB 수준 목표)
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        // 비율 유지하며 리사이징
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 3. JPEG 포맷으로 압축 (품질 0.7)
        // PNG는 투명도를 지원하지만 용량이 큼. 사진 최적화에는 JPEG가 유리.
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
