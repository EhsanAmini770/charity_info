# Validation and Error Handling

## Overview

This document outlines the validation and error handling approach implemented in the Charity Information Website backend. The application uses a flexible validation middleware and consistent error handling to ensure robust API endpoints.

## Validation Middleware

### Flexible Validation

All routes in the application use the flexible validation middleware, which provides:

1. **Consistent validation**: Using express-validator with standardized error formats
2. **Optional fields support**: Properly handling optional fields in requests
3. **Partial updates**: Supporting partial updates without requiring all fields
4. **Custom validation**: Allowing custom validation logic beyond basic type checking

### Validation Files

Validation rules are defined in separate files in the `validations` directory:

- `userValidationFlex.js`: User-related validation
- `newsValidationFlex.js`: News-related validation
- `faqValidationFlex.js`: FAQ-related validation
- `galleryValidationFlex.js`: Gallery-related validation
- `searchValidationFlex.js`: Search-related validation
- `sitemapValidationFlex.js`: Sitemap-related validation
- `analyticsValidationFlex.js`: Analytics-related validation

### Example Usage

```javascript
// Define validation rules
const createUserRules = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isString().withMessage('Username must be a string')
    .trim(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isString().withMessage('Password must be a string')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Create validation middleware
const validateCreateUser = validateRequest(createUserRules, {
  allowPartialUpdates: false,
  requiredFields: ['username', 'password'],
  customValidator: customUserValidator
});

// Use in routes
router.post('/users', validateCreateUser, userController.createUser);
```

## Error Handling

### Controller Error Handling

All controllers use the `controllerUtils.handleControllerError` function to ensure consistent error responses:

```javascript
try {
  // Controller logic
} catch (error) {
  controllerUtils.handleControllerError(error, res, {
    context: 'functionName',
    useNextFunction: true,
    next
  });
}
```

### Error Response Format

All error responses follow a consistent format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error message"
      }
    ]
  }
}
```

### Validation Error Format

Validation errors are returned in a consistent format:

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "username",
        "message": "Username is required"
      }
    ]
  }
}
```

## Logging

### Debug Utility

The application uses a custom debug utility for logging:

```javascript
const debug = require('../utils/debug').createNamespace('namespace');

debug.log('Info message');
debug.error('Error message', error);
```

### Sensitive Data Masking

All logs are sanitized to mask sensitive data:

- Passwords
- Tokens
- API keys
- Authentication headers
- Other sensitive information

### Production Logging

In production, logs are:

1. Sanitized to remove sensitive data
2. Structured for easier parsing
3. Limited to important information (errors, warnings, critical events)
4. Formatted consistently

## Best Practices

When implementing new routes or controllers:

1. **Always use validation**: Every route should have appropriate validation
2. **Use the flexible validation middleware**: Don't fall back to legacy validation
3. **Handle errors consistently**: Use controllerUtils.handleControllerError
4. **Sanitize sensitive data**: Never log sensitive information
5. **Use the debug utility**: Don't use console.log directly
6. **Return consistent error responses**: Follow the established error format
7. **Document validation rules**: Keep validation rules clear and well-documented

## Implementation Details

### validateRequest Function

The `validateRequest` function in `validationUtils.js` creates middleware that:

1. Runs express-validator validation rules
2. Checks for validation errors
3. Formats error messages consistently
4. Supports partial updates
5. Allows custom validation logic

### handleControllerError Function

The `handleControllerError` function in `controllerUtils.js`:

1. Formats error responses consistently
2. Logs errors with appropriate context
3. Sets appropriate HTTP status codes
4. Sanitizes sensitive information
5. Supports different error types (validation, database, etc.)

## Future Improvements

Planned improvements to the validation and error handling system:

1. More detailed error categorization
2. Better support for nested object validation
3. Enhanced logging with request context
4. Improved error tracking and monitoring
