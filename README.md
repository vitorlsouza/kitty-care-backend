# Table of Contents

- [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Authentication](#authentication)
    - [Google OAuth Flow](#google-oauth-flow)
    - [Using the OAuth Token](#using-the-oauth-token)
  - [Setup Instructions](#setup-instructions)
    - [Cloning the Repository](#cloning-the-repository)
    - [Installing Dependencies](#installing-dependencies)
    - [Starting the Server](#starting-the-server)

---

## Overview

This project is a backend application built using Node.js that integrates Google OAuth for authentication. The application provides secure authentication mechanisms and follows best practices for managing user sessions.

## Authentication

Authentication is managed using Google OAuth 2.0. Users must authenticate via Google, which provides an access token used for session management.

### Google OAuth Flow

- **User clicks on the Google Sign-In button.**
- **Google redirects back to the application with an authentication code.**
- **The application exchanges the code for an access token.**
- **A session is created for the user.**

### Using the OAuth Token

Include the Google OAuth token when making requests to protected API endpoints.

## Setup Instructions

### Cloning the Repository

```sh
git clone <repository_url>
cd <repository_folder>
```

### Installing Dependencies

````sh
npm install


### Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```env
GOOGLE_CLIENT_ID=465009099375-ghbqeffa3gp9q9jf1ql6n0k39vr2vjq7.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
SESSION_SECRET=secret
CALLBACK_URL=/api/auth/google/callback
````

### Starting the Server

```sh
npm run dev
```
