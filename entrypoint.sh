#!/bin/sh
set -e

# This script replaces references to environment variables in the built files
# with the actual values from the runtime environment.

# Function to replace a placeholder with an environment variable value
replace_env() {
  local name=$1
  local value=$2
  local placeholder="${name}_PLACEHOLDER"

  if [ -n "$value" ]; then
    echo "Replacing $placeholder with actual value in .next directory..."
    
    # We use a delimiter that is unlikely to be in the value, e.g., |
    # But URLs contain /, so | is better. Using ~ is also an option.
    # We use | here. If values contain |, we might have issues.
    
    # Escape standard sed delimiters if present in value (basic safety)
    # This is a simple implementation. For complex values, more robust escaping is needed.
    
    find /app/.next -type f \( -name "*.js" -o -name "*.json" -o -name "*.html" \) -exec sed -i "s|${placeholder}|${value}|g" {} +
  else
    echo "Warning: Environment variable $name is not set. Placeholder $placeholder will remain."
  fi
}

# Replace specific NEXT_PUBLIC_ variables
replace_env "NEXT_PUBLIC_APP_URL" "$NEXT_PUBLIC_APP_URL"
replace_env "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
replace_env "NEXT_PUBLIC_R2_PUBLIC_URL" "$NEXT_PUBLIC_R2_PUBLIC_URL"

# Stripe Price IDs
replace_env "NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY" "$NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_MONTHLY"
replace_env "NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY" "$NEXT_PUBLIC_STRIPE_PRICE_ATHLETE_YEARLY"
replace_env "NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY" "$NEXT_PUBLIC_STRIPE_PRICE_COACH_MONTHLY"
replace_env "NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY" "$NEXT_PUBLIC_STRIPE_PRICE_COACH_YEARLY"
replace_env "NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY" "$NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_MONTHLY"
replace_env "NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY" "$NEXT_PUBLIC_STRIPE_PRICE_RECRUITER_YEARLY"

# Execute the passed command
echo "Starting application..."
exec "$@"
