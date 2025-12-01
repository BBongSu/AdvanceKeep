import { useState } from 'react';
import Swal from 'sweetalert2';
import { validateImageSize, convertImageToBase64 } from '../utils/imageUtils';

export const useImageUpload = (initialImage = null) => {
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = async (file) => {
    if (!file) return;

    try {
      validateImageSize(file);
      setUploading(true);
      const base64 = await convertImageToBase64(file);
      setSelectedImage(base64);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: '이미지 업로드 실패',
        text: error.message,
        confirmButtonColor: '#667eea'
      });
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  return {
    selectedImage,
    uploading,
    handleImageSelect,
    clearImage,
  };
};

