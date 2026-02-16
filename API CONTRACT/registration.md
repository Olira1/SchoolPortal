# School Portal API Contract — Registration Module

**Version:** 1.1 (Extension)  
**Base URL:** `/api/v1`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json` (except file uploads: `multipart/form-data`)

> **IMPORTANT:** This document extends the existing [apicontract.md](./apicontract.md). It does NOT replace or modify any Grade (Mark) module endpoints. All response formats, error structures, authentication, and versioning follow the same conventions defined in the main contract.

---

## Table of Contents

1. [Overview](#overview)
2. [Role Hierarchy & Creation Flow](#role-hierarchy--creation-flow)
3. [Login Rules](#login-rules)
4. [Auth Endpoints (Extended)](#auth-endpoints-extended)
5. [Admin Endpoints (Extended)](#admin-endpoints-extended)
6. [School Head Endpoints (Extended)](#school-head-endpoints-extended)
7. [Registrar Endpoints](#registrar-endpoints)
8. [Registration Error Codes](#registration-error-codes)

---

## Overview

This module adds **user registration**, **account management**, and **password policies** to the School Portal. Registration is strictly controlled — there is no public signup. All user accounts are created by authorized roles within the system.

### Key Principles

- **No self-registration** — All accounts are created by Admin, School Head, or Registrar
- **No email-based password reset** — Registrar handles all resets
- **Parent accounts are auto-created** when a student is registered
- **Passwords are randomly generated**, hashed with bcrypt, and never stored in plain text
- **Excel bulk upload** is supported for students and teachers (`.xlsx` only)

---

## Role Hierarchy & Creation Flow

```
Admin
  ├── Creates: School
  └── Creates: School Head

School Head
  ├── Creates: Registrar
  └── Creates: Store House

Registrar
  ├── Creates: Student (manual + Excel upload)
  ├── Creates: Teacher (manual + Excel upload)
  └── Auto-creates: Parent (when registering a student)
```

---

## Login Rules

| Role | Username Field | Password | must_change_password |
|------|---------------|----------|---------------------|
| Student | `student_code` (e.g. STU2024001) | Auto-generated random | `true` (force change on first login) |
| Teacher | `staff_code` (e.g. TCH2024001) | Auto-generated random | `true` (force change on first login) |
| Parent | `phone` (e.g. +251911234567) | Auto-generated random | `false` |
| School Head | `email` | Set by Admin | `true` |
| Registrar | `email` | Set by School Head | `true` |
| Store House | `email` | Set by School Head | `true` |
| Admin | `email` | Pre-configured | `false` |

### Password Policy

- Minimum 8 characters
- At least one uppercase letter, one lowercase letter, one number
- Auto-generated passwords: 12 characters, cryptographically random
- All passwords hashed with bcrypt (salt rounds: 10) before storage
- Plain text passwords are NEVER stored in the database

---

## Auth Endpoints (Extended)

> These endpoints extend the existing Authentication section in `apicontract.md`. The existing Login, Get Current User, and Logout endpoints remain unchanged.

---

### 1. Login (Updated)

```
POST /api/v1/auth/login
```

> **Updated:** The login endpoint now accepts `username` (which can be email, student_code, staff_code, or phone depending on the role) and checks the `must_change_password` flag.

**Request Body:**
```json
{
  "username": "STU2024001",
  "password": "Temp@12345Ab"
}
```

**Validation Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| username | string | Yes | Non-empty. Can be email, student_code, staff_code, or phone |
| password | string | Yes | Non-empty |

**Response (Normal Login):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 86400,
    "must_change_password": false,
    "user": {
      "id": 10,
      "name": "Ato Haile Mariam",
      "username": "teacher@school.edu.et",
      "role": "teacher",
      "school_id": 1,
      "school_name": "Addis Ababa Secondary School"
    }
  },
  "error": null
}
```

**Response (Must Change Password):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 86400,
    "must_change_password": true,
    "user": {
      "id": 101,
      "name": "Abebe Kebede",
      "username": "STU2024001",
      "role": "student",
      "school_id": 1,
      "school_name": "Addis Ababa Secondary School"
    }
  },
  "error": null
}
```

> **Frontend Behavior:** When `must_change_password` is `true`, the frontend MUST redirect the user to the Change Password page before allowing access to any other page.

**Error Cases:**
- `400 VALIDATION_ERROR` — Missing username or password
- `401 UNAUTHORIZED` — Invalid credentials
- `403 FORBIDDEN` — Account is deactivated

---

### 2. Change Password

```
POST /api/v1/auth/change-password
```

**Role Required:** Any authenticated user

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "current_password": "Temp@12345Ab",
  "new_password": "MyNewSecure@123",
  "confirm_password": "MyNewSecure@123"
}
```

**Validation Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| current_password | string | Yes | Must match current stored password |
| new_password | string | Yes | Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number |
| confirm_password | string | Yes | Must match new_password exactly |

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully",
    "must_change_password": false
  },
  "error": null
}
```

> **Backend Behavior:** After successful password change, set `must_change_password = false` for the user.

**Error Cases:**
- `400 VALIDATION_ERROR` — Passwords don't match, or new password too weak
- `401 UNAUTHORIZED` — Current password is incorrect
- `409 CONFLICT` — New password cannot be the same as current password

---

### 3. Forgot Username (Lookup by Phone)

```
POST /api/v1/auth/forgot-username
```

**Role Required:** None (public endpoint)

**Request Body:**
```json
{
  "phone": "+251911234567"
}
```

**Validation Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| phone | string | Yes | Valid phone number format |

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "If an account exists with this phone number, the username has been sent via SMS",
    "usernames": [
      {
        "role": "parent",
        "username": "+251911234567",
        "name": "Kebede Tessema"
      }
    ]
  },
  "error": null
}
```

> **Security Note:** In production, you may choose to only send the username via SMS and return a generic message to prevent phone number enumeration. The `usernames` array is included here for development/testing purposes.

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid phone format
- `404 NOT_FOUND` — No account found with this phone number

---

## Admin Endpoints (Extended)

**Role Required:** `admin`

> These endpoints extend the existing Admin section in `apicontract.md`. Existing school CRUD, promotion criteria, academic year, statistics, and role/permission endpoints remain unchanged.

---

### 1. Create School Head

```
POST /api/v1/admin/school-heads
```

**Request Body:**
```json
{
  "first_name": "Kebede",
  "last_name": "Tessema",
  "email": "kebede.tessema@school.edu.et",
  "phone": "+251911234567",
  "gender": "M",
  "password": "SecurePass@123",
  "school_id": 1
}
```

**Validation Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| first_name | string | Yes | 2-50 characters |
| last_name | string | Yes | 2-50 characters |
| email | string | Yes | Valid email, unique across all users |
| phone | string | Yes | Valid phone format |
| gender | string | Yes | `M` or `F` |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| school_id | integer | Yes | Must reference an existing active school |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "first_name": "Kebede",
    "last_name": "Tessema",
    "full_name": "Kebede Tessema",
    "email": "kebede.tessema@school.edu.et",
    "phone": "+251911234567",
    "gender": "M",
    "role": "school_head",
    "school": {
      "id": 1,
      "name": "Addis Ababa Secondary School"
    },
    "must_change_password": true,
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid input data
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not an admin
- `404 NOT_FOUND` — School not found
- `409 CONFLICT` — Email already exists
- `409 CONFLICT` — School already has an active school head

---

### 2. List School Heads

```
GET /api/v1/admin/school-heads
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |
| school_id | integer | No | Filter by school |
| status | string | No | `active`, `inactive`, `all` |
| search | string | No | Search by name or email |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 15,
        "full_name": "Kebede Tessema",
        "email": "kebede.tessema@school.edu.et",
        "phone": "+251911234567",
        "gender": "M",
        "role": "school_head",
        "school": {
          "id": 1,
          "name": "Addis Ababa Secondary School"
        },
        "status": "active",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 5,
      "total_pages": 1
    }
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not an admin

---

### 3. Get School Head Details

```
GET /api/v1/admin/school-heads/:user_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | integer | Yes | School head user identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "first_name": "Kebede",
    "last_name": "Tessema",
    "full_name": "Kebede Tessema",
    "email": "kebede.tessema@school.edu.et",
    "phone": "+251911234567",
    "gender": "M",
    "role": "school_head",
    "school": {
      "id": 1,
      "name": "Addis Ababa Secondary School"
    },
    "status": "active",
    "must_change_password": false,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not an admin
- `404 NOT_FOUND` — School head not found

---

### 4. Update School Head

```
PUT /api/v1/admin/school-heads/:user_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | integer | Yes | School head user identifier |

**Request Body:**
```json
{
  "first_name": "Kebede",
  "last_name": "Tessema (Updated)",
  "email": "kebede.updated@school.edu.et",
  "phone": "+251911234568"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "first_name": "Kebede",
    "last_name": "Tessema (Updated)",
    "full_name": "Kebede Tessema (Updated)",
    "email": "kebede.updated@school.edu.et",
    "phone": "+251911234568",
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid input data
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not an admin
- `404 NOT_FOUND` — School head not found
- `409 CONFLICT` — Email already in use by another user

---

### 5. Deactivate School Head

```
PATCH /api/v1/admin/school-heads/:user_id/deactivate
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | integer | Yes | School head user identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "full_name": "Kebede Tessema",
    "status": "inactive",
    "deactivated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not an admin
- `404 NOT_FOUND` — School head not found
- `409 CONFLICT` — School head is already inactive

---

### 6. Activate School Head

```
PATCH /api/v1/admin/school-heads/:user_id/activate
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | integer | Yes | School head user identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "full_name": "Kebede Tessema",
    "status": "active",
    "activated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not an admin
- `404 NOT_FOUND` — School head not found
- `409 CONFLICT` — School head is already active

---

## School Head Endpoints (Extended)

**Role Required:** `school_head`

> These endpoints extend the existing School Head section in `apicontract.md`. All grade management, class management, subject management, assessment, teaching assignment, report, and grading period endpoints remain unchanged.

> **Note:** All endpoints are scoped to the school from the JWT token (`school_id`).

---

### 1. Create Registrar

```
POST /api/v1/school/registrars
```

**Request Body:**
```json
{
  "first_name": "Almaz",
  "last_name": "Tadesse",
  "email": "almaz.tadesse@school.edu.et",
  "phone": "+251922345678",
  "gender": "F",
  "password": "SecurePass@123"
}
```

**Validation Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| first_name | string | Yes | 2-50 characters |
| last_name | string | Yes | 2-50 characters |
| email | string | Yes | Valid email, unique across all users |
| phone | string | Yes | Valid phone format |
| gender | string | Yes | `M` or `F` |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 20,
    "first_name": "Almaz",
    "last_name": "Tadesse",
    "full_name": "Almaz Tadesse",
    "email": "almaz.tadesse@school.edu.et",
    "phone": "+251922345678",
    "gender": "F",
    "role": "registrar",
    "school": {
      "id": 1,
      "name": "Addis Ababa Secondary School"
    },
    "must_change_password": true,
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid input data
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a school head
- `409 CONFLICT` — Email already exists

---

### 2. List Registrars

```
GET /api/v1/school/registrars
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |
| status | string | No | `active`, `inactive`, `all` |
| search | string | No | Search by name or email |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 20,
        "full_name": "Almaz Tadesse",
        "email": "almaz.tadesse@school.edu.et",
        "phone": "+251922345678",
        "gender": "F",
        "role": "registrar",
        "status": "active",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 2,
      "total_pages": 1
    }
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a school head

---

### 3. Update Registrar

```
PUT /api/v1/school/registrars/:user_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | integer | Yes | Registrar user identifier |

**Request Body:**
```json
{
  "first_name": "Almaz",
  "last_name": "Tadesse (Updated)",
  "email": "almaz.updated@school.edu.et",
  "phone": "+251922345679"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 20,
    "first_name": "Almaz",
    "last_name": "Tadesse (Updated)",
    "full_name": "Almaz Tadesse (Updated)",
    "email": "almaz.updated@school.edu.et",
    "phone": "+251922345679",
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid input data
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a school head
- `404 NOT_FOUND` — Registrar not found or does not belong to this school
- `409 CONFLICT` — Email already in use

---

### 4. Deactivate / Activate Registrar

#### 4.1 Deactivate Registrar

```
PATCH /api/v1/school/registrars/:user_id/deactivate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 20,
    "full_name": "Almaz Tadesse",
    "status": "inactive",
    "deactivated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

---

#### 4.2 Activate Registrar

```
PATCH /api/v1/school/registrars/:user_id/activate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 20,
    "full_name": "Almaz Tadesse",
    "status": "active",
    "activated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

---

### 5. Create Store House User

```
POST /api/v1/school/store-house-users
```

**Request Body:**
```json
{
  "first_name": "Daniel",
  "last_name": "Hailu",
  "email": "daniel.hailu@school.edu.et",
  "phone": "+251933456789",
  "gender": "M",
  "password": "SecurePass@123"
}
```

**Validation Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| first_name | string | Yes | 2-50 characters |
| last_name | string | Yes | 2-50 characters |
| email | string | Yes | Valid email, unique across all users |
| phone | string | Yes | Valid phone format |
| gender | string | Yes | `M` or `F` |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "first_name": "Daniel",
    "last_name": "Hailu",
    "full_name": "Daniel Hailu",
    "email": "daniel.hailu@school.edu.et",
    "phone": "+251933456789",
    "gender": "M",
    "role": "store_house",
    "school": {
      "id": 1,
      "name": "Addis Ababa Secondary School"
    },
    "must_change_password": true,
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid input data
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a school head
- `409 CONFLICT` — Email already exists

---

### 6. List Store House Users

```
GET /api/v1/school/store-house-users
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |
| status | string | No | `active`, `inactive`, `all` |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 25,
        "full_name": "Daniel Hailu",
        "email": "daniel.hailu@school.edu.et",
        "phone": "+251933456789",
        "gender": "M",
        "role": "store_house",
        "status": "active",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 1,
      "total_pages": 1
    }
  },
  "error": null
}
```

---

### 7. Update Store House User

```
PUT /api/v1/school/store-house-users/:user_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | integer | Yes | Store house user identifier |

**Request Body:**
```json
{
  "first_name": "Daniel",
  "last_name": "Hailu (Updated)",
  "email": "daniel.updated@school.edu.et",
  "phone": "+251933456790"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "first_name": "Daniel",
    "last_name": "Hailu (Updated)",
    "full_name": "Daniel Hailu (Updated)",
    "email": "daniel.updated@school.edu.et",
    "phone": "+251933456790",
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid input data
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a school head
- `404 NOT_FOUND` — Store house user not found or does not belong to this school
- `409 CONFLICT` — Email already in use

---

### 8. Deactivate / Activate Store House User

#### 8.1 Deactivate Store House User

```
PATCH /api/v1/school/store-house-users/:user_id/deactivate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "full_name": "Daniel Hailu",
    "status": "inactive",
    "deactivated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

---

#### 8.2 Activate Store House User

```
PATCH /api/v1/school/store-house-users/:user_id/activate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "full_name": "Daniel Hailu",
    "status": "active",
    "activated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

---

## Registrar Endpoints

**Role Required:** `registrar`

> **Note:** All endpoints are scoped to the registrar's school from the JWT token (`school_id`).

---

### 1. Manual Student Registration

#### 1.1 Create Student

```
POST /api/v1/registrar/students
```

> **Important:** When creating a student, parent information is required. The system will auto-create a parent user account if one does not already exist with the given phone number. If a parent with that phone already exists, the student is linked to the existing parent.

**Request Body:**
```json
{
  "first_name": "Abebe",
  "last_name": "Kebede",
  "gender": "M",
  "date_of_birth": "2008-05-15",
  "grade_id": 1,
  "class_id": 1,
  "academic_year_id": 1,
  "parent": {
    "first_name": "Kebede",
    "last_name": "Tessema",
    "phone": "+251911234567",
    "relationship": "father"
  }
}
```

**Validation Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| first_name | string | Yes | 2-50 characters |
| last_name | string | Yes | 2-50 characters |
| gender | string | Yes | `M` or `F` |
| date_of_birth | string (date) | Yes | Format: YYYY-MM-DD, must be a past date |
| grade_id | integer | Yes | Must exist in the school |
| class_id | integer | Yes | Must belong to the specified grade |
| academic_year_id | integer | Yes | Must be an active academic year |
| parent.first_name | string | Yes | 2-50 characters |
| parent.last_name | string | Yes | 2-50 characters |
| parent.phone | string | Yes | Valid phone format, used as parent username |
| parent.relationship | string | Yes | `father`, `mother`, `guardian` |

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 101,
      "student_code": "STU2024001",
      "first_name": "Abebe",
      "last_name": "Kebede",
      "full_name": "Abebe Kebede",
      "gender": "M",
      "date_of_birth": "2008-05-15",
      "grade": {
        "id": 1,
        "name": "Grade 9"
      },
      "class": {
        "id": 1,
        "name": "9A"
      },
      "academic_year": {
        "id": 1,
        "name": "2023/2024"
      },
      "status": "active",
      "created_at": "2024-01-15T10:00:00Z"
    },
    "student_credentials": {
      "username": "STU2024001",
      "temporary_password": "xK9#mP2$vL5n",
      "must_change_password": true
    },
    "parent": {
      "id": 200,
      "full_name": "Kebede Tessema",
      "phone": "+251911234567",
      "relationship": "father",
      "is_new_account": true
    },
    "parent_credentials": {
      "username": "+251911234567",
      "temporary_password": "aB3$nQ7*wR1k",
      "must_change_password": false
    }
  },
  "error": null
}
```

> **Note:** `parent_credentials` is only returned when `parent.is_new_account` is `true`. If the parent already existed, `parent_credentials` will be `null` (password is not regenerated for existing parents).

**Response (Existing Parent):**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 102,
      "student_code": "STU2024002",
      "first_name": "Meron",
      "last_name": "Kebede",
      "full_name": "Meron Kebede",
      "gender": "F",
      "date_of_birth": "2009-03-20",
      "grade": {
        "id": 1,
        "name": "Grade 9"
      },
      "class": {
        "id": 2,
        "name": "9B"
      },
      "academic_year": {
        "id": 1,
        "name": "2023/2024"
      },
      "status": "active",
      "created_at": "2024-01-15T10:00:00Z"
    },
    "student_credentials": {
      "username": "STU2024002",
      "temporary_password": "jH8#pL4$qW2m",
      "must_change_password": true
    },
    "parent": {
      "id": 200,
      "full_name": "Kebede Tessema",
      "phone": "+251911234567",
      "relationship": "father",
      "is_new_account": false
    },
    "parent_credentials": null
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid input data
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar
- `404 NOT_FOUND` — Grade, class, or academic year not found
- `409 CONFLICT` — Class is full (capacity reached)

---

#### 1.2 List Students

```
GET /api/v1/registrar/students
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |
| grade_id | integer | No | Filter by grade |
| class_id | integer | No | Filter by class |
| academic_year_id | integer | No | Filter by academic year |
| status | string | No | `active`, `inactive`, `all` |
| search | string | No | Search by name or student code |
| gender | string | No | `M` or `F` |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 101,
        "student_code": "STU2024001",
        "full_name": "Abebe Kebede",
        "gender": "M",
        "date_of_birth": "2008-05-15",
        "grade": {
          "id": 1,
          "name": "Grade 9"
        },
        "class": {
          "id": 1,
          "name": "9A"
        },
        "parent": {
          "id": 200,
          "full_name": "Kebede Tessema",
          "phone": "+251911234567"
        },
        "status": "active",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 350,
      "total_pages": 18
    }
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar

---

#### 1.3 Get Student Details

```
GET /api/v1/registrar/students/:student_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "student_code": "STU2024001",
    "first_name": "Abebe",
    "last_name": "Kebede",
    "full_name": "Abebe Kebede",
    "gender": "M",
    "date_of_birth": "2008-05-15",
    "grade": {
      "id": 1,
      "name": "Grade 9"
    },
    "class": {
      "id": 1,
      "name": "9A"
    },
    "academic_year": {
      "id": 1,
      "name": "2023/2024"
    },
    "parent": {
      "id": 200,
      "full_name": "Kebede Tessema",
      "phone": "+251911234567",
      "relationship": "father"
    },
    "user_account": {
      "username": "STU2024001",
      "must_change_password": true,
      "last_login": null
    },
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar
- `404 NOT_FOUND` — Student not found or does not belong to this school

---

#### 1.4 Update Student

```
PUT /api/v1/registrar/students/:student_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student identifier |

**Request Body:**
```json
{
  "first_name": "Abebe",
  "last_name": "Kebede (Updated)",
  "gender": "M",
  "date_of_birth": "2008-05-15",
  "class_id": 2,
  "parent": {
    "first_name": "Kebede",
    "last_name": "Tessema",
    "phone": "+251911234567",
    "relationship": "father"
  }
}
```

> **Note:** Changing `class_id` moves the student to a different class within the same grade. To change the grade, use the promotion system instead.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "student_code": "STU2024001",
    "first_name": "Abebe",
    "last_name": "Kebede (Updated)",
    "full_name": "Abebe Kebede (Updated)",
    "gender": "M",
    "date_of_birth": "2008-05-15",
    "class": {
      "id": 2,
      "name": "9B"
    },
    "parent": {
      "id": 200,
      "full_name": "Kebede Tessema",
      "phone": "+251911234567",
      "relationship": "father"
    },
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid input data
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar
- `404 NOT_FOUND` — Student not found
- `409 CONFLICT` — Target class is full

---

#### 1.5 Deactivate Student

```
PATCH /api/v1/registrar/students/:student_id/deactivate
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_id | integer | Yes | Student identifier |

**Request Body:**
```json
{
  "reason": "Transferred to another school"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "student_code": "STU2024001",
    "full_name": "Abebe Kebede",
    "status": "inactive",
    "reason": "Transferred to another school",
    "deactivated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar
- `404 NOT_FOUND` — Student not found
- `409 CONFLICT` — Student is already inactive

---

#### 1.6 Activate Student

```
PATCH /api/v1/registrar/students/:student_id/activate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "student_code": "STU2024001",
    "full_name": "Abebe Kebede",
    "status": "active",
    "activated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

---

### 2. Manual Teacher Registration

#### 2.1 Create Teacher

```
POST /api/v1/registrar/teachers
```

**Request Body:**
```json
{
  "first_name": "Haile",
  "last_name": "Mariam",
  "gender": "M",
  "date_of_birth": "1985-03-10",
  "email": "haile.mariam@school.edu.et",
  "phone": "+251944567890",
  "qualification": "BSc in Mathematics",
  "specialization": "Mathematics"
}
```

**Validation Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| first_name | string | Yes | 2-50 characters |
| last_name | string | Yes | 2-50 characters |
| gender | string | Yes | `M` or `F` |
| date_of_birth | string (date) | No | Format: YYYY-MM-DD |
| email | string | No | Valid email, unique if provided |
| phone | string | Yes | Valid phone format |
| qualification | string | No | Max 200 characters |
| specialization | string | No | Max 100 characters |

**Response:**
```json
{
  "success": true,
  "data": {
    "teacher": {
      "id": 10,
      "staff_code": "TCH2024001",
      "first_name": "Haile",
      "last_name": "Mariam",
      "full_name": "Haile Mariam",
      "gender": "M",
      "date_of_birth": "1985-03-10",
      "email": "haile.mariam@school.edu.et",
      "phone": "+251944567890",
      "qualification": "BSc in Mathematics",
      "specialization": "Mathematics",
      "school": {
        "id": 1,
        "name": "Addis Ababa Secondary School"
      },
      "status": "active",
      "created_at": "2024-01-15T10:00:00Z"
    },
    "credentials": {
      "username": "TCH2024001",
      "temporary_password": "rT6#hN9$bK3p",
      "must_change_password": true
    }
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid input data
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar
- `409 CONFLICT` — Email already exists (if provided)

---

#### 2.2 List Teachers

```
GET /api/v1/registrar/teachers
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |
| status | string | No | `active`, `inactive`, `all` |
| search | string | No | Search by name, staff code, or email |
| gender | string | No | `M` or `F` |
| specialization | string | No | Filter by specialization |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 10,
        "staff_code": "TCH2024001",
        "full_name": "Haile Mariam",
        "gender": "M",
        "email": "haile.mariam@school.edu.et",
        "phone": "+251944567890",
        "qualification": "BSc in Mathematics",
        "specialization": "Mathematics",
        "status": "active",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 85,
      "total_pages": 5
    }
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar

---

#### 2.3 Get Teacher Details

```
GET /api/v1/registrar/teachers/:teacher_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| teacher_id | integer | Yes | Teacher identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "staff_code": "TCH2024001",
    "first_name": "Haile",
    "last_name": "Mariam",
    "full_name": "Haile Mariam",
    "gender": "M",
    "date_of_birth": "1985-03-10",
    "email": "haile.mariam@school.edu.et",
    "phone": "+251944567890",
    "qualification": "BSc in Mathematics",
    "specialization": "Mathematics",
    "school": {
      "id": 1,
      "name": "Addis Ababa Secondary School"
    },
    "user_account": {
      "username": "TCH2024001",
      "must_change_password": false,
      "last_login": "2024-01-14T08:30:00Z"
    },
    "teaching_assignments": [
      {
        "class_name": "9A",
        "grade_name": "Grade 9",
        "subject_name": "Mathematics"
      },
      {
        "class_name": "9B",
        "grade_name": "Grade 9",
        "subject_name": "Mathematics"
      }
    ],
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar
- `404 NOT_FOUND` — Teacher not found or does not belong to this school

---

#### 2.4 Update Teacher

```
PUT /api/v1/registrar/teachers/:teacher_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| teacher_id | integer | Yes | Teacher identifier |

**Request Body:**
```json
{
  "first_name": "Haile",
  "last_name": "Mariam (Updated)",
  "email": "haile.updated@school.edu.et",
  "phone": "+251944567891",
  "qualification": "MSc in Mathematics",
  "specialization": "Mathematics, Physics"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "staff_code": "TCH2024001",
    "first_name": "Haile",
    "last_name": "Mariam (Updated)",
    "full_name": "Haile Mariam (Updated)",
    "email": "haile.updated@school.edu.et",
    "phone": "+251944567891",
    "qualification": "MSc in Mathematics",
    "specialization": "Mathematics, Physics",
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid input data
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar
- `404 NOT_FOUND` — Teacher not found
- `409 CONFLICT` — Email already in use

---

#### 2.5 Deactivate Teacher

```
PATCH /api/v1/registrar/teachers/:teacher_id/deactivate
```

**Request Body:**
```json
{
  "reason": "Contract ended"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "staff_code": "TCH2024001",
    "full_name": "Haile Mariam",
    "status": "inactive",
    "reason": "Contract ended",
    "deactivated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar
- `404 NOT_FOUND` — Teacher not found
- `409 CONFLICT` — Teacher has active teaching assignments (must be reassigned first)

---

#### 2.6 Activate Teacher

```
PATCH /api/v1/registrar/teachers/:teacher_id/activate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "staff_code": "TCH2024001",
    "full_name": "Haile Mariam",
    "status": "active",
    "activated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

---

### 3. Excel Bulk Upload — Students

#### 3.1 Upload Students via Excel

```
POST /api/v1/registrar/students/upload
```

**Content-Type:** `multipart/form-data`

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file (.xlsx) | Yes | Excel file with student data |
| grade_id | integer | Yes | Grade level for all students in file |
| class_id | integer | Yes | Class for all students in file |
| academic_year_id | integer | Yes | Active academic year |

**Expected Excel Columns:**

| Column | Required | Description |
|--------|----------|-------------|
| first_name | Yes | Student first name |
| last_name | Yes | Student last name |
| gender | Yes | M or F |
| date_of_birth | Yes | YYYY-MM-DD format |
| parent_first_name | Yes | Parent first name |
| parent_last_name | Yes | Parent last name |
| parent_phone | Yes | Parent phone (used as parent username) |
| parent_relationship | Yes | father, mother, or guardian |

**Response:**
```json
{
  "success": true,
  "data": {
    "upload_id": "upload-stu-2024-001",
    "total_rows": 50,
    "successful": 47,
    "failed": 3,
    "grade": {
      "id": 1,
      "name": "Grade 9"
    },
    "class": {
      "id": 1,
      "name": "9A"
    },
    "results": {
      "created_students": [
        {
          "row": 1,
          "student_code": "STU2024003",
          "full_name": "Tigist Bekele",
          "temporary_password": "mK4#qW8$nR2b",
          "parent_name": "Bekele Hailu",
          "parent_phone": "+251955678901",
          "parent_is_new": true,
          "parent_temporary_password": "fG7$dH3#jL9p"
        },
        {
          "row": 2,
          "student_code": "STU2024004",
          "full_name": "Dawit Alemu",
          "temporary_password": "pL5#vN1$xB8c",
          "parent_name": "Alemu Tadesse",
          "parent_phone": "+251966789012",
          "parent_is_new": true,
          "parent_temporary_password": "yR2$tK6#wQ4m"
        }
      ],
      "failed_rows": [
        {
          "row": 15,
          "data": {
            "first_name": "Sara",
            "last_name": "",
            "gender": "F"
          },
          "errors": [
            { "field": "last_name", "message": "Last name is required" }
          ]
        },
        {
          "row": 23,
          "data": {
            "first_name": "Mohammed",
            "last_name": "Ali",
            "gender": "X"
          },
          "errors": [
            { "field": "gender", "message": "Gender must be M or F" }
          ]
        },
        {
          "row": 41,
          "data": {
            "first_name": "Helen",
            "last_name": "Gebre",
            "parent_phone": ""
          },
          "errors": [
            { "field": "parent_phone", "message": "Parent phone is required" }
          ]
        }
      ]
    },
    "new_parents_created": 35,
    "existing_parents_linked": 12,
    "uploaded_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid file format (not .xlsx)
- `400 VALIDATION_ERROR` — File is empty or exceeds 5MB limit
- `400 VALIDATION_ERROR` — Missing required columns in Excel
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar
- `404 NOT_FOUND` — Grade, class, or academic year not found
- `409 CONFLICT` — Class capacity would be exceeded
- `422 UNPROCESSABLE_ENTITY` — All rows failed validation

---

#### 3.2 Download Student Upload Template

```
GET /api/v1/registrar/students/upload/template
```

**Response:**
```json
{
  "success": true,
  "data": {
    "download_url": "/api/v1/downloads/templates/student_upload_template.xlsx",
    "filename": "student_upload_template.xlsx",
    "columns": [
      "first_name",
      "last_name",
      "gender",
      "date_of_birth",
      "parent_first_name",
      "parent_last_name",
      "parent_phone",
      "parent_relationship"
    ]
  },
  "error": null
}
```

---

### 4. Excel Bulk Upload — Teachers

#### 4.1 Upload Teachers via Excel

```
POST /api/v1/registrar/teachers/upload
```

**Content-Type:** `multipart/form-data`

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file (.xlsx) | Yes | Excel file with teacher data |

**Expected Excel Columns:**

| Column | Required | Description |
|--------|----------|-------------|
| first_name | Yes | Teacher first name |
| last_name | Yes | Teacher last name |
| gender | Yes | M or F |
| date_of_birth | No | YYYY-MM-DD format |
| email | No | Valid email (unique if provided) |
| phone | Yes | Valid phone number |
| qualification | No | Education qualification |
| specialization | No | Subject specialization |

**Response:**
```json
{
  "success": true,
  "data": {
    "upload_id": "upload-tch-2024-001",
    "total_rows": 20,
    "successful": 18,
    "failed": 2,
    "results": {
      "created_teachers": [
        {
          "row": 1,
          "staff_code": "TCH2024002",
          "full_name": "Tigist Bekele",
          "temporary_password": "wN5#kR3$bQ1x"
        },
        {
          "row": 2,
          "staff_code": "TCH2024003",
          "full_name": "Yohannes Gebre",
          "temporary_password": "cL8$mT2#hF6j"
        }
      ],
      "failed_rows": [
        {
          "row": 8,
          "data": {
            "first_name": "",
            "last_name": "Hailu",
            "gender": "M"
          },
          "errors": [
            { "field": "first_name", "message": "First name is required" }
          ]
        },
        {
          "row": 14,
          "data": {
            "first_name": "Sara",
            "last_name": "Tesfaye",
            "email": "existing@school.edu.et"
          },
          "errors": [
            { "field": "email", "message": "Email already exists in the system" }
          ]
        }
      ]
    },
    "uploaded_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid file format (not .xlsx)
- `400 VALIDATION_ERROR` — File is empty or exceeds 5MB limit
- `400 VALIDATION_ERROR` — Missing required columns in Excel
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar
- `422 UNPROCESSABLE_ENTITY` — All rows failed validation

---

#### 4.2 Download Teacher Upload Template

```
GET /api/v1/registrar/teachers/upload/template
```

**Response:**
```json
{
  "success": true,
  "data": {
    "download_url": "/api/v1/downloads/templates/teacher_upload_template.xlsx",
    "filename": "teacher_upload_template.xlsx",
    "columns": [
      "first_name",
      "last_name",
      "gender",
      "date_of_birth",
      "email",
      "phone",
      "qualification",
      "specialization"
    ]
  },
  "error": null
}
```

---

### 5. Password Reset (by Registrar)

#### 5.1 Reset User Password

```
POST /api/v1/registrar/users/:user_id/reset-password
```

**Role Required:** `registrar`

> **Note:** The registrar can only reset passwords for users within their school (students, teachers, parents). They cannot reset passwords for school heads, other registrars, admin, or store house users.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | integer | Yes | User identifier |

**Request Body:** _(no body required)_

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 101,
    "full_name": "Abebe Kebede",
    "username": "STU2024001",
    "role": "student",
    "new_temporary_password": "zP4#nQ8$vL2k",
    "must_change_password": true,
    "reset_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

> **Note for Parents:** When resetting a parent's password, `must_change_password` remains `false` (parents are not forced to change passwords).

**Response (Parent Reset):**
```json
{
  "success": true,
  "data": {
    "user_id": 200,
    "full_name": "Kebede Tessema",
    "username": "+251911234567",
    "role": "parent",
    "new_temporary_password": "aB3$nQ7*wR1k",
    "must_change_password": false,
    "reset_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar, or target user is outside their school scope
- `404 NOT_FOUND` — User not found

---

### 6. Parent Management

#### 6.1 List Parents

```
GET /api/v1/registrar/parents
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |
| search | string | No | Search by name or phone |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 200,
        "full_name": "Kebede Tessema",
        "phone": "+251911234567",
        "children_count": 2,
        "children": [
          {
            "student_id": 101,
            "student_code": "STU2024001",
            "full_name": "Abebe Kebede",
            "class_name": "9A",
            "relationship": "father"
          },
          {
            "student_id": 102,
            "student_code": "STU2024002",
            "full_name": "Meron Kebede",
            "class_name": "9B",
            "relationship": "father"
          }
        ],
        "status": "active",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 280,
      "total_pages": 14
    }
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar

---

#### 6.2 Get Parent Details

```
GET /api/v1/registrar/parents/:parent_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| parent_id | integer | Yes | Parent user identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 200,
    "first_name": "Kebede",
    "last_name": "Tessema",
    "full_name": "Kebede Tessema",
    "phone": "+251911234567",
    "user_account": {
      "username": "+251911234567",
      "must_change_password": false,
      "last_login": "2024-01-14T18:30:00Z"
    },
    "children": [
      {
        "student_id": 101,
        "student_code": "STU2024001",
        "full_name": "Abebe Kebede",
        "grade_name": "Grade 9",
        "class_name": "9A",
        "relationship": "father",
        "status": "active"
      }
    ],
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar
- `404 NOT_FOUND` — Parent not found

---

#### 6.3 Update Parent Info

```
PUT /api/v1/registrar/parents/:parent_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| parent_id | integer | Yes | Parent user identifier |

**Request Body:**
```json
{
  "first_name": "Kebede",
  "last_name": "Tessema (Updated)",
  "phone": "+251911234568"
}
```

**Validation Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| first_name | string | No | 2-50 characters |
| last_name | string | No | 2-50 characters |
| phone | string | No | Valid phone format, unique if changed |

> **Important:** If the phone number changes, the parent's username also changes (since phone is the username for parents). The parent must use the new phone number to log in.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 200,
    "first_name": "Kebede",
    "last_name": "Tessema (Updated)",
    "full_name": "Kebede Tessema (Updated)",
    "phone": "+251911234568",
    "username_changed": true,
    "new_username": "+251911234568",
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` — Invalid input data
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar
- `404 NOT_FOUND` — Parent not found
- `409 CONFLICT` — Phone number already in use by another parent

---

### 7. Registration Statistics

```
GET /api/v1/registrar/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "school": {
      "id": 1,
      "name": "Addis Ababa Secondary School"
    },
    "students": {
      "total": 1200,
      "active": 1180,
      "inactive": 20,
      "by_gender": {
        "male": 620,
        "female": 580
      },
      "by_grade": {
        "Grade 9": 350,
        "Grade 10": 320,
        "Grade 11": 280,
        "Grade 12": 250
      }
    },
    "teachers": {
      "total": 85,
      "active": 82,
      "inactive": 3,
      "by_gender": {
        "male": 50,
        "female": 35
      }
    },
    "parents": {
      "total": 980,
      "active": 975,
      "inactive": 5
    },
    "recent_registrations": {
      "students_this_month": 15,
      "teachers_this_month": 2
    },
    "last_updated": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` — Invalid or missing token
- `403 FORBIDDEN` — User is not a registrar

---

## Registration Error Codes

> These extend the error codes defined in `apicontract.md`. All existing error codes remain valid.

| HTTP Status | Error Code | Description | Used In |
|-------------|------------|-------------|---------|
| 400 | VALIDATION_ERROR | Invalid input data or business rule violation | All endpoints |
| 400 | INVALID_FILE_FORMAT | Uploaded file is not .xlsx | Excel upload |
| 400 | FILE_TOO_LARGE | File exceeds 5MB limit | Excel upload |
| 400 | MISSING_COLUMNS | Required columns missing in Excel | Excel upload |
| 400 | WEAK_PASSWORD | Password does not meet complexity requirements | Change password |
| 401 | UNAUTHORIZED | Missing or invalid authentication token | All endpoints |
| 401 | INVALID_CREDENTIALS | Wrong username or password | Login |
| 403 | FORBIDDEN | User does not have permission | All endpoints |
| 403 | ACCOUNT_DEACTIVATED | User account is deactivated | Login |
| 403 | PASSWORD_CHANGE_REQUIRED | Must change password before accessing system | Auth middleware |
| 404 | NOT_FOUND | Requested resource does not exist | All endpoints |
| 409 | CONFLICT | Resource state conflict | Create/Update |
| 409 | DUPLICATE_EMAIL | Email already exists | User creation |
| 409 | DUPLICATE_PHONE | Phone number already exists (parent) | Student creation |
| 409 | CLASS_FULL | Class has reached maximum capacity | Student creation |
| 409 | SAME_PASSWORD | New password same as current | Change password |
| 422 | UNPROCESSABLE_ENTITY | All rows in upload failed validation | Excel upload |
| 500 | INTERNAL_ERROR | Server-side error | All endpoints |

---

## Appendix: Auto-Generated Code Formats

### Student Code Format
```
STU{YEAR}{SEQUENCE}
Example: STU2024001, STU2024002, STU2024350
```
- `YEAR`: 4-digit enrollment year
- `SEQUENCE`: 3-digit zero-padded number, auto-incrementing per school per year

### Teacher Staff Code Format
```
TCH{YEAR}{SEQUENCE}
Example: TCH2024001, TCH2024002, TCH2024085
```
- `YEAR`: 4-digit year of registration
- `SEQUENCE`: 3-digit zero-padded number, auto-incrementing per school per year

### Password Generation Rules
- Length: 12 characters
- Includes: uppercase, lowercase, digits, special characters (`#$@!%*?&`)
- Generated using cryptographically secure random function
- Hashed with bcrypt (salt rounds: 10) before storing in database
- Plain text password is ONLY returned once in the API response — it is never stored or retrievable again

---

## Appendix: Parent Auto-Creation Flow

```
Student Registration Request
        │
        ▼
  Extract parent.phone
        │
        ▼
  ┌─────────────────────┐
  │ Does parent exist    │
  │ with this phone?     │
  └─────┬───────────┬────┘
        │           │
       YES         NO
        │           │
        ▼           ▼
  Link student   Create new parent user
  to existing    ├── username = phone
  parent         ├── password = random (hashed)
        │        ├── must_change_password = false
        │        └── Return credentials in response
        │           │
        ▼           ▼
  Return parent  Return parent info + credentials
  info (no       (parent_credentials included)
  credentials)
        │           │
        └─────┬─────┘
              │
              ▼
     Student created successfully
```

---

*Document Version: 1.1 (Registration Extension)*  
*Last Updated: February 2026*  
*System: Ethiopian Secondary School Grade Management Portal*
