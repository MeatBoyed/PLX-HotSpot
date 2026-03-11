# EC1 Notification Engine — SMS API Reference

## Overview

The EC1 Notification Engine sends SMS notifications to customers. All requests and responses use **JSON** (`Content-Type: application/json`).

A session token must be obtained via `/apiLogin` before sending messages. Sessions expire after **10 minutes**.

---

## Base URL

```
http://{IP}:{PORT}/Notification_Engine
```

---

## 1. Login — `POST /apiLogin`

Authenticates the API user and returns a session token.

**Request:**

```json
{
  "UserId": "your_user_id",
  "Password": "your_password"
}
```

**Response (success):**

```json
{
  "SessionId": "1a03c850-d4bc-4660-8aa0-dba0f86195b4",
  "ResponseCode": "00",
  "ResponseDescription": "Success"
}
```

---

## 2. Send SMS — `POST /sendSMS`

Sends an SMS to a single recipient.

**Request:**

```json
{
  "SessionId": "1a03c850-d4bc-4660-8aa0-dba0f86195b4",
  "MSISDN": "27767182910",
  "Message": "Your message goes here."
}
```

| Field     | Type   | Description                                    |
| --------- | ------ | ---------------------------------------------- |
| SessionId | string | Token from `/apiLogin`                         |
| MSISDN    | string | 11-digit number starting with `27` (SA format) |
| Message   | string | SMS text, max **250 characters**               |

**Response (success):**

```json
{
  "ResponseCode": "00",
  "ResponseDescription": "Success"
}
```

---

## 3. Send Mail — `POST /sendMail`

Sends an email to a recipient (not used in OTP flow).

**Request:**

```json
{
  "SessionId": "...",
  "FromMailName": "COJ Support",
  "FromMailId": "support@csd.joburg",
  "ToMailId": "recipient@example.com",
  "Subject": "Email subject",
  "Body": "Email body",
  "AttachmentFileName": "file.pdf",
  "AttachmentContent": "<base64>",
  "ContentType": "application/pdf"
}
```

Optional fields: `FromMailName`, `AttachmentFileName`, `AttachmentContent`, `ContentType`.

---

## Response Codes

| Code | Description                     |
| ---- | ------------------------------- |
| 00   | Success                         |
| 01   | System Error                    |
| 10   | Invalid User Id                 |
| 11   | Invalid Password                |
| 12   | Invalid User Id or Password     |
| 14   | User Id Blocked                 |
| 20   | Invalid Session Id              |
| 21   | Invalid MSISDN                  |
| 22   | Invalid Message                 |
| 23   | Invalid Body                    |
| 24   | Invalid From Mail Name          |
| 25   | Invalid From Mail ID            |
| 26   | Invalid To Mail ID              |
| 27   | Invalid Subject                 |
| 28   | Invalid Attachment Name         |
| 29   | Invalid Attachment Content      |
| 30   | Invalid Attachment Content Type |
| 31   | Invalid Attachment Content Type |
| 91   | Invalid Request Data            |
| 92   | System Error                    |

---

## Environment Variables

| Variable           | Description         | Example                  |
| ------------------ | ------------------- | ------------------------ |
| `EC1_SMS_API_URL`  | Base URL of the API | `http://10.10.10.1:8080` |
| `EC1_SMS_USER_ID`  | API login user ID   | `captive_portal`         |
| `EC1_SMS_PASSWORD` | API login password  | `s3cret`                 |
