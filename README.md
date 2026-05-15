# Student Housing Platform

A full-stack web application developped by Lebanese university students to find housing near campuses such as Lebanese University, AUB, LAU, and other Beirut-area universities.

The platform allows students to browse approved listings, view listing details, save favorites, and contact landlords through WhatsApp. Admins can review listings, approve or reject them, remove inappropriate listings, and manage user accounts.

## Team Members

- Theresa Al Achkar
- Celine Al Dassouki
- Pamela Kneyzeh
- Agnes Rahal

## Course

Lebanese University  
I3330, Project Management  
Academic Year: 2025 - 2026

## Tech Stack

### Frontend
- React
- Vite
- React Router
- CSS Modules
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy

### Database
- SQLite

### Project Management
- Jira
- GitHub
- Planning Poker

---

## Main Features

- Student login and browsing
- View housing listing details
- Search and filter listings
- Save favorite listings
- Contact landlord through WhatsApp
- Admin dashboard
- Approve listings
- Reject listings with reason
- Remove listings with reason
- Manage users
- Deactivate/reactivate accounts

---

## How to Run

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload
```
Backend URL: http://127.0.0.1:8000
API Docs: http://127.0.0.1:8000/docs

---

### Frontend
Open another terminal:
```bash
npm install
npm run dev
```
Frontend URL: http://localhost:5173

---

## Test Accounts
Admin: admin@lu.edu
Student: student@lu.edu
Landlord: landlord@lu.edu

---

## Database
The project uses SQLite.
The database file is created inside:
backend/student_housing.db

---

## Main tables:
users
listings

---

## GitHub Workflow
main branch is the final stable branch.
Each team member works on her own branch.
Members push their changes to their own branch.
Pull requests are used to merge work into main.
Commits should be clear and professional.