# Pastor Paul Rika Birthday Celebration & Tribute Hub

A React + Vite celebration website for Pastor Paul Rika's birthday, featuring tribute uploads, flyer previews, and a personalized birthday card generator.

## Run locally

Prerequisites: Node.js

1. Install dependencies
   `npm install`
2. Start the app
   `npm run dev`
3. Open the local app in your browser

## Project highlights

- Birthday flyer/gallery showcase
- Personalized tribute card generator
- Tribute upload and wall sections
- Responsive event-style UI

## Notes

The app uses Vite for the frontend and a small Express server for local serving support.

Video tributes are uploaded by the Express API to Cloudinary. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the server environment (or local `.env` file) before accepting video uploads. Keep the API secret private. Uploads are stored in the `ppr-tributes` folder; deleting an admin-removed tribute also deletes its Cloudinary video.
