---

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

### ✅ Authentication (Cookies)

* Uses **HTTP-only cookies**
* Always include:

```
credentials: "include"
```

### ❗ Why `credentials: "include"`?

* Sends authentication cookies (accessToken)
* Without it → user will appear **logged out**

---

# 👤 Profile APIs

⚠️ All endpoints require authentication

---

## 1. Create Profile

### Endpoint

```
POST /
```

### Content-Type

`multipart/form-data`

### Fields

* `file` → Profile image *(optional)*
* `fullName` *(required)*
* `phone` *(optional)*
* `bio` *(optional)*
* `country` *(optional)*
* `city` *(optional)*
* `address` *(optional)*

---

## 2. Get Profile

### Option A: By Profile ID

```
GET /:id
```

### Option B: Current User Profile

```
GET /byUser
```

### Notes

* `/byUser` extracts user ID from the **access token**
* No request body or params required

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

### Content-Type

`multipart/form-data`

### Options

#### Option A: Upload New Image

* `file`
* Other fields

#### Option B: Use Existing Image

```json
{
  "fileId": "existing-file-id"
}
```

### ⚠️ Rules

* Send **either `file` OR `fileId`**
* Do **NOT** send both
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

1. Create profile
2. Fetch profile (`/byUser` recommended)
3. Update profile
4. Delete profile

---

# 🚀 Important Notes

* Always use `credentials: "include"`
* Use `multipart/form-data` for file uploads
* Do **NOT** manually handle tokens
* Handle `401 Unauthorized` → redirect to login

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