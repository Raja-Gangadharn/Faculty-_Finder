# Faculty Job Portal

A full-stack web application for faculty job postings and applications.

## Project Structure

- `myjobs_frontend/` - React.js frontend application
- `myjobs_backend/` - Django REST Framework backend API

## Prerequisites

- Node.js (v16 or later) for frontend
- Python (3.8 or later) for backend
- MySQL (or compatible database)
- npm or yarn package manager

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd myjobs_backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and other settings as needed

5. Run database migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser (admin):
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```
   The backend will be available at `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd myjobs_frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the API endpoint if needed

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```
   The frontend will be available at `http://localhost:3000`

## Environment Variables

### Backend (myjobs_backend/.env.example)
```
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=jobportal_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=3306
```

### Frontend (myjobs_frontend/.env.example)
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_DEBUG=True
```

## API Documentation

Once the backend is running, you can access:
- API Root: `http://localhost:8000/api/`
- Admin Interface: `http://localhost:8000/admin/`
- API Documentation (if configured): `http://localhost:8000/docs/`

## Deployment

For production deployment, make sure to:
1. Set `DEBUG=False` in your environment variables
2. Configure a production database (PostgreSQL recommended)
3. Set up proper CORS allowed origins
4. Use a production-grade web server (Gunicorn, uWSGI, etc.)
5. Set up a proper web server (Nginx, Apache) to serve static files

## License

This project is licensed under the MIT License - see the LICENSE file for details.
