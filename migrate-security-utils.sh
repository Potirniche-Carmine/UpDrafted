#!/bin/bash

# Migration script to update imports and remove redundant files
# Run this after reviewing the consolidation plan

echo "🔄 Starting security utils consolidation migration..."

# Create backup
echo "📦 Creating backup of current utils..."
mkdir -p backup_utils_$(date +%Y%m%d_%H%M%S)
cp -r utils/ backup_utils_$(date +%Y%m%d_%H%M%S)/

# Update all imports in API routes
echo "🔧 Updating imports in API routes..."

# Update rate-limiting imports
find app -name "*.ts" -type f -exec sed -i '' 's/from.*rate-limiting/from "@\/utils\/security"/g' {} \;

# Update security-cache imports  
find app -name "*.ts" -type f -exec sed -i '' 's/from.*security-cache/from "@\/utils\/security"/g' {} \;

# Update security-monitoring imports
find app -name "*.ts" -type f -exec sed -i '' 's/from.*security-monitoring/from "@\/utils\/security"/g' {} \;

# Update middleware imports
echo "🔧 Updating middleware.ts imports..."
sed -i '' 's/from.*security-monitoring/from ".\/utils\/security"/g' middleware.ts

echo "🗑️  The following files can be safely removed after verification:"
echo "   - utils/rate-limiting.ts (consolidated into security.ts)"
echo "   - utils/security-cache.ts (consolidated into security.ts)"  
echo "   - utils/security-monitoring.ts (consolidated into security.ts)"
echo "   - utils/cache-utils.ts (not used - PWA cache only)"
echo "   - utils/production-config.ts (not used - duplicate functionality)"
echo "   - utils/file-security.ts (not imported anywhere)"

echo ""
echo "✅ Migration complete!"
echo "🧪 Please test your application to ensure everything works correctly."
echo "📝 Review the consolidated security.ts file for any needed adjustments."
echo ""
echo "To remove the old files after testing:"
echo "rm utils/rate-limiting.ts utils/security-cache.ts utils/security-monitoring.ts utils/cache-utils.ts utils/production-config.ts utils/file-security.ts"
