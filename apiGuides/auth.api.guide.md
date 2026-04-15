# 🔐 Auth API – Frontend Integration Guide

This guide explains how to use the authentication API from the frontend.

---

# 🌐 Base URL

```
http://<your-domain>/api/auth
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

---

# 🧾 API Endpoints

---

## 1. Register

### Endpoint

```
POST /register
```

### Body

```json
{
  "userName": "john123",
  "email": "john@example.com",
  "password": "Password123!"
}
```

### Success Response

```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": "...",
    "userName": "john123",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## 2. Login

### Endpoint

```
POST /login
```

### Body

```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

OR

```json
{
  "userName": "john123",
  "password": "Password123!"
}
```

### Success Response

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "userName": "john123",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## 3. Logout

### Endpoint

```
POST /logout
```

### Notes

* Requires authentication
* Clears cookies

---

## 4. Logout All Devices

### Endpoint

```
POST /logout-all
```

---

## 5. Refresh Token

### Endpoint

```
GET /refresh-token
```

### Notes

* Automatically refreshes access token using cookie

---

## 6. Forgot Password

### Endpoint

```
POST /forgot-password
```

### Body

```json
{
  "email": "john@example.com"
}
```

### Response

```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

---

## 7. Verify Reset OTP

### Endpoint

```
POST /verify-reset-otp
```

### Body

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Response

```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

---

## 8. Reset Password

### Endpoint

```
POST /reset-password
```

### Body

```json
{
  "resetToken": "token-from-cookie-or-storage",
  "newPassword": "NewPassword123!"
}
```

---

## 9. Resend Reset OTP

### Endpoint

```
POST /resend-reset-otp
```

### Body

```json
{
  "email": "john@example.com"
}
```

---

## 10. Verify Email

### Endpoint

```
GET /verify-email?userId=<id>&token=<token>
```

### Example

```
/verify-email?userId=123&token=abc123
```

---

## 11. Resend Verification Email

### Endpoint

```
POST /resend-verify-email
```

### Body

```json
{
  "userId": "123"
}
```

---

# ⚠️ Error Response Format

```json
{
  "success": false,
  "message": "Error message here"
}
```

---

# 🔄 Frontend Flow Summary

### 🟢 Registration Flow

1. Register
2. Show message: "Check email"
3. User clicks email verification link

---

### 🔵 Login Flow

1. Login
2. Cookies stored automatically
3. Redirect to dashboard

---

### 🟠 Forgot Password Flow

1. Enter email
2. Enter OTP
3. Reset password

---

# 🚀 Important Notes

* Always use `credentials: include`
* Do NOT store tokens manually (cookies handle it)
* Handle 401 errors → redirect to login
* Handle validation errors → show messages from API

---

# 🧠 Example Fetch

```js
fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  credentials: "include",
  body: JSON.stringify({
    email: "john@example.com",
    password: "Password123!"
  })
});
```

---

# ✅ Done

This document should be enough for frontend integration.
