# EmployeeRecordsAPI

A REST API built to demonstrate enterprise deployment concepts including layered architecture, containerization on Red Hat Linux, JWT authentication with role-based access control, and automated audit logging.

## Tech Stack

- **Backend:** ASP.NET Core 10, Entity Framework Core
- **Database:** SQL Server 2022
- **Container:** Docker, Red Hat UBI9 (RHEL-compatible base image)
- **Authentication:** JWT with Admin/Viewer roles
- **Frontend:** React

## Architecture

The solution follows a layered architecture with strict dependency rules:

```
API → Application → Domain
API → Infrastructure → Domain
```

- **Domain** — Entities only, zero dependencies
- **Application** — Business logic
- **Infrastructure** — EF Core, SQL Server, data access
- **API** — Controllers, middleware, JWT configuration

## Features

- Employee CRUD with soft delete (records are never permanently removed)
- JWT authentication — login returns a signed token valid for 8 hours
- Role-based access control — Admins can create/update/disable, Viewers can only read
- Audit logging — every mutating action writes to AuditLogs table with who, what, and when, including full before/after JSON snapshots
- Environment separation — separate Dev and Production databases via appsettings per environment
- React frontend with role-aware UI

## Running the Project

### Prerequisites
- Docker Desktop
- .NET 10 SDK (for running migrations)
- Node.js (for the frontend)

### 1. Start the containers

```bash
docker compose up --build -d
```

This starts two containers:
- `sqlserver` — SQL Server 2022 on port 1433
- `employeeapi` — ASP.NET Core API on port 5000, running on Red Hat UBI9

### 2. Run database migrations

```bash
dotnet ef database update --project src/Infrastructure --startup-project src/API --connection "Server=localhost,1433;Database=EmployeeRecordsDB_Dev;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True"
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

### 4. Create the first Admin user

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "Admin User",
  "email": "admin@company.com",
  "password": "Admin@123",
  "role": "Admin"
}
```

> Note: The register endpoint requires an Admin JWT token except for the very first user. If no users exist yet, create the first admin directly via this endpoint, then all subsequent registrations require authentication.

### 5. Login

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "Admin@123"
}
```

Returns a JWT token. Pass it as `Authorization: Bearer <token>` on all subsequent requests.

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/login | None | Returns JWT token |
| POST | /api/auth/register | Admin | Creates a new user |

### Employees
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/employee | Any | Get all active employees |
| GET | /api/employee/{id} | Any | Get employee by ID |
| POST | /api/employee | Admin | Create employee |
| PUT | /api/employee/{id} | Admin | Update employee |
| DELETE | /api/employee/{id} | Admin | Disable employee (soft delete) |

### Audit Log
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/auditlog | Admin | Get all audit entries |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/user | Admin | Get all users |

## Backup and Restore

### Backup
```bash
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" -C \
  -Q "BACKUP DATABASE EmployeeRecordsDB_Dev TO DISK='/var/opt/mssql/backup.bak'"
```

### Restore
```bash
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" -C \
  -Q "RESTORE DATABASE EmployeeRecordsDB_Dev FROM DISK='/var/opt/mssql/backup.bak' WITH REPLACE"
```
