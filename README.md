# Group Members
Dagmawi Gezahign ………………………..…………….. (16/114/23)
Mohammed Jemal ……………………………………….. (16/104/23)
Tsega Hailu ……………………………………………….(16/127/23)
Zerubabel Girma ….………………………………………(16/126/23)
Mehretu Abebe…………………………………………… (16/106/23)
# PHP Lexical Analyzer

A simple web-based lexical analyzer built with PHP, HTML, and CSS.

## Features

- Token classification for keywords, identifiers, operators, delimiters, numbers, and errors.
- Simple interface for code input, file upload, and token output display.
- Line and column tracking for tokens.
- Basic `.docx` text extraction using `ZipArchive` and `DOMDocument`.
- Multiple input modes for strict assignment code, Python, C++, Java, and JavaScript.
- Table filtering for token search.

---

## Technical Architecture

The application is organized into three parts:
1. **Frontend View**: `index.php` provides the form and token display.
2. **File Handler**: `fileHandler.php` extracts text from uploaded files.
3. **Lexical Engine**: `lexer.php` tokenizes code and records positions.

---

## Local Run Guide

To run this application locally, you only need to have PHP installed (PHP 7.4 or PHP 8+ is recommended). No extra packages or servers (like Apache) are required because we use PHP's built-in web server.

### Step 1: Start PHP Server
Open a terminal in the project directory containing this project and run:
```bash
php -S localhost:8000
```

### Step 2: Open App in Browser
Go to your browser and open:
[http://localhost:8000](http://localhost:8000)
