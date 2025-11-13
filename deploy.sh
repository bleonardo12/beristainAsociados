#!/bin/bash
echo "📦 Fetching changes from GitHub..."
git fetch origin

echo "🔀 Merging branch..."
git merge origin/claude/web-page-improvements-011CV65GJfhxwPVYCtMxDf8o

echo "⬆️  Pushing to GitHub master..."
git push origin master

echo "🚀 Deploying to VPS..."
ssh -o StrictHostKeyChecking=no root@srv777726.hstgr.cloud << 'ENDSSH'
cd /var/www/beristainAsociados
git pull origin master
nginx -t && systemctl reload nginx
echo "✅ Deployment complete!"
ENDSSH

echo "✅ All done! Check your site in incognito mode."
