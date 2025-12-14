<img width="1920" height="1080" alt="Screenshot 2025-12-14 173531" src="https://github.com/user-attachments/assets/b4cfa8cb-ffab-4639-a073-225f7b6e8f48" />
<img width="1883" height="911" alt="Screenshot 2025-12-14 173552" src="https://github.com/user-attachments/assets/7b770987-d34e-490a-8349-95e0ae8cd15c" />
<img width="1840" height="901" alt="Screenshot 2025-12-14 173604" src="https://github.com/user-attachments/assets/5709205d-e4cb-416c-90c6-7387fbd3987a" />
<img width="1323" height="970" alt="Screenshot 2025-12-14 173618" src="https://github.com/user-attachments/assets/bf157ddf-6d6c-4ce7-990c-cc486f3b6c09" />
<img width="949" height="864" alt="Screenshot 2025-12-14 173628" src="https://github.com/user-attachments/assets/e1c55a43-d971-4a18-b429-1f6690e1252e" />
🍬 Mithai Junction – Sweet Shop Management System

Mithai Junction is a simple full-stack web application built to manage a sweet shop’s inventory and purchase process.
This project was created as part of the Incubyte TDD Kata assessment.

The main focus of this project is clean backend logic, test-driven development, and basic frontend integration.

📌 What this project does

Shows a list of available sweets

Displays price and available quantity

Allows users to purchase sweets

Automatically handles out-of-stock cases

Allows admin users to manage sweets

✨ Features
User

Register and login using JWT authentication

View all available sweets

Purchase sweets

Cannot purchase when stock is zero

Admin

Add new sweets

Update sweet details

Delete sweets

Restock sweets

🛠 Technologies Used
Backend

Python

FastAPI

SQLite

SQLAlchemy

JWT Authentication

Pytest

Frontend

React

Fetch API

Simple UI components

📁 Project Structure
SweetShop-Project/
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   ├── schemas.py
│   ├── test_api.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── SweetList.js
    │   ├── LoginRegister.js
    │   └── AdminPanel.js
    └── package.json

🚀 How to run the project
Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


Backend runs at:

http://127.0.0.1:8000


API Docs:

http://127.0.0.1:8000/docs

Frontend
cd frontend
npm install
npm start


Frontend runs at:

http://localhost:3000

📡 API Overview

POST /auth/register – Register user

POST /auth/login – Login user

GET /sweets – Get all sweets

POST /purchase/{name} – Purchase sweet

Admin-only endpoints for add, update, delete, and restock

✅ Testing

Backend functionality is tested using pytest.

cd backend
pytest


Tests cover:

Authentication

Purchase flow

Admin permissions

Edge cases (out of stock, unauthorized access)

🤖 AI Usage

AI tools were used only as a helper, mainly for:

Writing boilerplate code

Speeding up test case creation

Debugging small issues

All logic and final implementation were understood and written manually.

🧠 Development Approach

Followed Test-Driven Development (TDD)

Wrote tests first, then implemented logic

Verified backend APIs using Swagger

Connected frontend with real backend APIs

🚀 Future Improvements

Order history

Better UI design

Payment integration

Product images
