# 👤 Profile API – Frontend Integration Guide

This guide explains how to integrate **Profile APIs** from the frontend.

---

# 🌐 Base URL

```
http://<your-domain>/api/profile
```

---

# 📌 General Rules

### ✅ Headers

```
Content-Type: application/json
```

### ✅ Cookies

* Authentication uses **HTTP-only cookies**
* Always send requests with:

```
credentials: "include"
```

### ❗ Why `credentials: "include"`

* Required to send cookies (accessToken)
* Without it → user appears logged out

---

# 👤 PROFILE APIs

⚠️ All routes require authentication

---

## 1. Create Profile

### Endpoint

```
POST /
```

### Type

`multipart/form-data`

### Fields

* file → profile image (optional)
* fullName (required)
* phone (optional)
* bio (optional)
* country (optional)
* city (optional)
* address (optional)

---

## 2. Get Profile

### Endpoint

```
GET /
```

### Response

```json
{
  "success": true,
  "data": { ...profile }
}
```

---

## 3. Update Profile

### Endpoint

```
PUT /
```

### Type

`multipart/form-data`

### Options

You can send:

### Option A: Upload new file

* file
* other fields

### Option B: Use existing file

```json
{
  "fileId": "existing-file-id"
}
```

### ⚠️ Rules

* Send **either file OR fileId**
* Do NOT send both
* At least one field must be provided

---

## 4. Delete Profile

### Endpoint

```
DELETE /
```

### Response

```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

---

# ⚠️ Error Response Format

```json
{
  "success": false,
  "message": "Error message"
}
```

---

# 🔄 Frontend Flow

## Profile Flow

1. Create profile
2. View profile
3. Update profile
4. Delete profile

---

# 🚀 Important Notes

* Always use `credentials: include`
* Use `multipart/form-data` for file uploads
* Do NOT manually handle tokens
* Handle 401 → redirect to login

---

# 🧠 Example (Update Profile)

```js
const formData = new FormData();
formData.append("file", file);
formData.append("fullName", "John Doe");

fetch("/api/profile", {
  method: "PUT",
  body: formData,
  credentials: "include"
});
```

---

# ✅ Done

This document covers full profile integration.
