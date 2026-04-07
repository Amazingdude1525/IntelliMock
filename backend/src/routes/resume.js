import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

export const resumeRouter = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/resume/upload — Upload PDF, extract text, return URL + preview
resumeRouter.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'intellimock' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Extract text from PDF
    let textPreview = '';
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(req.file.buffer);
      textPreview = pdfData.text.slice(0, 2000);
    } catch (pdfError) {
      console.error('PDF text extraction error:', pdfError);
      textPreview = 'Unable to extract text from PDF';
    }

    res.json({
      url: uploadResult.secure_url,
      text_preview: textPreview,
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});
