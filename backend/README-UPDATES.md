# Backend Updates

This document describes recent updates to the backend codebase to address validation issues and improve logging.

## 1. Flexible Validation Middleware

### Problem
The backend validation middleware sometimes expected fields that may not be present in all requests, which could cause 400 errors if the frontend sends minimal payloads (e.g., partial updates).

### Solution
We've implemented a more flexible validation approach:

1. **New Validation Utilities**
   - Created `validationUtils.js` with a `validateRequest` function that supports partial updates
   - Added support for specifying which fields are required even in partial updates
   - Implemented custom validation functions for complex validation logic

2. **Express-Validator Integration**
   - Updated validation rules to use express-validator for type conversion and validation
   - Added separate validation rules for create, update, and partial update operations

3. **FAQ Validation Example**
   - Created a dedicated `faqValidation.js` file with specific validation rules
   - Added a PATCH endpoint for partial updates (e.g., toggling isActive)
   - Implemented proper type conversion for numeric and boolean fields

### Usage Example

```javascript
// Import the validation utilities
const { validateRequest } = require('../utils/validationUtils');

// Define validation rules using express-validator
const createRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required')
];

// Create middleware for different operations
const validateCreate = validateRequest(createRules, {
  allowPartialUpdates: false,
  requiredFields: ['name', 'email']
});

const validateUpdate = validateRequest(createRules, {
  allowPartialUpdates: true
});

// Use in routes
router.post('/resource', validateCreate, controller.create);
router.put('/resource/:id', validateUpdate, controller.update);
```

## 2. Debug Logging Utility

### Problem
There were many `console.log` statements in production code, which could impact performance and expose sensitive information.

### Solution
We've implemented a debug logging utility:

1. **Debug Utility**
   - Created `debug.js` with controlled logging functions
   - Added environment-based enabling/disabling (only logs in development or when DEBUG=true)
   - Implemented namespaces for categorizing logs
   - Added sanitization for sensitive data

2. **Logger Integration**
   - Integrated with Winston logger for structured logging
   - Added support for different log levels (debug, info, warn, error)
   - Ensured stack traces are captured for errors

3. **Console.log Replacement Script**
   - Created a script to find and replace console.log statements
   - Added support for dry-run mode to preview changes
   - Implemented namespace detection based on file paths

### Usage Example

```javascript
// Import the debug utility with a namespace
const debug = require('../utils/debug').createNamespace('my-module');

// Use for regular logging (only appears in development)
debug.log('Processing request', { id: req.params.id });

// Use for error logging (captures stack traces)
try {
  // Some code that might throw
} catch (error) {
  debug.error('Error in operation', error);
}
```

## How to Use These Updates

### Validation

1. Create validation rules using express-validator in a dedicated file
2. Use `validateRequest` to create middleware for different operations
3. Apply the middleware to your routes

### Debugging

1. Replace `console.log` statements with `debug.log`
2. Replace `console.error` statements with `debug.error`
3. Use the replacement script to automate this process:

```bash
# Preview changes (dry run)
node scripts/replaceConsoleLogs.js --dry-run

# Apply changes to a specific directory
node scripts/replaceConsoleLogs.js --path=controllers

# Apply changes to the entire backend
node scripts/replaceConsoleLogs.js
```

## Environment Variables

- `DEBUG=true` - Enable debug logging in production
- `NODE_ENV=development` - Enable debug logging and detailed error responses

## Implementation Progress

### Completed

1. ✅ Applied flexible validation to FAQ routes
2. ✅ Applied flexible validation to News routes
3. ✅ Applied flexible validation to Gallery routes
4. ✅ Applied flexible validation to User routes
5. ✅ Applied flexible validation to Auth routes
6. ✅ Applied flexible validation to Contact routes
7. ✅ Applied flexible validation to Partner routes
8. ✅ Applied flexible validation to Team routes
9. ✅ Applied flexible validation to Location routes
10. ✅ Applied flexible validation to Subscriber routes
11. ✅ Applied flexible validation to About routes
12. ✅ Updated News controller to use debug utility instead of console.log
13. ✅ Updated Gallery controller to use debug utility instead of console.log
14. ✅ Updated User controller to use debug utility instead of console.log
15. ✅ Updated Auth controller to use debug utility instead of console.log
16. ✅ Updated Contact controller to use debug utility instead of console.log
17. ✅ Updated Partner controller to use debug utility instead of console.log
18. ✅ Updated Team controller to use debug utility instead of console.log
19. ✅ Updated Location controller to use debug utility instead of console.log
20. ✅ Updated Subscriber controller to use debug utility instead of console.log
21. ✅ Updated About controller to use debug utility instead of console.log
22. ✅ Updated server startup code to use debug utility instead of console.log
23. ✅ Updated database connection code to use debug utility instead of console.log
24. ✅ Created specialized server debug module for better server logging
25. ✅ Added proper error handling with stack traces
26. ✅ Improved file upload error handling

### Next Steps

1. Update frontend to handle the new validation responses
2. Add unit tests for the validation utilities
3. Implement rate limiting for auth routes
4. Add more comprehensive logging for security events
5. Add spam protection for contact form submissions
6. Implement image optimization for uploaded files
7. Add better JSON parsing error handling for form data
8. Implement geocoding validation for location coordinates
9. Add email validation with disposable email detection
10. Implement subscriber analytics tracking
11. Add validation for search parameters
12. Implement content versioning for About page
13. Add unit tests for debug utilities
