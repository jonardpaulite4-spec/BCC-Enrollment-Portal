# BCC-EP — Vercel Deployment

This version is prepared for Vercel hosting. The web UI and Express API are served from the same Vercel domain, so the browser uses `/api` instead of `localhost:4000`.

## Important
Vercel hosts the application/API, but it does not make your local XAMPP/phpMyAdmin MySQL database public. Use a managed/cloud MySQL-compatible database and put its connection values into Vercel Environment Variables.

The student document/photo feature in this project stores compressed image data inside the student's JSON document data, so it does not depend on a local `uploads/` directory. For a larger production system, object storage is recommended.

## Deploy

1. Create a GitHub repository and upload the contents of this `BCC-EP` folder.
2. In Vercel, choose **Add New → Project** and import the GitHub repository.
3. Set the project Root Directory to the folder containing `server.js` if the repository contains other folders.
4. Vercel should detect the Node/Express application. The included `vercel.json` explicitly routes all requests to `server.js`.
5. Add the environment variables from `.env.vercel.example` in Vercel Project Settings → Environment Variables.
6. Import `schema.sql` into the managed MySQL database before testing the portal.
7. Deploy.
8. Open `https://YOUR-PROJECT.vercel.app/api/health`. It should return `{"ok":true}`.
9. Open the main Vercel URL and test Student, Instructor, Registrar, and Admin login/portal functions.

## Local development

`npm install`
`npm start`

Local API: `http://localhost:4000/api/health`

## Database

The production database must be reachable from Vercel. Do not use `DB_HOST=localhost` in Vercel; that would refer to the deployment environment, not your PC.

## Security

Do not commit `.env`, database passwords, JWT secrets, or other credentials. Put production secrets in Vercel Environment Variables.
