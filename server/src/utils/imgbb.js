const FormData = require('form-data');

const uploadToImgBB = async (base64Image) => {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('IMGBB_API_KEY is not configured');
  }

  const form = new FormData();
  const payload = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  form.append('image', payload);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: form,
    headers: form.getHeaders(),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Image upload failed');
  }
  return data.data.url;
};

module.exports = { uploadToImgBB };
