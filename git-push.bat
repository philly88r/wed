@echo off
echo Setting up Git push to Netlify...

echo Adding all modified files...
git add .

echo Committing changes...
git commit -m "Fix vendor profile update issue with slug field"

echo Pushing to remote repository...
git push origin main

echo Done! Changes have been pushed to Git and should trigger a Netlify deployment.
pause
