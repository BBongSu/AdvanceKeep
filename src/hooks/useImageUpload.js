import { useState } from 'react';
import Swal from 'sweetalert2';
import { validateImageSize, convertImageToBase64 } from '../utils/imageUtils';

export const useImageUpload = (initialImages = []) => {
  // 기본 이미지가 문자열이면 배열로 감싸서 관리
  const [selectedImages, setSelectedImages] = useState(
    Array.isArray(initialImages) ? initialImages : initialImages ? [initialImages] : []
  );
  const [uploading, setUploading] = useState(false);

  /**
   * 여러 장 업로드 처리 (파일 배열을 순회)
   */
  const handleImageSelect = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const nextImages = [...selectedImages];

      for (const file of files) {
        validateImageSize(file);
        const base64 = await convertImageToBase64(file);
        nextImages.push(base64);
      }

      setSelectedImages(nextImages);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: '이미지 업로드 실패',
        text: error.message,
        confirmButtonColor: '#667eea',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setSelectedImages([]);
  };

  return {
    selectedImages,
    uploading,
    handleImageSelect,
    removeImage,
    clearImages,
  };
};
