# 🔐 Auth API – Frontend Integration Guide (CLEAN VERSION)

---

# 🌐 Base URL

```text
http://localhost:5000/api/auth
```

---

# 📌 General Rules

### ✅ Headers

```text
Content-Type: application/json
```

### ✅ Cookies (IMPORTANT)

All authentication is handled using **HTTP-only cookies**.

👉 Always include:

```js
credentials: "include"
```

---

# 🧾 API ENDPOINTS

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

### Response

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

### Response

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

## 3. Logout (Current Session)

### Endpoint

```
POST /logout
```

### Notes

* Logs out current device
* Clears authentication cookies

---

## 4. Logout All Devices

### Endpoint

```
POST /logout-all
```

### Notes

* Logs out user from all devices

---

## 5. Refresh Session

### Endpoint

```
GET /refresh-token
```

### Notes

* Automatically refreshes login session using cookies
* No body required

---

## 6. Forgot Password (Send OTP)

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
  "newPassword": "NewPassword123!"
}
```

### Notes

* No token is sent in body
* Session is handled automatically via cookies

### Response

```json
{
  "success": true,
  "message": "Password reset successfully"
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

### Notes

* Open link from email
* No request body required

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

# 🔄 FRONTEND FLOWS

---

## 🟢 Register Flow

1. Register user
2. Show: “Check your email”
3. User clicks verification link

---

## 🔵 Login Flow

1. Call login API
2. Cookies are set automatically
3. Redirect user to dashboard

---

## 🟠 Forgot Password Flow

### Step 1

User enters email:

```
POST /forgot-password
```

### Step 2

User receives OTP in email

### Step 3

User verifies OTP:

```
POST /verify-reset-otp
```

### Step 4

User resets password:

```
POST /reset-password
```

---

# 🚨 IMPORTANT NOTES

* Always use:

  ```js
  credentials: "include"
  ```

* Do NOT manually store tokens

* Do NOT pass tokens manually in requests (handled automatically)

* Handle 401 → redirect to login

* Show API error messages directly to user

