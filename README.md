# Comments App

**Project Description:** This project is a Comments App that allows users to post comments, reply to other comments, and attach files or images. It supports hierarchical comment threads and includes a lightweight captcha verification to prevent spam.

**Features:**
- Add, view, and reply to comments.
- Upload images (JPG, PNG, GIF) and text files.
- Preview images before uploading.
- Nested/hierarchical comments with the ability to expand/collapse discussion threads.
- Load more replies dynamically.
- Sort comments by username, email, or date.
- CAPTCHA validation to prevent spam.
- Download attached files.
- Responsive and user-friendly UI.

**Technology Stack:**
- Frontend: Angular (Standalone components, Reactive Forms)
- Backend: ASP.NET Core (Web API)
- Database: SQL Server / SQLite
- File storage: Local `wwwroot/uploads` folder
- Security: Sanitization of user input, safe URLs

**How to run the project:**
- Clone the repository.
- Run the project using docker-compose up.
- Configuration:
   The project already includes a default encryption key for DNTCaptcha in appsettings.json for development purposes, so no additional configuration is required.
