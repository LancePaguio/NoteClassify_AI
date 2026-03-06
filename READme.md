# NoteClassify-AI

A note classifier that uses Gemini to classify markdown files and images.

# Features

  - instant classification in YAML format
  - Provides brief a brief summary of your note
  - Automatic Date and Time stamping
  - Supports: `markdown`, `text`, `png`, `jpg`, `jpeg`

# Requirements

  - [Node.js](https://nodejs.org/) version 18 or higher
  - Google Gemini API key

## Dependencies

 - express
 this is used for the web server
 - dotenv
 this is used to load your api key insed .env

Install them with:

```bash
npm install express dotenv
```

## How to get a Gemini API Key

1. Go to https://aistudio.google.com/api-keys
2. Sign in with any Google account
3. Copy the API key
4. Paste it inside your .env
  ex.
  `GEMINI_API_KEY=AIz...`

## Setup

1. Clone or download the project

2. CD to your NoteClassify-main directory

```bash
cd ~/NoteClassify-main
```

3. Install dependencies

```bash
npm install
```

3. Create your `.env` file

Create a file named `.env` in the root of the project (same folder as `server.js`) and add your key:

```
GEMINI_API_KEY=AIzaSy-your-key-here
```
WARNING: Don't show this .env file containing your key to anyone

4. Create a `.gitignore` file and add these two lines

```
.env
node_modules
```
5. Run the app in your terminal and click http://localhost:3000

```bash
node server.js
```
# How to use

First, create an account, then login using your registered email and password.

Next, there will be a dropzone in your home page you can either:
  1. click to choose a file
  2. drag and drop a file on the the dropzone

Wait for a while, and the message will appear containing the meta data of your note.

Copy this and paste into your frontmatter of your note.

## Example

```yaml
---
date: 2026-03-06
time: 8:54:11 PM
domain: Technology
sub-domain: Software Engineering
branch: Software Reliability and Safety
topic: Software Reliability, Safety, and Security Engineering
summary: This note details the concepts of software reliability, safety, and security, including definitions of faults, errors, and failures, fault management techniques, the distinction between reliability and safety, and the dimensions and management of security.
tags:
  - software reliability
  - software safety
  - software security
  - fault management
  - critical systems
  - security dimensions
  - hazards
---
```

