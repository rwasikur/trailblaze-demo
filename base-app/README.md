# Trailblaze Auto

A premium automotive Catalogue management platform that bridges the gap between elite dealerships and car enthusiasts. Featuring an image-led car catalog and a robust administrative suite for fleet expansion and status management.

## 🏗️ Architecture
```
┌─────────────────┐    ┌───────────────────┐    ┌─────────────────┐
│ React Frontend  │◄──►│  Node.js Backend  │◄──►│  PostgreSQL DB  │
│  (Port 5173)    │    │   (Port 3000)     │    │   (Port 5432)   │
└─────────────────┘    └───────────────────┘    └─────────────────┘
```

## 📋 API Endpoints

### Public Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/cars` | List currently available car Catalogue. |
| `GET` | `/api/cars/:id` | Retrieve detailed specifications for a specific car. |

### Administrative Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Authenticate administrator and receive JWT token. |
| `POST` | `/api/admin/signup` | Register a new administrator account. |
| `GET` | `/api/admin/profile` | Retrieve the logged-in administrator's profile. |
| `PUT` | `/api/admin/profile` | Update administrator account details and password. |
| `POST` | `/api/admin/profile/upload` | Upload and set a custom profile avatar. |
| `GET` | `/api/cars/admin/all` | List all vehicles in fleet with full metadata (Admin only). |
| `POST` | `/api/cars` | Register a new vehicle to the dealership (Admin only). |
| `PUT` | `/api/cars/:id` | Modify an existing vehicle's attributes (Admin only). |
| `PUT` | `/api/cars/:id/status` | Update vehicle availability (Available/Booked) (Admin only). |
| `POST` | `/api/cars/upload` | Upload primary vehicle image (Admin only). |
| `POST` | `/api/cars/upload-multiple` | Upload secondary images (Admin only). |

## 🛠️ Tech Stack

### Backend
*   **Runtime**: Node.js 18+
*   **Framework**: Express 5.2.1
*   **ORM**: Sequelize 6.35.2
*   **Database**: PostgreSQL 15
*   **Authentication**: JSON Web Token (jsonwebtoken 9.0.3)
*   **Password Security**: Bcrypt 6.0.0

### Frontend
*   **Build Tool**: Vite 4.4.5
*   **Framework**: React 19.0.0
*   **Routing**: React Router 7.13.1
*   **Styling**: Vanilla CSS (Premium Custom Styles)
*   **Animations**: Framer Motion 12.38.0
*   **Component Libraries**: Lucide React, React Icons

### Infrastructure
*   **Containerization**: Docker & Docker Compose
*   **Gateway**: Nginx (Unified access on Port 80)
*   **Process Management**: PM2 (optional) / Docker Engine

## 🗄️ Database Schema

### Table: `Admin` (managed via Sequelize)
| Column | Type | Description |
| :--- | :--- | :--- |
| `_id` | UUID | Primary Key (Auto-generated) |
| `full_name` | String | Full name of the administrator |
| `email` | String | Unique email address for login |
| `password` | String | BCrypt hashed password |
| `role` | String | Support for multi-role management (default: `admin`) |
| `phone` | String | Contact phone number |
| `bio` | Text | Short professional biography |
| `avatar_url` | Text | Profile image reference |

### Table: `Car` (managed via Sequelize)
| Column | Type | Description |
| :--- | :--- | :--- |
| `_id` | UUID | Primary Key (Auto-generated) |
| `name` | String | Model name (e.g., "Model S Plaid") |
| `brand` | String | Manufacturer (e.g., "Tesla") |
| `model_year` | Integer | Manufacturing year |
| `transmission` | String | Shift type (Automatic/Manual) |
| `fuel_type` | String | Energy source (Electric/Petrol/etc.) |
| `seating_capacity` | Integer | Number of seats |
| `price` | Integer | Daily rental/listing price |
| `availability_status`| String | Current fleet status (Available/Unavailable) |
| `condition` | Enum | Vehicle state (New/Used) |
| `number_of_owners` | Integer | Count of previous owners (for Used vehicles) |
| `registration_city` | String | City of vehicle registration |
| `insurance_validity`| String | Expiration date of current insurance |
| `mileage` | String | Fuel efficiency (e.g., "18.5 kmpl") |
| `total_distance_covered` | String | Total distance traveled (for Used vehicles) |
| `range` | String | Operational range per charge/tank |
| `body_type` | String | Body architecture (SUV/Sedan/Hatchback) |
| `exterior_color` | String | Outer paint color |
| `interior_color` | String | Cabin upholstery color |
| `description` | Text | Detailed vehicle pitch and features |
| `image_url` | String | Primary high-resolution vehicle image |
| `secondary_images` | Array | List of gallery image URLs |
| `past_owners` | JSONB | History of previous sales and ownership |
| `seller_name` | String | Registered dealership/seller entity |
| `seller_email` | String | Contact email for the seller |

## 🚀 Quick Start

### Prerequisites
*   Docker & Docker Compose
*   Node.js 18+ (for local development)

### 1. Clone and Initialize
```bash
git clone <repository-url>
cd trailblaze-auto/base-app
```

### 2. Launch Environment
```bash
# Start the entire stack in detached mode
docker-compose up -d --build
```

### 3. Access the Platform
*   **Gateway (Port 80)**: [http://localhost](http://localhost)
*   **Admin Dashboard**: [http://localhost/admin](http://localhost/admin)
*   **API Health**: [http://localhost:3000/health](http://localhost:3000/health)

## 📊 Sample Data Overview
The platform supports environment-specific data injection to satisfy various testing and demo requirements.

### Dataset A (Default/Public)
**Purpose**: General demonstration and public-facing car catalog.
*   **Init Script**: `scripts/seed_public.js`
*   **Volumes**: `pg_data` (shared persistent volume)
*   **Execution**: `docker-compose up`

### Dataset B (Private/Testing)
**Purpose**: Isolated environment for automated verification and private builds.
*   **Init Script**: `scripts/seed_private.js`
*   **Volumes**: `trailblazeauto_postgres_data_private`
*   **Execution**: `docker-compose -f docker-compose.yml -f ../evaluation/docker-compose.private.yml up --build`

## 🧪 Testing

### Running Public Verification
```bash
# Ensure Dataset A is running
cd ../tasks
npx playwright test test-cases/base-tests/trailblaze.spec.ts --reporter=list
```

### Running Private Verification
```bash
# Ensure Dataset B is running
cd ../evaluation
npx playwright test private-test-cases/base-tests/trailblaze.spec.ts --reporter=list
```

### Resetting Environments
```bash
# Tear down and clear volumes
docker-compose down -v
```
