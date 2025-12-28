/**
 * Upload image file to local server
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL path to the uploaded image (e.g., '/uploads/123456.jpg')
 */
export async function uploadImageToLocal(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.path; // Returns '/uploads/filename.jpg'
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
