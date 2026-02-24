# trailblazeauto

trailblazeauto is a secure digital media storage application that allows users to upload, manage, and stream their video collection.

## 🏗️ Architecture

```
┌─────────────────┐    ┌───────────────────┐    ┌─────────────────┐
│  React Frontend │◄──►│   Django Backend  │◄──►│     SQLite DB   │
│    (Port 5173)  │    │    (Port 8000)    │    │   (File Based)  │
└─────────────────┘    └───────────────────┘    └─────────────────┘
```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos/` | Get all videos |
| POST | `/api/videos/` | Upload a new video |
| GET | `/api/videos/{id}/` | Get video details |
| DELETE | `/api/videos/{id}/` | Delete a video |

## 🛠️ Tech Stack

### Backend
- **Django** - High-level Python web framework
- **Django REST Framework** - Toolkit for building Web APIs
- **SQLite** - Database
- **Python 3.x** - Runtime

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **React Icons** - Iconography
- **Node.js** - Runtime

### Infrastructure
- **Docker & Docker Compose** - Containerization

## 🗄️ Database Schema

### Video
- `id` (Primary Key)
- `title` (CharField)
- `description` (TextField)
- `file` (FileField) - Path to video file
- `uploaded_at` (DateTimeField) - Auto-added timestamp

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)
- Node.js (for running local tests)

### 1. Clone and Start
```bash
# Clone the repository
git clone https://github.com/quietlune/trailblazeauto.git
cd trailblazeauto

# Start all services
docker-compose up -d --build
```

### 2. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

## 📊 Testing

We use **Playwright** for End-to-End (E2E) and backend API testing.

### Running Tests

1. **Install Dependencies** (Root directory):
   ```bash
   npm install
   ```

2. **Run All Tests**:
   ```bash
   npx playwright test
   ```

3. **Run Specific Tests**:
   ```bash
   # Run only UI tests
   npx playwright test tests/public/

   # Run only Backend API tests
   npx playwright test tests/private/
   ```

### Test Coverage
- **Backend API**: Full CRUD operations for videos.
- **Frontend UI**: 
  - Home Page (Hero section, Navigation)
  - Upload Page (UI elements, Full upload flow)
  - Library Page (Video listing, Delete flow with confirmation)
  - Video Player and Download functionality

## 🔒 Private Configuration

For private environments or specific test configurations that require different settings, use the private compose file:

```bash
docker-compose -f docker-compose.private.yml up
```

