# School Portal API Contract

**Version:** 1.0  
**Base URL:** `/api/v1`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Overview](#overview)
2. [Response Format](#response-format)
3. [Authentication](#authentication)
4. [Admin Endpoints](#admin-endpoints)
5. [School Head Endpoints](#school-head-endpoints)
6. [Teacher Endpoints](#teacher-endpoints)
7. [Class Head Endpoints](#class-head-endpoints)
8. [Student Endpoints](#student-endpoints)
9. [Parent Endpoints](#parent-endpoints)
10. [Store House Endpoints](#store-house-endpoints)
11. [Error Codes Reference](#error-codes-reference)

---

## Overview

This API contract defines the endpoints for a multi-school secondary school grade management system. The system supports multiple schools, with `school_id` derived from the authenticated user's JWT token.

### Ethiopian Grading System

This system follows the Ethiopian secondary school grading approach:

- **No letter grades (A, B, C, D)** - Students receive numerical scores only
- **No GPA calculations** - Academic performance is measured by:
  - **Total**: Sum of all subject scores
  - **Average**: Mean of all subject scores
  - **Rank**: Position in class based on total/average
  - **Remark**: Promotion status (Promoted / Not Promoted)
- **Class Head** is responsible for calculating total, average, rank, and remark
- **Results flow**: Teacher → Class Head (compile) → Students, Parents, Store House

### Key Principles

- RESTful design patterns
- Role-based access control via JWT
- Consistent response structure
- No direct database table exposure

---

## Response Format

All endpoints return responses in the following structure:

```json
{
  "success": true,
  "data": { },
  "error": null
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Example"
  },
  "error": null
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "name",
      "reason": "Name is required"
    }
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 100,
      "total_pages": 5
    }
  },
  "error": null
}
```

---

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

The JWT payload contains:
- `user_id`: Unique user identifier
- `school_id`: School identifier (null for Admin)
- `role`: User role (admin, school_head, teacher, class_head, student, parent, store_house)

---

## Authentication Endpoints

> **Note:** Users are pre-seeded mock users. No registration or password reset flow exists.

---

### 1. Login

```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "teacher@school.edu.et",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 86400,
    "user": {
      "id": 10,
      "name": "Ato Haile Mariam",
      "email": "teacher@school.edu.et",
      "role": "teacher",
      "school_id": 1,
      "school_name": "Addis Ababa Secondary School"
    }
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Missing email or password
- `401 UNAUTHORIZED` - Invalid credentials

---

### 2. Get Current User

```
GET /api/v1/auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "Ato Haile Mariam",
    "email": "teacher@school.edu.et",
    "role": "teacher",
    "school_id": 1,
    "school_name": "Addis Ababa Secondary School"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` - Invalid or expired token

---

### 3. Logout

```
POST /api/v1/auth/logout
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` - Invalid or expired token

## Admin Endpoints

**Role Required:** `admin`

> **Note:** Admin operates at platform level. No school_id filtering applies.

---

### 1. Manage Schools

#### 1.1 List All Schools

```
GET /api/v1/admin/schools
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |
| status | string | No | Filter by status: `active`, `inactive`, `all` |
| search | string | No | Search by school name |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Addis Ababa Secondary School",
        "code": "AASS",
        "address": "Bole, Addis Ababa",
        "phone": "+251911234567",
        "email": "info@aass.edu.et",
        "school_head": {
          "id": 15,
          "name": "Ato Kebede Tessema",
          "phone": "+251911234567"
        },
        "status": "active",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 45,
      "total_pages": 3
    }
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` - Invalid or missing token
- `403 FORBIDDEN` - User is not an admin

---

#### 1.2 Get School Details

```
GET /api/v1/admin/schools/:school_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| school_id | integer | Yes | School identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Addis Ababa Secondary School",
    "code": "AASS",
    "address": "Bole, Addis Ababa",
    "phone": "+251911234567",
    "email": "info@aass.edu.et",
    "school_head": {
      "id": 15,
      "name": "Ato Kebede Tessema",
      "phone": "+251911234567"
    },
    "status": "active",
    "statistics": {
      "total_students": 1200,
      "total_teachers": 85,
      "total_classes": 24
    },
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` - Invalid or missing token
- `403 FORBIDDEN` - User is not an admin
- `404 NOT_FOUND` - School not found

---

#### 1.3 Create School

```
POST /api/v1/admin/schools
```

**Request Body:**
```json
{
  "name": "Addis Ababa Secondary School",
  "code": "AASS",
  "address": "Bole, Addis Ababa",
  "phone": "+251911234567",
  "email": "info@aass.edu.et",
  "school_head_id": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Addis Ababa Secondary School",
    "code": "AASS",
    "address": "Bole, Addis Ababa",
    "phone": "+251911234567",
    "email": "info@aass.edu.et",
    "school_head": {
      "id": 15,
      "name": "Ato Kebede Tessema",
      "phone": "+251911234567"
    },
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Invalid input data
- `401 UNAUTHORIZED` - Invalid or missing token
- `403 FORBIDDEN` - User is not an admin
- `409 CONFLICT` - School code already exists

---

#### 1.4 Update School

```
PUT /api/v1/admin/schools/:school_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| school_id | integer | Yes | School identifier |

**Request Body:**
```json
{
  "name": "Addis Ababa Secondary School (Updated)",
  "address": "New Address, Addis Ababa",
  "phone": "+251911234568",
  "email": "contact@aass.edu.et"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Addis Ababa Secondary School (Updated)",
    "code": "AASS",
    "address": "New Address, Addis Ababa",
    "phone": "+251911234568",
    "email": "contact@aass.edu.et",
    "status": "active",
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Invalid input data
- `401 UNAUTHORIZED` - Invalid or missing token
- `403 FORBIDDEN` - User is not an admin
- `404 NOT_FOUND` - School not found

---

#### 1.5 Delete School

```
DELETE /api/v1/admin/schools/:school_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| school_id | integer | Yes | School identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "School deleted successfully"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` - Invalid or missing token
- `403 FORBIDDEN` - User is not an admin
- `404 NOT_FOUND` - School not found
- `409 CONFLICT` - School has active data and cannot be deleted

---

### 2. Activate / Deactivate Schools

#### 2.1 Activate School

```
PATCH /api/v1/admin/schools/:school_id/activate
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| school_id | integer | Yes | School identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Addis Ababa Secondary School",
    "status": "active",
    "activated_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` - Invalid or missing token
- `403 FORBIDDEN` - User is not an admin
- `404 NOT_FOUND` - School not found
- `409 CONFLICT` - School is already active

---

#### 2.2 Deactivate School

```
PATCH /api/v1/admin/schools/:school_id/deactivate
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| school_id | integer | Yes | School identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Addis Ababa Secondary School",
    "status": "inactive",
    "deactivated_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `401 UNAUTHORIZED` - Invalid or missing token
- `403 FORBIDDEN` - User is not an admin
- `404 NOT_FOUND` - School not found
- `409 CONFLICT` - School is already inactive

---

### 3. Manage Global Promotion Criteria

> **Note:** Ethiopian secondary schools use numerical scores (total, average, rank) with promotion status (Promoted / Not Promoted). No letter grades (A, B, C, D) are used.

#### 3.1 List Promotion Criteria

```
GET /api/v1/admin/promotion-criteria
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Ethiopian Standard Promotion Criteria",
        "description": "Standard promotion criteria for Ethiopian secondary schools",
        "passing_average": 50,
        "passing_per_subject": 40,
        "max_failing_subjects": 2,
        "score_labels": [
          { "min_score": 90, "max_score": 100, "label": "Excellent" },
          { "min_score": 80, "max_score": 89, "label": "Very Good" },
          { "min_score": 60, "max_score": 79, "label": "Good" },
          { "min_score": 50, "max_score": 59, "label": "Satisfactory" },
          { "min_score": 0, "max_score": 49, "label": "Fail" }
        ],
        "is_default": true,
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 3,
      "total_pages": 1
    }
  },
  "error": null
}
```

---

#### 3.2 Get Promotion Criteria Details

```
GET /api/v1/admin/promotion-criteria/:criteria_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| criteria_id | integer | Yes | Promotion criteria identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ethiopian Standard Promotion Criteria",
    "description": "Standard promotion criteria for Ethiopian secondary schools",
    "passing_average": 50,
    "passing_per_subject": 40,
    "max_failing_subjects": 2,
    "score_labels": [
      { "min_score": 90, "max_score": 100, "label": "Excellent" },
      { "min_score": 80, "max_score": 89, "label": "Very Good" },
      { "min_score": 60, "max_score": 79, "label": "Good" },
      { "min_score": 50, "max_score": 59, "label": "Satisfactory" },
      { "min_score": 0, "max_score": 49, "label": "Fail" }
    ],
    "is_default": true,
    "schools_using": 15,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `404 NOT_FOUND` - Promotion criteria not found

---

#### 3.3 Create Promotion Criteria

```
POST /api/v1/admin/promotion-criteria
```

**Request Body:**
```json
{
  "name": "Custom Promotion Criteria",
  "description": "Custom promotion criteria for specific use",
  "passing_average": 50,
  "passing_per_subject": 40,
  "max_failing_subjects": 2,
  "score_labels": [
    { "min_score": 85, "max_score": 100, "label": "Excellent" },
    { "min_score": 70, "max_score": 84, "label": "Very Good" },
    { "min_score": 55, "max_score": 69, "label": "Good" },
    { "min_score": 45, "max_score": 54, "label": "Satisfactory" },
    { "min_score": 0, "max_score": 44, "label": "Fail" }
  ],
  "is_default": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Custom Promotion Criteria",
    "description": "Custom promotion criteria for specific use",
    "passing_average": 50,
    "passing_per_subject": 40,
    "max_failing_subjects": 2,
    "score_labels": [...],
    "is_default": false,
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Invalid score ranges (gaps or overlaps)
- `409 CONFLICT` - Promotion criteria name already exists

---

#### 3.4 Update Promotion Criteria

```
PUT /api/v1/admin/promotion-criteria/:criteria_id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| criteria_id | integer | Yes | Promotion criteria identifier |

**Request Body:**
```json
{
  "name": "Updated Promotion Criteria",
  "description": "Updated description",
  "passing_average": 50,
  "passing_per_subject": 40,
  "max_failing_subjects": 2,
  "score_labels": [
    { "min_score": 90, "max_score": 100, "label": "Excellent" },
    { "min_score": 75, "max_score": 89, "label": "Very Good" },
    { "min_score": 60, "max_score": 74, "label": "Good" },
    { "min_score": 50, "max_score": 59, "label": "Satisfactory" },
    { "min_score": 0, "max_score": 49, "label": "Fail" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Promotion Criteria",
    "description": "Updated description",
    "passing_average": 50,
    "passing_per_subject": 40,
    "max_failing_subjects": 2,
    "score_labels": [...],
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Invalid score ranges
- `404 NOT_FOUND` - Promotion criteria not found
- `409 CONFLICT` - Cannot update, criteria is in active use

---

#### 3.5 Delete Promotion Criteria

```
DELETE /api/v1/admin/promotion-criteria/:criteria_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Promotion criteria deleted successfully"
  },
  "error": null
}
```

**Error Cases:**
- `404 NOT_FOUND` - Promotion criteria not found
- `409 CONFLICT` - Cannot delete, criteria is in use by schools

---

### 4. Manage Academic Year Templates

#### 4.1 List Academic Year Templates

```
GET /api/v1/admin/academic-year-templates
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Standard Ethiopian Academic Year",
        "description": "September to June academic year template",
        "start_month": 9,
        "end_month": 6,
        "semesters": [
          {
            "name": "First Semester",
            "start_month": 9,
            "end_month": 1,
            "order": 1
          },
          {
            "name": "Second Semester",
            "start_month": 2,
            "end_month": 6,
            "order": 2
          }
        ],
        "is_default": true,
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

---

#### 4.2 Get Academic Year Template Details

```
GET /api/v1/admin/academic-year-templates/:template_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Standard Ethiopian Academic Year",
    "description": "September to June academic year template",
    "start_month": 9,
    "end_month": 6,
    "semesters": [
      {
        "id": 1,
        "name": "First Semester",
        "start_month": 9,
        "end_month": 1,
        "order": 1
      },
      {
        "id": 2,
        "name": "Second Semester",
        "start_month": 2,
        "end_month": 6,
        "order": 2
      }
    ],
    "is_default": true,
    "schools_using": 25,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

---

#### 4.3 Create Academic Year Template

```
POST /api/v1/admin/academic-year-templates
```

**Request Body:**
```json
{
  "name": "Custom Academic Year",
  "description": "Custom academic year structure",
  "start_month": 9,
  "end_month": 7,
  "semesters": [
    {
      "name": "First Semester",
      "start_month": 9,
      "end_month": 1,
      "order": 1
    },
    {
      "name": "Second Semester",
      "start_month": 2,
      "end_month": 7,
      "order": 2
    }
  ],
  "is_default": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Custom Academic Year",
    "semesters": [...],
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Invalid semester configuration

---

#### 4.4 Update Academic Year Template

```
PUT /api/v1/admin/academic-year-templates/:template_id
```

**Request Body:**
```json
{
  "name": "Updated Academic Year",
  "description": "Updated description",
  "semesters": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Academic Year",
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

---

#### 4.5 Delete Academic Year Template

```
DELETE /api/v1/admin/academic-year-templates/:template_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Academic year template deleted successfully"
  },
  "error": null
}
```

**Error Cases:**
- `404 NOT_FOUND` - Template not found
- `409 CONFLICT` - Template is in use

---

### 5. View System-Wide Statistics

#### 5.1 Get System Statistics

```
GET /api/v1/admin/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_schools": 45,
    "active_schools": 42,
    "inactive_schools": 3,
    "total_students": 54000,
    "total_teachers": 3825,
    "total_classes": 1080,
    "schools_by_status": {
      "active": 42,
      "inactive": 3
    },
    "students_by_grade": {
      "9": 15000,
      "10": 14500,
      "11": 13000,
      "12": 11500
    },
    "last_updated": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

---

#### 5.2 Get Statistics by School

```
GET /api/v1/admin/statistics/schools/:school_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "school_id": 1,
    "school_name": "Addis Ababa Secondary School",
    "total_students": 1200,
    "total_teachers": 85,
    "total_classes": 24,
    "students_by_grade": {
      "9": 350,
      "10": 320,
      "11": 280,
      "12": 250
    },
    "average_class_size": 50,
    "teacher_student_ratio": "1:14"
  },
  "error": null
}
```

---

### 6. Manage Platform Roles & Permissions

#### 6.1 List Roles

```
GET /api/v1/admin/roles
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "admin",
        "display_name": "Platform Administrator",
        "description": "Full platform access",
        "is_system_role": true,
        "permissions_count": 45
      },
      {
        "id": 2,
        "name": "school_head",
        "display_name": "School Head",
        "description": "School-level administration",
        "is_system_role": true,
        "permissions_count": 32
      }
    ]
  },
  "error": null
}
```

---

#### 6.2 Get Role Details with Permissions

```
GET /api/v1/admin/roles/:role_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "school_head",
    "display_name": "School Head",
    "description": "School-level administration",
    "is_system_role": true,
    "permissions": [
      {
        "id": 1,
        "name": "grades.manage",
        "description": "Create, update, delete grade levels"
      },
      {
        "id": 2,
        "name": "classes.manage",
        "description": "Create, update, delete classes"
      },
      {
        "id": 3,
        "name": "teachers.assign",
        "description": "Assign teachers to classes"
      }
    ]
  },
  "error": null
}
```

---

#### 6.3 List All Permissions

```
GET /api/v1/admin/permissions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "grades.manage",
        "category": "Academic Structure",
        "description": "Create, update, delete grade levels"
      },
      {
        "id": 2,
        "name": "classes.manage",
        "category": "Academic Structure",
        "description": "Create, update, delete classes"
      }
    ]
  },
  "error": null
}
```

---

#### 6.4 Update Role Permissions

```
PUT /api/v1/admin/roles/:role_id/permissions
```

**Request Body:**
```json
{
  "permission_ids": [1, 2, 3, 5, 7, 8]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "role_id": 2,
    "role_name": "school_head",
    "permissions_updated": 6,
    "updated_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Invalid permission IDs
- `403 FORBIDDEN` - Cannot modify system role permissions
- `404 NOT_FOUND` - Role not found

---

## School Head Endpoints

**Role Required:** `school_head`

> **Note:** All endpoints are scoped to the school from the JWT token.

---

### 1. Manage Grades (Grade Levels)

#### 1.1 List Grades

```
GET /api/v1/school/grades
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |
| academic_year_id | integer | No | Filter by academic year |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Grade 9",
        "level": 9,
        "description": "First year of secondary education",
        "total_classes": 6,
        "total_students": 350,
        "academic_year": {
          "id": 1,
          "name": "2023/2024"
        }
      },
      {
        "id": 2,
        "name": "Grade 10",
        "level": 10,
        "description": "Second year of secondary education",
        "total_classes": 6,
        "total_students": 320
      }
    ],
    "pagination": {...}
  },
  "error": null
}
```

---

#### 1.2 Get Grade Details

```
GET /api/v1/school/grades/:grade_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Grade 9",
    "level": 9,
    "description": "First year of secondary education",
    "classes": [
      { "id": 1, "name": "9A", "student_count": 58 },
      { "id": 2, "name": "9B", "student_count": 60 }
    ],
    "subjects": [
      { "id": 1, "name": "Mathematics", "code": "MATH" },
      { "id": 2, "name": "English", "code": "ENG" }
    ],
    "total_students": 350,
    "academic_year": {
      "id": 1,
      "name": "2023/2024"
    }
  },
  "error": null
}
```

---

#### 1.3 Create Grade

```
POST /api/v1/school/grades
```

**Request Body:**
```json
{
  "name": "Grade 9",
  "level": 9,
  "description": "First year of secondary education",
  "academic_year_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Grade 9",
    "level": 9,
    "description": "First year of secondary education",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Invalid grade level
- `409 CONFLICT` - Grade already exists for this academic year

---

#### 1.4 Update Grade

```
PUT /api/v1/school/grades/:grade_id
```

**Request Body:**
```json
{
  "name": "Grade 9 (Updated)",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Grade 9 (Updated)",
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

---

#### 1.5 Delete Grade

```
DELETE /api/v1/school/grades/:grade_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Grade deleted successfully"
  },
  "error": null
}
```

**Error Cases:**
- `409 CONFLICT` - Grade has classes or students assigned

---

### 2. Manage Classes Under Grades

#### 2.1 List Classes

```
GET /api/v1/school/grades/:grade_id/classes
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number |
| limit | integer | No | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "9A",
        "grade_id": 1,
        "grade_name": "Grade 9",
        "class_head": {
          "id": 15,
          "name": "Ato Kebede Tessema"
        },
        "student_count": 58,
        "capacity": 60
      }
    ],
    "pagination": {...}
  },
  "error": null
}
```

---

#### 2.2 Get Class Details

```
GET /api/v1/school/classes/:class_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "9A",
    "grade": {
      "id": 1,
      "name": "Grade 9",
      "level": 9
    },
    "class_head": {
      "id": 15,
      "name": "Ato Kebede Tessema",
      "phone": "+251911234567"
    },
    "student_count": 58,
    "capacity": 60,
    "teacher_assignments": [
      {
        "teacher_id": 10,
        "teacher_name": "Ato Haile Mariam",
        "subject_id": 1,
        "subject_name": "Mathematics"
      }
    ]
  },
  "error": null
}
```

---

#### 2.3 Create Class

```
POST /api/v1/school/grades/:grade_id/classes
```

**Request Body:**
```json
{
  "name": "9A",
  "capacity": 60,
  "class_head_id": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "9A",
    "grade_id": 1,
    "capacity": 60,
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Invalid class name or capacity
- `409 CONFLICT` - Class name already exists for this grade

---

#### 2.4 Update Class

```
PUT /api/v1/school/classes/:class_id
```

**Request Body:**
```json
{
  "name": "9A",
  "capacity": 65,
  "class_head_id": 16
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "9A",
    "capacity": 65,
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

---

#### 2.5 Delete Class

```
DELETE /api/v1/school/classes/:class_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Class deleted successfully"
  },
  "error": null
}
```

**Error Cases:**
- `409 CONFLICT` - Class has students enrolled

---

### 3. Define Subjects Per Grade

#### 3.1 List Subjects for Grade

```
GET /api/v1/school/grades/:grade_id/subjects
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Mathematics",
        "code": "MATH",
        "credit_hours": 5,
        "is_required": true,
        "description": "Core mathematics curriculum"
      },
      {
        "id": 2,
        "name": "English",
        "code": "ENG",
        "credit_hours": 4,
        "is_required": true
      }
    ]
  },
  "error": null
}
```

---

#### 3.2 Add Subject to Grade

```
POST /api/v1/school/grades/:grade_id/subjects
```

**Request Body:**
```json
{
  "name": "Physics",
  "code": "PHY",
  "credit_hours": 4,
  "is_required": true,
  "description": "Introduction to physics"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Physics",
    "code": "PHY",
    "grade_id": 1,
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

---

#### 3.3 Update Subject

```
PUT /api/v1/school/grades/:grade_id/subjects/:subject_id
```

**Request Body:**
```json
{
  "name": "Physics",
  "credit_hours": 5,
  "description": "Updated physics curriculum"
}
```

---

#### 3.4 Remove Subject from Grade

```
DELETE /api/v1/school/grades/:grade_id/subjects/:subject_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Subject removed from grade successfully"
  },
  "error": null
}
```

**Error Cases:**
- `409 CONFLICT` - Subject has grades recorded

---

### 4. Define Assessment Types

#### 4.1 List Assessment Types

```
GET /api/v1/school/assessment-types
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Mid-Term Exam",
        "code": "MID",
        "description": "Mid-semester examination",
        "default_weight_percent": 30,
        "is_active": true
      },
      {
        "id": 2,
        "name": "Final Exam",
        "code": "FINAL",
        "description": "End of semester examination",
        "default_weight_percent": 40,
        "is_active": true
      },
      {
        "id": 3,
        "name": "Quiz",
        "code": "QUIZ",
        "description": "Short quiz assessment",
        "default_weight_percent": 15,
        "is_active": true
      },
      {
        "id": 4,
        "name": "Assignment",
        "code": "ASSIGN",
        "description": "Homework or project assignment",
        "default_weight_percent": 15,
        "is_active": true
      }
    ]
  },
  "error": null
}
```

---

#### 4.2 Create Assessment Type

```
POST /api/v1/school/assessment-types
```

**Request Body:**
```json
{
  "name": "Class Test",
  "code": "TEST",
  "description": "Regular class test",
  "default_weight_percent": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Class Test",
    "code": "TEST",
    "default_weight_percent": 10,
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

---

#### 4.3 Update Assessment Type

```
PUT /api/v1/school/assessment-types/:type_id
```

**Request Body:**
```json
{
  "name": "Class Test (Updated)",
  "description": "Updated description",
  "default_weight_percent": 12
}
```

---

#### 4.4 Delete Assessment Type

```
DELETE /api/v1/school/assessment-types/:type_id
```

**Error Cases:**
- `409 CONFLICT` - Assessment type is used in weight templates

---

### 5. Define Assessment Weight Templates

#### 5.1 List Weight Templates

```
GET /api/v1/school/weight-templates
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| grade_id | integer | No | Filter by grade |
| subject_id | integer | No | Filter by subject |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Standard Weight Template",
        "description": "Default weight distribution",
        "weights": [
          { "assessment_type_id": 1, "assessment_type_name": "Mid-Term Exam", "weight_percent": 30 },
          { "assessment_type_id": 2, "assessment_type_name": "Final Exam", "weight_percent": 40 },
          { "assessment_type_id": 3, "assessment_type_name": "Quiz", "weight_percent": 15 },
          { "assessment_type_id": 4, "assessment_type_name": "Assignment", "weight_percent": 15 }
        ],
        "total_weight": 100,
        "applicable_grades": [9, 10, 11, 12],
        "is_default": true
      }
    ]
  },
  "error": null
}
```

---

#### 5.2 Get Weight Template Details

```
GET /api/v1/school/weight-templates/:template_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Standard Weight Template",
    "description": "Default weight distribution",
    "weights": [
      { "assessment_type_id": 1, "assessment_type_name": "Mid-Term Exam", "weight_percent": 30, "max_score": 100 },
      { "assessment_type_id": 2, "assessment_type_name": "Final Exam", "weight_percent": 40, "max_score": 100 },
      { "assessment_type_id": 3, "assessment_type_name": "Quiz", "weight_percent": 15, "max_score": 50 },
      { "assessment_type_id": 4, "assessment_type_name": "Assignment", "weight_percent": 15, "max_score": 100 }
    ],
    "applicable_grades": [
      { "id": 1, "name": "Grade 9" },
      { "id": 2, "name": "Grade 10" }
    ],
    "applicable_subjects": null,
    "is_default": true
  },
  "error": null
}
```

---

#### 5.3 Create Weight Template

```
POST /api/v1/school/weight-templates
```

**Request Body:**
```json
{
  "name": "Science Subject Template",
  "description": "Weight template for science subjects",
  "weights": [
    { "assessment_type_id": 1, "weight_percent": 25, "max_score": 100 },
    { "assessment_type_id": 2, "weight_percent": 35, "max_score": 100 },
    { "assessment_type_id": 3, "weight_percent": 20, "max_score": 50 },
    { "assessment_type_id": 4, "weight_percent": 20, "max_score": 100 }
  ],
  "applicable_grade_ids": [1, 2, 3, 4],
  "applicable_subject_ids": [3, 4, 5],
  "is_default": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Science Subject Template",
    "weights": [...],
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Weights do not sum to 100%

---

#### 5.4 Update Weight Template

```
PUT /api/v1/school/weight-templates/:template_id
```

**Request Body:**
```json
{
  "name": "Updated Template",
  "weights": [
    { "assessment_type_id": 1, "weight_percent": 30, "max_score": 100 },
    { "assessment_type_id": 2, "weight_percent": 40, "max_score": 100 },
    { "assessment_type_id": 3, "weight_percent": 15, "max_score": 50 },
    { "assessment_type_id": 4, "weight_percent": 15, "max_score": 100 }
  ]
}
```

---

#### 5.5 Delete Weight Template

```
DELETE /api/v1/school/weight-templates/:template_id
```

**Error Cases:**
- `409 CONFLICT` - Template is actively used

---

### 6. Assign Class Heads

#### 6.1 Assign Class Head to Class

```
POST /api/v1/school/classes/:class_id/class-head
```

**Request Body:**
```json
{
  "teacher_id": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "class_id": 1,
    "class_name": "9A",
    "class_head": {
      "id": 15,
      "name": "Ato Kebede Tessema",
      "email": "kebede@school.edu.et"
    },
    "assigned_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Teacher not found
- `409 CONFLICT` - Teacher is already class head of another class

---

#### 6.2 Remove Class Head from Class

```
DELETE /api/v1/school/classes/:class_id/class-head
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Class head removed successfully"
  },
  "error": null
}
```

---

### 7. Assign Teachers to Classes & Subjects

#### 7.1 List Teaching Assignments

```
GET /api/v1/school/teaching-assignments
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| teacher_id | integer | No | Filter by teacher |
| class_id | integer | No | Filter by class |
| subject_id | integer | No | Filter by subject |
| grade_id | integer | No | Filter by grade |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "teacher": {
          "id": 10,
          "name": "Ato Haile Mariam"
        },
        "class": {
          "id": 1,
          "name": "9A",
          "grade_name": "Grade 9"
        },
        "subject": {
          "id": 1,
          "name": "Mathematics"
        },
        "academic_year": "2023/2024",
        "assigned_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {...}
  },
  "error": null
}
```

---

#### 7.2 Create Teaching Assignment

```
POST /api/v1/school/teaching-assignments
```

**Request Body:**
```json
{
  "teacher_id": 10,
  "class_id": 1,
  "subject_id": 1,
  "academic_year_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "teacher_id": 10,
    "class_id": 1,
    "subject_id": 1,
    "assigned_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Teacher, class, or subject not found
- `409 CONFLICT` - Assignment already exists

---

#### 7.3 Update Teaching Assignment

```
PUT /api/v1/school/teaching-assignments/:assignment_id
```

**Request Body:**
```json
{
  "teacher_id": 11
}
```

---

#### 7.4 Delete Teaching Assignment

```
DELETE /api/v1/school/teaching-assignments/:assignment_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Teaching assignment removed successfully"
  },
  "error": null
}
```

---

### 8. View Class Average Reports

```
GET /api/v1/school/reports/class-averages
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| grade_id | integer | No | Filter by grade |
| class_id | integer | No | Filter by specific class |
| semester_id | integer | Yes | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "class_id": 1,
        "class_name": "9A",
        "grade_name": "Grade 9",
        "student_count": 58,
        "class_average": 72.5,
        "subject_averages": [
          { "subject_name": "Mathematics", "average": 68.3 },
          { "subject_name": "English", "average": 75.2 },
          { "subject_name": "Physics", "average": 71.8 }
        ],
        "highest_average": 92.5,
        "lowest_average": 45.2
      }
    ],
    "semester": {
      "id": 1,
      "name": "First Semester"
    },
    "academic_year": "2023/2024"
  },
  "error": null
}
```

---

### 9. View Class Ranking Reports

```
GET /api/v1/school/reports/class-rankings
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| grade_id | integer | No | Filter by grade |
| semester_id | integer | Yes | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "rank": 1,
        "class_id": 3,
        "class_name": "9C",
        "grade_name": "Grade 9",
        "class_average": 78.5,
        "student_count": 55
      },
      {
        "rank": 2,
        "class_id": 1,
        "class_name": "9A",
        "grade_name": "Grade 9",
        "class_average": 75.2,
        "student_count": 58
      }
    ],
    "semester": "First Semester",
    "academic_year": "2023/2024"
  },
  "error": null
}
```

---

### 10. Lock / Unlock Grading Periods

#### 10.1 Get Grading Period Status

```
GET /api/v1/school/grading-periods
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| academic_year_id | integer | Yes | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "semester": {
          "id": 1,
          "name": "First Semester"
        },
        "academic_year": "2023/2024",
        "start_date": "2023-09-11",
        "end_date": "2024-01-31",
        "grade_entry_start": "2024-01-15",
        "grade_entry_end": "2024-02-05",
        "status": "open",
        "locked_at": null,
        "locked_by": null
      }
    ]
  },
  "error": null
}
```

---

#### 10.2 Lock Grading Period

```
PATCH /api/v1/school/grading-periods/:period_id/lock
```

**Request Body:**
```json
{
  "reason": "Semester grades finalized"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "locked",
    "locked_at": "2024-02-05T10:00:00Z",
    "locked_by": {
      "id": 5,
      "name": "School Head Name"
    },
    "reason": "Semester grades finalized"
  },
  "error": null
}
```

**Error Cases:**
- `409 CONFLICT` - Period is already locked
- `400 VALIDATION_ERROR` - Pending grade submissions exist

---

#### 10.3 Unlock Grading Period

```
PATCH /api/v1/school/grading-periods/:period_id/unlock
```

**Request Body:**
```json
{
  "reason": "Reopening for grade corrections"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "open",
    "unlocked_at": "2024-02-06T10:00:00Z",
    "reason": "Reopening for grade corrections"
  },
  "error": null
}
```

---

### 11. View School-Wide Performance Summaries

```
GET /api/v1/school/reports/performance-summary
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | No | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "academic_year": "2023/2024",
    "semester": "First Semester",
    "overall_average": 71.5,
    "total_students": 1200,
    "pass_rate": 87.5,
    "fail_rate": 12.5,
    "score_distribution": {
      "90_100": { "count": 145, "percentage": 12.1, "label": "Excellent" },
      "80_89": { "count": 312, "percentage": 26.0, "label": "Very Good" },
      "60_79": { "count": 438, "percentage": 36.5, "label": "Good" },
      "50_59": { "count": 155, "percentage": 12.9, "label": "Satisfactory" },
      "below_50": { "count": 150, "percentage": 12.5, "label": "Fail" }
    },
    "performance_by_grade": [
      { "grade_name": "Grade 9", "average": 70.2, "student_count": 350 },
      { "grade_name": "Grade 10", "average": 72.1, "student_count": 320 },
      { "grade_name": "Grade 11", "average": 71.8, "student_count": 280 },
      { "grade_name": "Grade 12", "average": 72.0, "student_count": 250 }
    ],
    "top_performing_subjects": [
      { "subject_name": "English", "average": 76.5 },
      { "subject_name": "Civics", "average": 75.2 }
    ],
    "lowest_performing_subjects": [
      { "subject_name": "Mathematics", "average": 65.3 },
      { "subject_name": "Physics", "average": 67.1 }
    ]
  },
  "error": null
}
```

---

## Teacher Endpoints

**Role Required:** `teacher`

> **Note:** Teachers can only access classes and subjects assigned to them.

---

### 1. View Assigned Classes

```
GET /api/v1/teacher/classes
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| academic_year_id | integer | No | Filter by academic year |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "class_id": 1,
        "class_name": "9A",
        "grade": {
          "id": 1,
          "name": "Grade 9",
          "level": 9
        },
        "subjects": [
          {
            "id": 1,
            "name": "Mathematics",
            "code": "MATH"
          }
        ],
        "student_count": 58
      },
      {
        "class_id": 2,
        "class_name": "9B",
        "grade": {
          "id": 1,
          "name": "Grade 9",
          "level": 9
        },
        "subjects": [
          {
            "id": 1,
            "name": "Mathematics",
            "code": "MATH"
          }
        ],
        "student_count": 60
      }
    ]
  },
  "error": null
}
```

---

### 2. View Assigned Subjects

```
GET /api/v1/teacher/subjects
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| academic_year_id | integer | No | Filter by academic year |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "subject_id": 1,
        "subject_name": "Mathematics",
        "subject_code": "MATH",
        "assigned_classes": [
          { "class_id": 1, "class_name": "9A", "grade_name": "Grade 9" },
          { "class_id": 2, "class_name": "9B", "grade_name": "Grade 9" },
          { "class_id": 7, "class_name": "10A", "grade_name": "Grade 10" }
        ],
        "total_students": 176
      }
    ]
  },
  "error": null
}
```

---

### 3. Assessment Weights (Teacher-Defined)

> **Note:** Teachers can set assessment weights per class and subject. Suggestions come from School Head default weights.

#### 3.1 Get Suggested Weights

```
GET /api/v1/teacher/assessment-weights/suggestions
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| class_id | integer | Yes | Class identifier |
| subject_id | integer | Yes | Subject identifier |
| semester_id | integer | Yes | Semester identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "class_id": 1,
    "subject_id": 1,
    "semester_id": 1,
    "suggested_weights": [
      { "assessment_type_id": 1, "assessment_type_name": "Mid-Term Exam", "weight_percent": 30 },
      { "assessment_type_id": 2, "assessment_type_name": "Final Exam", "weight_percent": 40 },
      { "assessment_type_id": 3, "assessment_type_name": "Quiz", "weight_percent": 15 },
      { "assessment_type_id": 4, "assessment_type_name": "Assignment", "weight_percent": 15 }
    ]
  },
  "error": null
}
```

---

#### 3.2 Set Assessment Weights

```
POST /api/v1/teacher/assessment-weights
```

**Request Body:**
```json
{
  "class_id": 1,
  "subject_id": 1,
  "semester_id": 1,
  "weights": [
    { "assessment_type_id": 1, "weight_percent": 25 },
    { "assessment_type_id": 2, "weight_percent": 35 },
    { "assessment_type_id": 3, "weight_percent": 20 },
    { "assessment_type_id": 4, "weight_percent": 20 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "class_id": 1,
    "subject_id": 1,
    "semester_id": 1,
    "weights": [
      { "assessment_type_id": 1, "weight_percent": 25 },
      { "assessment_type_id": 2, "weight_percent": 35 },
      { "assessment_type_id": 3, "weight_percent": 20 },
      { "assessment_type_id": 4, "weight_percent": 20 }
    ],
    "saved_at": "2024-01-15T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Weights do not sum to 100
- `403 FORBIDDEN` - Teacher not assigned to this class/subject

---

#### 3.3 Get Current Assessment Weights

```
GET /api/v1/teacher/assessment-weights
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| class_id | integer | Yes | Class identifier |
| subject_id | integer | Yes | Subject identifier |
| semester_id | integer | Yes | Semester identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "class_id": 1,
    "subject_id": 1,
    "semester_id": 1,
    "weights": [
      { "assessment_type_id": 1, "weight_percent": 25 },
      { "assessment_type_id": 2, "weight_percent": 35 },
      { "assessment_type_id": 3, "weight_percent": 20 },
      { "assessment_type_id": 4, "weight_percent": 20 }
    ],
    "source": "teacher_defined"
  },
  "error": null
}
```

---

### 4. View Student List Per Class

```
GET /api/v1/teacher/classes/:class_id/students
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| subject_id | integer | Yes | Subject identifier |
| page | integer | No | Page number |
| limit | integer | No | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "class": {
      "id": 1,
      "name": "9A",
      "grade_name": "Grade 9"
    },
    "subject": {
      "id": 1,
      "name": "Mathematics"
    },
    "items": [
      {
        "student_id": 101,
        "student_code": "STU2024001",
        "full_name": "Abebe Kebede",
        "gender": "M",
        "has_grades": true
      },
      {
        "student_id": 102,
        "student_code": "STU2024002",
        "full_name": "Almaz Tadesse",
        "gender": "F",
        "has_grades": false
      }
    ],
    "pagination": {...}
  },
  "error": null
}
```

**Error Cases:**
- `403 FORBIDDEN` - Teacher not assigned to this class/subject

---

### 5. Manage Student Grades

#### 4.1 List Student Grades

```
GET /api/v1/teacher/classes/:class_id/subjects/:subject_id/grades
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | Yes | Semester identifier |
| assessment_type_id | integer | No | Filter by assessment type |

**Response:**
```json
{
  "success": true,
  "data": {
    "class": {
      "id": 1,
      "name": "9A"
    },
    "subject": {
      "id": 1,
      "name": "Mathematics"
    },
    "semester": {
      "id": 1,
      "name": "First Semester"
    },
    "weight_template": {
      "id": 1,
      "name": "Standard Weight Template"
    },
    "items": [
      {
        "student_id": 101,
        "student_name": "Abebe Kebede",
        "grades": [
          {
            "id": 1,
            "assessment_type_id": 1,
            "assessment_type_name": "Mid-Term Exam",
            "score": 75,
            "max_score": 100,
            "weight_percent": 30,
            "weighted_score": 22.5,
            "entered_at": "2024-01-10T10:00:00Z"
          },
          {
            "id": 2,
            "assessment_type_id": 3,
            "assessment_type_name": "Quiz",
            "score": 42,
            "max_score": 50,
            "weight_percent": 15,
            "weighted_score": 12.6,
            "entered_at": "2024-01-12T10:00:00Z"
          }
        ],
        "total_weighted_score": 35.1,
        "computed_average": null,
        "submission_status": "draft"
      }
    ]
  },
  "error": null
}
```

---

#### 4.2 Enter/Update Student Grade

```
POST /api/v1/teacher/grades
```

**Request Body:**
```json
{
  "student_id": 101,
  "class_id": 1,
  "subject_id": 1,
  "semester_id": 1,
  "assessment_type_id": 1,
  "score": 78,
  "max_score": 100,
  "remarks": "Good improvement"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "student_id": 101,
    "student_name": "Abebe Kebede",
    "assessment_type": "Mid-Term Exam",
    "score": 78,
    "max_score": 100,
    "weight_percent": 30,
    "weighted_score": 23.4,
    "entered_at": "2024-01-15T10:00:00Z",
    "entered_by": {
      "id": 10,
      "name": "Teacher Name"
    }
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Invalid score (negative or exceeds max)
- `403 FORBIDDEN` - Teacher not assigned to this class/subject
- `409 CONFLICT` - Grading period is locked
- `409 CONFLICT` - Grades already submitted for approval

---

#### 4.3 Bulk Enter Grades

```
POST /api/v1/teacher/grades/bulk
```

**Request Body:**
```json
{
  "class_id": 1,
  "subject_id": 1,
  "semester_id": 1,
  "assessment_type_id": 1,
  "max_score": 100,
  "grades": [
    { "student_id": 101, "score": 78 },
    { "student_id": 102, "score": 85 },
    { "student_id": 103, "score": 62 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_entered": 3,
    "successful": 3,
    "failed": 0,
    "results": [
      { "student_id": 101, "status": "success", "grade_id": 1 },
      { "student_id": 102, "status": "success", "grade_id": 2 },
      { "student_id": 103, "status": "success", "grade_id": 3 }
    ]
  },
  "error": null
}
```

---

#### 4.4 Update Grade

```
PUT /api/v1/teacher/grades/:grade_id
```

**Request Body:**
```json
{
  "score": 80,
  "remarks": "Updated after review"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "score": 80,
    "weighted_score": 24.0,
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `403 FORBIDDEN` - Grade was not entered by this teacher
- `409 CONFLICT` - Grade already submitted for approval

---

#### 4.5 Delete Grade

```
DELETE /api/v1/teacher/grades/:grade_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Grade deleted successfully"
  },
  "error": null
}
```

**Error Cases:**
- `403 FORBIDDEN` - Grade was not entered by this teacher
- `409 CONFLICT` - Grade already submitted for approval

---

### 6. Submit Grades for Approval

#### 5.1 Submit Grades

```
POST /api/v1/teacher/classes/:class_id/subjects/:subject_id/submit
```

**Request Body:**
```json
{
  "semester_id": 1,
  "remarks": "All grades entered for first semester"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": 1,
    "class_id": 1,
    "class_name": "9A",
    "subject_id": 1,
    "subject_name": "Mathematics",
    "semester": "First Semester",
    "total_students": 58,
    "students_with_complete_grades": 58,
    "status": "submitted",
    "submitted_at": "2024-01-20T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Incomplete grades (students missing scores)
- `409 CONFLICT` - Already submitted

---

### 7. View Submission Status

```
GET /api/v1/teacher/submissions
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | Yes | Semester identifier |
| academic_year_id | integer | No | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "submission_id": 1,
        "class": {
          "id": 1,
          "name": "9A"
        },
        "subject": {
          "id": 1,
          "name": "Mathematics"
        },
        "semester": "First Semester",
        "status": "submitted",
        "submitted_at": "2024-01-20T10:00:00Z",
        "reviewed_at": null,
        "reviewed_by": null
      },
      {
        "submission_id": null,
        "class": {
          "id": 2,
          "name": "9B"
        },
        "subject": {
          "id": 1,
          "name": "Mathematics"
        },
        "semester": "First Semester",
        "status": "draft",
        "students_graded": 45,
        "total_students": 60
      }
    ]
  },
  "error": null
}
```

---

### 8. View Computed Averages (Read-Only)

```
GET /api/v1/teacher/classes/:class_id/subjects/:subject_id/averages
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | Yes | Semester identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "class": {
      "id": 1,
      "name": "9A"
    },
    "subject": {
      "id": 1,
      "name": "Mathematics"
    },
    "semester": "First Semester",
    "class_average": 68.5,
    "highest_score": 95.2,
    "lowest_score": 42.0,
    "students": [
      {
        "student_id": 101,
        "student_name": "Abebe Kebede",
        "score": 72.5,
        "rank_in_subject": 15
      }
    ]
  },
  "error": null
}
```

---

## Class Head Endpoints

**Role Required:** `class_head`

> **Note:** Class heads can only access their assigned class.
> **Note:** A Class Head is also a subject teacher. Therefore, Class Head users can access all Teacher endpoints (assigned classes/subjects, assessment weights, student list, grade management, submission status, computed averages) in addition to Class Head endpoints below.

---

### Class Head – Teacher Permissions (Inherited)

A Class Head can access all Teacher endpoints, including:

- View Assigned Classes
- View Assigned Subjects
- Assessment Weights (Teacher-Defined)
- View Student List Per Class
- Manage Student Grades
- Submit Grades for Approval
- View Submission Status
- View Computed Averages (Read-Only)

---

### 1. View Students in Class

```
GET /api/v1/class-head/students
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number |
| limit | integer | No | Items per page |
| search | string | No | Search by student name |

**Response:**
```json
{
  "success": true,
  "data": {
    "class": {
      "id": 1,
      "name": "9A",
      "grade_name": "Grade 9"
    },
    "items": [
      {
        "student_id": 101,
        "student_code": "STU2024001",
        "full_name": "Abebe Kebede",
        "gender": "M",
        "parent_contact": "+251911234567",
        "enrollment_date": "2023-09-01"
      }
    ],
    "pagination": {...}
  },
  "error": null
}
```

---

### 2. View Subject Submission Checklist

```
GET /api/v1/class-head/submissions/checklist
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | Yes | Semester identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "class": {
      "id": 1,
      "name": "9A"
    },
    "semester": "First Semester",
    "total_subjects": 8,
    "submitted_count": 5,
    "pending_count": 3,
    "subjects": [
      {
        "subject_id": 1,
        "subject_name": "Mathematics",
        "teacher": {
          "id": 10,
          "name": "Ato Haile Mariam"
        },
        "status": "submitted",
        "submitted_at": "2024-01-20T10:00:00Z",
        "students_graded": 58,
        "total_students": 58
      },
      {
        "subject_id": 2,
        "subject_name": "English",
        "teacher": {
          "id": 11,
          "name": "W/ro Tigist Bekele"
        },
        "status": "pending",
        "submitted_at": null,
        "students_graded": 45,
        "total_students": 58
      }
    ]
  },
  "error": null
}
```

---

### 3. View Computed Averages & Rankings

```
GET /api/v1/class-head/students/rankings
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | Yes | Semester identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "class": {
      "id": 1,
      "name": "9A"
    },
    "semester": "First Semester",
    "class_average": 71.5,
    "items": [
      {
        "rank": 1,
        "student_id": 105,
        "student_name": "Sara Tesfaye",
        "total": 740,
        "average": 92.5,
        "subjects_count": 8,
        "remark": "Promoted"
      },
      {
        "rank": 2,
        "student_id": 112,
        "student_name": "Daniel Hailu",
        "total": 714,
        "average": 89.25,
        "subjects_count": 8,
        "remark": "Promoted"
      }
    ]
  },
  "error": null
}
```

---

### 4. Review Submitted Grades

#### 4.1 View Submitted Grades for Review

```
GET /api/v1/class-head/submissions/:submission_id/review
```

> **Note:** Class Head views only the final subject score (out of 100) per student. Assessment-level details are not exposed.

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": 1,
    "subject": {
      "id": 1,
      "name": "Mathematics"
    },
    "teacher": {
      "id": 10,
      "name": "Ato Haile Mariam"
    },
    "submitted_at": "2024-01-20T10:00:00Z",
    "status": "submitted",
    "students": [
      {
        "student_id": 101,
        "student_name": "Abebe Kebede",
        "subject_score": 79.6
      }
    ],
    "class_statistics": {
      "average": 68.5,
      "highest": 95.2,
      "lowest": 42.0,
      "pass_count": 52,
      "fail_count": 6
    }
  },
  "error": null
}
```

---

#### 4.2 Approve Submission

```
POST /api/v1/class-head/submissions/:submission_id/approve
```

**Request Body:**
```json
{
  "remarks": "Grades verified and approved"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": 1,
    "status": "approved",
    "approved_at": "2024-01-22T10:00:00Z",
    "approved_by": {
      "id": 15,
      "name": "Class Head Name"
    }
  },
  "error": null
}
```

---

#### 4.3 Reject Submission (Request Revision)

```
POST /api/v1/class-head/submissions/:submission_id/reject
```

**Request Body:**
```json
{
  "reason": "Please verify student ID 105 grades - seems incorrect"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": 1,
    "status": "revision_requested",
    "rejected_at": "2024-01-22T10:00:00Z",
    "reason": "Please verify student ID 105 grades - seems incorrect"
  },
  "error": null
}
```

---

### 5. Trigger Final Grade Compilation

```
POST /api/v1/class-head/compile-grades
```

**Request Body:**
```json
{
  "semester_id": 1,
  "academic_year_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "class_id": 1,
    "class_name": "9A",
    "semester": "First Semester",
    "compilation_status": "completed",
    "total_students": 58,
    "students_compiled": 58,
    "class_average": 71.5,
    "compiled_at": "2024-01-25T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Not all subjects have approved submissions
- `409 CONFLICT` - Grades already compiled for this period

---

### 6. View Class Performance Snapshot (Combined Scores Only)

```
GET /api/v1/class-head/reports/class-snapshot
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | Yes | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "class": {
      "id": 1,
      "name": "9A"
    },
    "semester": "First Semester",
    "subjects": ["Math", "Science", "English", "History"],
    "items": [
      {
        "rank": 1,
        "student_id": 101,
        "student_name": "Alice Brown",
        "subject_scores": {
          "Math": 95,
          "Science": 88,
          "English": 96,
          "History": 90
        },
        "total": 369,
        "average": 92.25
      }
    ]
  },
  "error": null
}
```

---

### 7. Publish Final Semester Results

```
POST /api/v1/class-head/publish/semester
```

**Request Body:**
```json
{
  "semester_id": 1,
  "academic_year_id": 1,
  "notify_students": true,
  "notify_parents": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "publication_id": 1,
    "class_id": 1,
    "class_name": "9A",
    "semester": "First Semester",
    "academic_year": "2023/2024",
    "students_published": 58,
    "published_at": "2024-01-26T10:00:00Z",
    "notifications_sent": {
      "students": 58,
      "parents": 55
    }
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Grades not yet compiled
- `409 CONFLICT` - Results already published

---

### 8. Publish Year Results

```
POST /api/v1/class-head/publish/year
```

**Request Body:**
```json
{
  "academic_year_id": 1,
  "notify_students": true,
  "notify_parents": true,
  "send_to_store_house": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "publication_id": 2,
    "class_id": 1,
    "class_name": "9A",
    "academic_year": "2023/2024",
    "semesters_included": ["First Semester", "Second Semester"],
    "students_published": 58,
    "published_at": "2024-06-20T10:00:00Z",
    "sent_to_store_house": true,
    "notifications_sent": {
      "students": 58,
      "parents": 55
    }
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Not all semesters are finalized

---

### 9. Generate Student Final Reports

#### 8.1 Generate Single Student Report

```
GET /api/v1/class-head/reports/student/:student_id
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | No | For semester report |
| academic_year_id | integer | Yes | Academic year |
| type | string | Yes | `semester` or `year` |
| format | string | No | `json` or `pdf` (default: json) |

**Response (JSON format):**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 101,
      "code": "STU2024001",
      "name": "Abebe Kebede",
      "gender": "M",
      "class_name": "9A",
      "grade_name": "Grade 9"
    },
    "report_type": "semester",
    "semester": "First Semester",
    "academic_year": "2023/2024",
    "subjects": [
      {
        "name": "Mathematics",
        "assessments": [
          { "type": "Mid-Term Exam", "score": 78, "max": 100 },
          { "type": "Final Exam", "score": 82, "max": 100 },
          { "type": "Quiz", "score": 42, "max": 50 },
          { "type": "Assignment", "score": 88, "max": 100 }
        ],
        "subject_total": 290,
        "subject_average": 79.6,
        "teacher_name": "Ato Haile Mariam"
      }
    ],
    "summary": {
      "total": 602,
      "average": 75.2,
      "total_subjects": 8,
      "rank_in_class": 12,
      "total_students": 58,
      "remark": "Promoted",
      "conduct": "Very Good",
      "attendance_percentage": 95.5
    },
    "class_head_remarks": "Good performance. Keep it up!",
    "generated_at": "2024-01-27T10:00:00Z"
  },
  "error": null
}
```

**Response (PDF format):**
```json
{
  "success": true,
  "data": {
    "download_url": "/api/v1/downloads/reports/abc123.pdf",
    "expires_at": "2024-01-28T10:00:00Z"
  },
  "error": null
}
```

---

#### 8.2 Generate Bulk Reports (All Students)

```
POST /api/v1/class-head/reports/bulk
```

**Request Body:**
```json
{
  "semester_id": 1,
  "academic_year_id": 1,
  "type": "semester",
  "format": "pdf"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "bulk-report-123",
    "status": "processing",
    "total_students": 58,
    "estimated_completion": "2024-01-27T10:05:00Z"
  },
  "error": null
}
```

---

#### 8.3 Check Bulk Report Status

```
GET /api/v1/class-head/reports/bulk/:job_id/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "bulk-report-123",
    "status": "completed",
    "total_students": 58,
    "reports_generated": 58,
    "download_url": "/api/v1/downloads/bulk-reports/bulk-report-123.zip",
    "expires_at": "2024-01-30T10:00:00Z",
    "completed_at": "2024-01-27T10:03:00Z"
  },
  "error": null
}
```

---

### 10. Send Final Reports to Students

```
POST /api/v1/class-head/reports/send/students
```

**Request Body:**
```json
{
  "semester_id": 1,
  "academic_year_id": 1,
  "type": "semester",
  "student_ids": [101, 102, 103]
}
```

> **Note:** Omit `student_ids` to send to all students.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_sent": 3,
    "successful": 3,
    "failed": 0,
    "sent_at": "2024-01-27T10:00:00Z"
  },
  "error": null
}
```

---

### 11. Send Final Reports to Parents

```
POST /api/v1/class-head/reports/send/parents
```

**Request Body:**
```json
{
  "semester_id": 1,
  "academic_year_id": 1,
  "type": "semester",
  "student_ids": [101, 102, 103]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_sent": 3,
    "successful": 3,
    "failed": 0,
    "sent_at": "2024-01-27T10:00:00Z"
  },
  "error": null
}
```

---

### 12. Send Roster Data to Store House

```
POST /api/v1/class-head/store-house/send-roster
```

**Request Body:**
```json
{
  "academic_year_id": 1,
  "semester_id": 1,
  "roster": {
    "class_id": 1,
    "class_name": "9A",
    "grade_name": "Grade 9",
    "class_head": {
      "id": 15,
      "name": "Ato Kebede Tessema",
      "phone": "+251911234567"
    },
    "students": [
      {
        "student_id": 101,
        "name": "Abarruu Masqalli Gabbisaa",
        "sex": "F",
        "age": 8,
        "semester": 1,
        "subject_scores": {
          "Afaan Oromoo": 71,
          "English": 34,
          "Mathematics": 60,
          "Science": 67
        },
        "total": 494,
        "average": 61.8,
        "rank": 14,
        "absent_days": 2,
        "conduct": "Good",
        "remark": "Promoted"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transfer_id": "roster-transfer-456",
    "roster_id": 1,
    "class_id": 1,
    "class_name": "9A",
    "academic_year": "2023/2024",
    "semester": "First Semester",
    "students_transferred": 58,
    "transferred_at": "2024-06-25T10:00:00Z",
    "received_by": "Store House"
  },
  "error": null
}
```

---

## Student Endpoints

**Role Required:** `student`

> **Note:** Students can only view their own academic data.

---

### 1. View Semester Grade Report

```
GET /api/v1/student/reports/semester
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | Yes | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 101,
      "code": "STU2024001",
      "name": "Abebe Kebede",
      "class_name": "9A",
      "grade_name": "Grade 9"
    },
    "semester": "First Semester",
    "academic_year": "2023/2024",
    "subjects": [
      {
        "name": "Mathematics",
        "score": 79.6
      },
      {
        "name": "English",
        "score": 85.2
      }
    ],
    "summary": {
      "total": 602,
      "average": 75.2,
      "rank_in_class": 12,
      "total_students": 58,
      "remark": "Promoted"
    },
    "status": "published",
    "published_at": "2024-01-26T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `404 NOT_FOUND` - Report not yet published

---

### 2. View Year Grade Report

```
GET /api/v1/student/reports/year
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| academic_year_id | integer | Yes | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 101,
      "code": "STU2024001",
      "name": "Abebe Kebede",
      "class_name": "9A",
      "grade_name": "Grade 9"
    },
    "academic_year": "2023/2024",
    "semesters": [
      {
        "name": "First Semester",
        "total": 602,
        "average": 75.2
      },
      {
        "name": "Second Semester",
        "total": 628,
        "average": 78.5
      }
    ],
    "subjects": [
      {
        "name": "Mathematics",
        "first_semester": 79.6,
        "second_semester": 82.1,
        "year_average": 80.85
      }
    ],
    "summary": {
      "year_total": 1230,
      "year_average": 76.85,
      "rank_in_class": 10,
      "total_students": 58,
      "remark": "Promoted"
    },
    "status": "published"
  },
  "error": null
}
```

---

### 3. View Subject-Wise Grade Breakdown

```
GET /api/v1/student/subjects/:subject_id/grades
```

> **Note:** Students can view assessment-level details (test/quiz/project) for their own subjects.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | No | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": {
      "id": 1,
      "name": "Mathematics",
      "code": "MATH",
      "credit_hours": 5
    },
    "teacher": {
      "name": "Ato Haile Mariam"
    },
    "semester": "First Semester",
    "assessments": [
      {
        "type": "Mid-Term Exam",
        "score": 78,
        "max_score": 100,
        "weight_percent": 30,
        "weighted_score": 23.4,
        "class_average": 68.5,
        "date": "2024-01-10"
      },
      {
        "type": "Final Exam",
        "score": 82,
        "max_score": 100,
        "weight_percent": 40,
        "weighted_score": 32.8,
        "class_average": 70.2,
        "date": "2024-01-25"
      },
      {
        "type": "Quiz",
        "score": 42,
        "max_score": 50,
        "weight_percent": 15,
        "weighted_score": 12.6,
        "class_average": 38.5,
        "date": "2024-01-05"
      },
      {
        "type": "Assignment",
        "score": 88,
        "max_score": 100,
        "weight_percent": 15,
        "weighted_score": 13.2,
        "class_average": 82.0,
        "date": "2024-01-20"
      }
    ],
    "summary": {
      "subject_total": 290,
      "subject_average": 82.0,
      "rank_in_subject": 8,
      "class_average": 68.5
    }
  },
  "error": null
}
```

---

### 4. View Rank and Average

```
GET /api/v1/student/rank
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | No | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |
| type | string | Yes | `semester` or `year` |

**Response:**
```json
{
  "success": true,
  "data": {
    "student_id": 101,
    "student_name": "Abebe Kebede",
    "class_name": "9A",
    "type": "semester",
    "period": "First Semester 2023/2024",
    "rank": {
      "position": 12,
      "total_students": 58
    },
    "scores": {
      "total": 602,
      "average": 75.2
    },
    "comparison": {
      "class_average": 71.5,
      "class_highest_total": 740,
      "class_lowest_total": 362,
      "above_average": true,
      "difference_from_average": 3.7
    },
    "remark": "Promoted"
  },
  "error": null
}
```

---

### 5. View Teacher Remarks

```
GET /api/v1/student/remarks
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | No | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "class_head_remark": {
      "teacher_name": "Ato Kebede Tessema",
      "remark": "Good performance overall. Shows improvement in sciences. Should focus more on languages.",
      "date": "2024-01-26"
    },
    "subject_remarks": [
      {
        "subject_name": "Mathematics",
        "teacher_name": "Ato Haile Mariam",
        "remark": "Excellent problem-solving skills. Keep up the good work!",
        "date": "2024-01-20"
      },
      {
        "subject_name": "English",
        "teacher_name": "W/ro Tigist Bekele",
        "remark": "Good writing skills. Needs to improve speaking confidence.",
        "date": "2024-01-21"
      }
    ],
    "remarks_enabled": true
  },
  "error": null
}
```

---

### 6. Download Report Card (PDF)

```
GET /api/v1/student/reports/download
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | No | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |
| type | string | Yes | `semester` or `year` |

**Response:**
```json
{
  "success": true,
  "data": {
    "download_url": "/api/v1/downloads/reports/student-101-sem1-2024.pdf",
    "filename": "Report_Card_Abebe_Kebede_Semester1_2023-2024.pdf",
    "expires_at": "2024-01-28T10:00:00Z",
    "file_size_kb": 245
  },
  "error": null
}
```

**Error Cases:**
- `404 NOT_FOUND` - Report not yet published
- `403 FORBIDDEN` - Report not available for download

---

## Parent Endpoints

**Role Required:** `parent`

> **Note:** Parents can only view academic data of their linked children.

---

### 1. List Children

```
GET /api/v1/parent/children
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "student_id": 101,
        "student_code": "STU2024001",
        "name": "Abebe Kebede",
        "class_name": "9A",
        "grade_name": "Grade 9",
        "school_name": "Addis Ababa Secondary School"
      },
      {
        "student_id": 150,
        "student_code": "STU2024050",
        "name": "Meron Kebede",
        "class_name": "11B",
        "grade_name": "Grade 11",
        "school_name": "Addis Ababa Secondary School"
      }
    ]
  },
  "error": null
}
```

---

### 2. View Child's Semester Report

```
GET /api/v1/parent/children/:student_id/reports/semester
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | Yes | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 101,
      "code": "STU2024001",
      "name": "Abebe Kebede",
      "class_name": "9A",
      "grade_name": "Grade 9"
    },
    "semester": "First Semester",
    "academic_year": "2023/2024",
    "subjects": [
      {
        "name": "Mathematics",
        "score": 79.6
      }
    ],
    "summary": {
      "total": 602,
      "average": 75.2,
      "rank_in_class": 12,
      "total_students": 58,
      "remark": "Promoted"
    },
    "class_head_remarks": "Good performance. Keep it up!",
    "published_at": "2024-01-26T10:00:00Z"
  },
  "error": null
}
```

**Error Cases:**
- `403 FORBIDDEN` - Student is not linked to this parent
- `404 NOT_FOUND` - Report not yet published

---

### 3. View Child's Year Report

```
GET /api/v1/parent/children/:student_id/reports/year
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| academic_year_id | integer | Yes | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 101,
      "name": "Abebe Kebede",
      "class_name": "9A",
      "grade_name": "Grade 9"
    },
    "academic_year": "2023/2024",
    "semesters": [
      { "name": "First Semester", "total": 602, "average": 75.2 },
      { "name": "Second Semester", "total": 628, "average": 78.5 }
    ],
    "subjects": [
      {
        "name": "Mathematics",
        "first_semester": 79.6,
        "second_semester": 82.1,
        "year_average": 80.85
      }
    ],
    "summary": {
      "year_total": 1230,
      "year_average": 76.85,
      "rank_in_class": 10,
      "total_students": 58,
      "remark": "Promoted"
    }
  },
  "error": null
}
```

---

### 4. View Child's Subject-Wise Breakdown

```
GET /api/v1/parent/children/:student_id/subjects/:subject_id/grades
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | No | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 101,
      "name": "Abebe Kebede"
    },
    "subject": {
      "name": "Mathematics",
      "credit_hours": 5
    },
    "assessments": [
      {
        "type": "Mid-Term Exam",
        "score": 78,
        "max_score": 100,
        "weight_percent": 30,
        "weighted_score": 23.4,
        "class_average": 68.5
      }
    ],
    "summary": {
      "subject_total": 290,
      "subject_average": 82.0,
      "rank_in_subject": 8
    }
  },
  "error": null
}
```

---

### 5. View Child's Averages & Rank

```
GET /api/v1/parent/children/:student_id/rank
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | No | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |
| type | string | Yes | `semester` or `year` |

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 101,
      "name": "Abebe Kebede",
      "class_name": "9A"
    },
    "type": "semester",
    "period": "First Semester 2023/2024",
    "rank": {
      "position": 12,
      "total_students": 58
    },
    "scores": {
      "total": 602,
      "average": 75.2
    },
    "comparison": {
      "class_average": 71.5,
      "above_average": true
    },
    "remark": "Promoted"
  },
  "error": null
}
```

---

### 6. Download Child's Report Card (PDF)

```
GET /api/v1/parent/children/:student_id/reports/download
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| semester_id | integer | No | Semester identifier |
| academic_year_id | integer | Yes | Academic year identifier |
| type | string | Yes | `semester` or `year` |

**Response:**
```json
{
  "success": true,
  "data": {
    "download_url": "/api/v1/downloads/reports/student-101-sem1-2024.pdf",
    "filename": "Report_Card_Abebe_Kebede_Semester1_2023-2024.pdf",
    "expires_at": "2024-01-28T10:00:00Z"
  },
  "error": null
}
```

---

## Store House Endpoints

**Role Required:** `store_house`

> **Note:** Store House manages long-term academic records across all grades (9-12).

---

### 1. View Class Rosters

#### 1.1 List All Rosters

```
GET /api/v1/store-house/rosters
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| academic_year_id | integer | No | Filter by academic year |
| grade_id | integer | No | Filter by grade level |
| class_id | integer | No | Filter by specific class |
| page | integer | No | Page number |
| limit | integer | No | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "roster_id": 1,
        "class": {
          "id": 1,
          "name": "9A",
          "grade_name": "Grade 9"
        },
        "academic_year": "2023/2024",
        "student_count": 58,
        "class_head": "Ato Kebede Tessema",
        "received_at": "2024-06-25T10:00:00Z",
        "status": "complete"
      }
    ],
    "pagination": {...}
  },
  "error": null
}
```

---

#### 1.2 Get Roster Details

```
GET /api/v1/store-house/rosters/:roster_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roster_id": 1,
    "class": {
      "id": 1,
      "name": "9A",
      "grade_name": "Grade 9"
    },
    "academic_year": "2023/2024",
    "semester": "First Semester",
    "class_head": {
      "id": 15,
      "name": "Ato Kebede Tessema",
      "phone": "+251911234567"
    },
    "students": [
      {
        "student_id": 101,
        "name": "Abarruu Masqalli Gabbisaa",
        "sex": "F",
        "age": 8,
        "semester": 1,
        "subject_scores": {
          "Afaan Oromoo": 71,
          "English": 34,
          "Mathematics": 60,
          "Science": 67
        },
        "total": 494,
        "average": 61.8,
        "rank": 14,
        "absent_days": 2,
        "conduct": "Good",
        "remark": "Promoted"
      }
    ],
    "class_statistics": {
      "total_students": 58,
      "class_average": 71.5,
      "promoted": 55,
      "retained": 3
    },
    "received_at": "2024-06-25T10:00:00Z"
  },
  "error": null
}
```

---

### 2. Receive Published Final Results

#### 2.1 List Received Results

```
GET /api/v1/store-house/results
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| academic_year_id | integer | No | Filter by academic year |
| grade_id | integer | No | Filter by grade |
| type | string | No | `semester` or `year` |
| page | integer | No | Page number |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "result_id": 1,
        "class": {
          "id": 1,
          "name": "9A",
          "grade_name": "Grade 9"
        },
        "type": "year",
        "academic_year": "2023/2024",
        "student_count": 58,
        "received_from": "Class Head - Ato Kebede Tessema",
        "received_at": "2024-06-25T10:00:00Z",
        "verified": true
      }
    ],
    "pagination": {...}
  },
  "error": null
}
```

---

#### 2.2 View Result Details

```
GET /api/v1/store-house/results/:result_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result_id": 1,
    "class": {
      "id": 1,
      "name": "9A",
      "grade_name": "Grade 9"
    },
    "academic_year": "2023/2024",
    "type": "year",
    "students": [
      {
        "student_id": 101,
        "student_code": "STU2024001",
        "name": "Abebe Kebede",
        "subjects": [
          {
            "name": "Mathematics",
            "score": 80.85
          }
        ],
        "summary": {
          "total": 1230,
          "year_average": 76.85,
          "rank": 10,
          "remark": "Promoted"
        }
      }
    ],
    "verified_at": "2024-06-26T10:00:00Z"
  },
  "error": null
}
```

---

### 3. Manage Cumulative Academic Records

#### 3.1 Get Student Cumulative Record

```
GET /api/v1/store-house/students/:student_id/cumulative-record
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 101,
      "code": "STU2024001",
      "name": "Abebe Kebede",
      "gender": "M",
      "date_of_birth": "2008-05-15",
      "enrollment_date": "2023-09-01",
      "current_grade": "Grade 10",
      "current_class": "10A"
    },
    "academic_history": [
      {
        "academic_year": "2023/2024",
        "grade_level": "Grade 9",
        "class_name": "9A",
        "total": 1230,
        "year_average": 76.85,
        "rank": 10,
        "total_students": 58,
        "remark": "Promoted",
        "subjects": [
          {
            "name": "Mathematics",
            "score": 80.85
          }
        ]
      }
    ],
    "cumulative_average": 76.85,
    "completion_status": "In Progress"
  },
  "error": null
}
```

---

#### 3.2 Search Student Records

```
GET /api/v1/store-house/students/search
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| student_code | string | No | Search by student code |
| name | string | No | Search by name |
| grade_id | integer | No | Filter by current grade |
| academic_year_id | integer | No | Filter by enrollment year |
| page | integer | No | Page number |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "student_id": 101,
        "student_code": "STU2024001",
        "name": "Abebe Kebede",
        "current_grade": "Grade 10",
        "current_class": "10A",
        "enrollment_year": "2023/2024",
        "cumulative_average": 76.85,
        "completion_status": "In Progress"
      }
    ],
    "pagination": {...}
  },
  "error": null
}
```

---

#### 3.3 Update Student Record (Administrative)

```
PUT /api/v1/store-house/students/:student_id/cumulative-record
```

**Request Body:**
```json
{
  "academic_year_id": 1,
  "grade_level": 9,
  "corrections": [
    {
      "subject_id": 1,
      "corrected_average": 81.5,
      "reason": "Grade correction after review"
    }
  ],
  "admin_remarks": "Corrected Mathematics grade after appeal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student_id": 101,
    "updated_record": {
      "academic_year": "2023/2024",
      "corrections_applied": 1
    },
    "audit_log": {
      "correction_id": 1,
      "corrected_by": "Store House Admin",
      "corrected_at": "2024-07-01T10:00:00Z"
    }
  },
  "error": null
}
```

---

### 4. Generate Student Transcripts

#### 4.1 Generate Transcript

```
POST /api/v1/store-house/students/:student_id/transcript
```

**Request Body:**
```json
{
  "include_grades": [9, 10, 11, 12],
  "format": "official",
  "purpose": "University Application"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transcript_id": "TR-2024-00123",
    "student": {
      "id": 101,
      "name": "Olira Tesegera Mosisa",
      "age": 16,
      "sex": "M",
      "date_of_admission": "2011-09-01",
      "reason_for_withdrawal": "Completion of Grade",
      "promoted_to_grade": "Grade 10",
      "incomplete_in_grade": null,
      "date_of_leaving": "2014-07-01",
      "last_grade_attended": "Grade 12"
    },
    "grades_included": [9, 10, 11, 12],
    "academic_records": [
      {
        "year": "2011 E.C",
        "grade_level": "Grade 9",
        "semesters": [
          {
            "semester": "First Semester",
            "subjects": [
              { "name": "Afaan Oromoo", "score": 57 },
              { "name": "Amharic", "score": 55 },
              { "name": "English", "score": 84 },
              { "name": "Mathematics", "score": 81 }
            ],
            "total": 899,
            "average": 74.9,
            "rank_in_class": "4 of 53",
            "conduct": "A",
            "number_of_students": 53,
            "promotion_status": "Promoted"
          },
          {
            "semester": "Second Semester",
            "subjects": [
              { "name": "Afaan Oromoo", "score": 68 },
              { "name": "Amharic", "score": 64 },
              { "name": "English", "score": 81 },
              { "name": "Mathematics", "score": 79 }
            ],
            "total": 892,
            "average": 74.2,
            "rank_in_class": "3 of 53",
            "conduct": "A",
            "number_of_students": 53,
            "promotion_status": "Promoted"
          }
        ]
      }
    ],
    "format": "official",
    "generated_at": "2024-07-15T10:00:00Z",
    "valid_until": "2025-07-15T10:00:00Z",
    "verification_code": "VER-ABC123XYZ"
  },
  "error": null
}
```

---

#### 4.2 View Transcript

```
GET /api/v1/store-house/transcripts/:transcript_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transcript_id": "TR-2024-00123",
    "student": {
      "id": 101,
      "name": "Olira Tesegera Mosisa",
      "age": 16,
      "sex": "M",
      "date_of_admission": "2011-09-01",
      "reason_for_withdrawal": "Completion of Grade",
      "promoted_to_grade": "Grade 10",
      "incomplete_in_grade": null,
      "date_of_leaving": "2014-07-01",
      "last_grade_attended": "Grade 12"
    },
    "school": {
      "name": "Addis Ababa Secondary School",
      "code": "AASS",
      "address": "Bole, Addis Ababa"
    },
    "academic_records": [
      {
        "year": "2011 E.C",
        "grade_level": "Grade 9",
        "semesters": [
          {
            "semester": "First Semester",
            "subjects": [
              { "name": "Afaan Oromoo", "score": 57 },
              { "name": "Amharic", "score": 55 },
              { "name": "English", "score": 84 },
              { "name": "Mathematics", "score": 81 }
            ],
            "total": 899,
            "average": 74.9,
            "rank_in_class": "4 of 53",
            "conduct": "A",
            "number_of_students": 53,
            "promotion_status": "Promoted"
          },
          {
            "semester": "Second Semester",
            "subjects": [
              { "name": "Afaan Oromoo", "score": 68 },
              { "name": "Amharic", "score": 64 },
              { "name": "English", "score": 81 },
              { "name": "Mathematics", "score": 79 }
            ],
            "total": 892,
            "average": 74.2,
            "rank_in_class": "3 of 53",
            "conduct": "A",
            "number_of_students": 53,
            "promotion_status": "Promoted"
          }
        ]
      }
    ],
    "verification": {
      "code": "VER-ABC123XYZ",
      "generated_at": "2024-07-15T10:00:00Z",
      "valid_until": "2025-07-15T10:00:00Z"
    }
  },
  "error": null
}
```

---

### 5. Export Official Transcript Documents

```
GET /api/v1/store-house/transcripts/:transcript_id/export
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| format | string | No | `pdf` (default) or `print` |

**Response:**
```json
{
  "success": true,
  "data": {
    "download_url": "/api/v1/downloads/transcripts/TR-2024-00123.pdf",
    "filename": "Official_Transcript_Abebe_Kebede.pdf",
    "expires_at": "2024-07-16T10:00:00Z",
    "file_size_kb": 185,
    "watermark": "OFFICIAL DOCUMENT",
    "verification_qr_included": true
  },
  "error": null
}
```

---

### 6. Verify Academic Completion Status

#### 6.1 Check Completion Status

```
GET /api/v1/store-house/students/:student_id/completion-status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 101,
      "code": "STU2024001",
      "name": "Abebe Kebede"
    },
    "completion_status": "Completed",
    "graduation_date": "2027-06-30",
    "requirements": {
      "required_passing_average": 50,
      "current_average": 78.5,
      "requirement_met": true
    },
    "grades_completed": {
      "grade_9": { "status": "completed", "year": "2023/2024" },
      "grade_10": { "status": "completed", "year": "2024/2025" },
      "grade_11": { "status": "completed", "year": "2025/2026" },
      "grade_12": { "status": "completed", "year": "2026/2027" }
    },
    "eligible_for_certificate": true,
    "certificate_issued": false
  },
  "error": null
}
```

---

#### 6.2 Issue Completion Certificate

```
POST /api/v1/store-house/students/:student_id/completion-certificate
```

**Request Body:**
```json
{
  "certificate_type": "secondary_completion",
  "issue_date": "2027-07-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "certificate_id": "CERT-2027-00456",
    "student": {
      "id": 101,
      "name": "Abebe Kebede"
    },
    "certificate_type": "Secondary School Completion Certificate",
    "issue_date": "2027-07-01",
    "verification_code": "CERT-VER-XYZ789",
    "download_url": "/api/v1/downloads/certificates/CERT-2027-00456.pdf"
  },
  "error": null
}
```

**Error Cases:**
- `400 VALIDATION_ERROR` - Student has not completed all requirements
- `409 CONFLICT` - Certificate already issued

---

## Error Codes Reference

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data or business rule violation |
| 401 | UNAUTHORIZED | Missing or invalid authentication token |
| 403 | FORBIDDEN | User does not have permission for this action |
| 404 | NOT_FOUND | Requested resource does not exist |
| 409 | CONFLICT | Resource state conflict (e.g., already exists, locked) |
| 422 | UNPROCESSABLE_ENTITY | Request understood but cannot be processed |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 500 | INTERNAL_ERROR | Server-side error |

### Common Error Response Examples

**Validation Error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "fields": [
        { "field": "score", "message": "Score must be between 0 and max_score" },
        { "field": "student_id", "message": "Student not found in this class" }
      ]
    }
  }
}
```

**Authorization Error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource",
    "details": {
      "required_role": "school_head",
      "current_role": "teacher"
    }
  }
}
```

**Resource Locked Error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "Grading period is locked",
    "details": {
      "locked_at": "2024-02-05T10:00:00Z",
      "locked_by": "School Head",
      "reason": "Semester grades finalized"
    }
  }
}
```

---

## Appendix: Query Parameter Conventions

### Pagination
All list endpoints support pagination:
- `page`: Page number (1-indexed, default: 1)
- `limit`: Items per page (default: 20, max: 100)

### Filtering
- Use query parameters for filtering
- Multiple values: `status=active,pending`
- Date ranges: `start_date=2024-01-01&end_date=2024-12-31`

### Sorting
- `sort_by`: Field to sort by
- `sort_order`: `asc` or `desc` (default: `asc`)

Example: `GET /api/v1/school/grades?sort_by=level&sort_order=asc`

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*System: Ethiopian Secondary School Grade Management Portal*

