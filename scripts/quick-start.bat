@echo off
echo Starting AI Knowledge Graph Q&A System Setup...
echo.

echo Step 1: Installing dependencies...
call npm install d3 neo4j-driver @types/d3
if errorlevel 1 (
    echo Failed to install dependencies. Please check your npm installation.
    pause
    exit /b 1
)

echo.
echo Step 2: Creating environment file...
if not exist .env.local (
    copy .env.example .env.local
    echo Created .env.local from .env.example
    echo Please edit .env.local with your Neo4j and DeepSeek credentials.
) else (
    echo .env.local already exists.
)

echo.
echo Step 3: Running the development server...
echo The application will start at http://localhost:9002
echo.
echo NOTE: Before importing data, make sure:
echo 1. Neo4j is running and accessible
echo 2. Your .env.local file has correct Neo4j credentials
echo 3. Your DeepSeek API key is configured
echo.

timeout /t 5

call npm run dev
