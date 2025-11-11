#!/bin/bash
echo "ÔøΩÔøΩ Fetching changes from GitHub..."
git fetch origin

echo "Ì¥Ä Merging branch..."
git merge origin/claude/fix-responsive-design-011CUsQjjT8cgmQ7VTTFRv91

echo "‚¨ÜÔ∏è  Pushing to GitHub master..."
git push origin master

echo "Ì≥° Deploying to VPS..."
ssh -o StrictHostKeyChecking=no root@69.62.95.98 << 'ENDSSH'
cd /var/www/beristainAsociados
git pull origin master
nginx -t && systemctl reload nginx
echo "‚úÖ Deployment complete!"
ENDSSH

echo "‚úÖ All done! Check your site in incognito mode."
