import { useState } from 'react';
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
      alert(error.message);
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

