@echo off
echo Setting up Neo4j connection...
echo.

echo Step 1: Installing required dependencies...
call npm install dotenv
if errorlevel 1 (
    echo Failed to install dependencies. Please check your npm installation.
    pause
    exit /b 1
)

echo.
echo Step 2: Testing Neo4j connection...
echo Please provide your Neo4j connection details:
echo.

node scripts/test-neo4j-connection.js

if errorlevel 1 (
    echo Failed to configure Neo4j connection.
    pause
    exit /b 1
)

echo.
echo Step 3: Would you like to import the data now? (y/n)
set /p import_choice="> "

if /i "%import_choice%"=="y" (
    echo Importing data...
    node scripts/import-data.js
) else (
    echo You can import data later by running: node scripts/import-data.js
)

echo.
echo Setup complete!
echo.
echo To start the application, run: npm run dev
echo.
pause
