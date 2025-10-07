# Loader and Error Modal Components

This directory contains global loader and error modal components that provide a consistent user experience across the application.

## Components

### 1. Loader Component (`app-loader`)

A global loading spinner that can be triggered automatically by HTTP requests or manually by components.

**Features:**
- Automatic display for non-GET HTTP requests
- Customizable loading messages
- Global overlay with high z-index
- Responsive design

**Usage:**
```typescript
import { LoaderService } from '@core/services/loader.service';

constructor(private loaderService: LoaderService) {}

// Show loader with custom message
this.loaderService.show('Processing your request...');

// Show loader for specific duration
this.loaderService.showForDuration(3000, 'Loading...');

// Hide loader manually
this.loaderService.hide();
```

### 2. Error Modal Component (`app-error-modal`)

A global error modal that displays error messages with consistent styling and actions.

**Features:**
- Automatic display for HTTP errors (4xx, 5xx)
- Customizable error types and messages
- Retry button option
- Error code display
- Responsive design

**Usage:**
```typescript
import { ErrorModalService } from '@core/services/error-modal.service';

constructor(private errorModalService: ErrorModalService) {}

// Show custom error
this.errorModalService.showError(
  'Error Title',
  'Error message here',
  'ERROR_CODE',
  true // show retry button
);

// Show predefined error types
this.errorModalService.showNetworkError();
this.errorModalService.showServerError(500, 'Custom message');
this.errorModalService.showAuthError('Custom auth message');
```

## Services

### LoaderService

Manages the global loader state using RxJS BehaviorSubject.

**Methods:**
- `show(message?: string)` - Shows loader with optional message
- `hide()` - Hides the loader
- `showForDuration(duration: number, message?: string)` - Shows loader for specific time

### ErrorModalService

Manages the global error modal state using RxJS BehaviorSubject.

**Methods:**
- `showError(title, message, errorCode?, showRetry?)` - Shows custom error
- `showNetworkError(message?)` - Shows network error
- `showServerError(statusCode, message?)` - Shows server error
- `showAuthError(message?)` - Shows authentication error
- `hideError()` - Hides the error modal

## HTTP Interceptor Integration

The components are automatically integrated with the HTTP interceptor:

- **Loader**: Automatically shows for POST, PUT, PATCH requests
- **Error Modal**: Automatically shows for HTTP errors (4xx, 5xx)
- **Authentication**: Automatically handles 401/403 errors with logout

## Styling

Both components use CSS with:
- Fixed positioning for global overlay
- High z-index values (9999 for loader, 10000 for error modal)
- Responsive design with mobile breakpoints
- Smooth animations and transitions
- Consistent color scheme

## Demo Component

Use `app-loader-demo` to test all functionality:

```html
<app-loader-demo></app-loader-demo>
```

## Best Practices

1. **Automatic Usage**: Let the HTTP interceptor handle most cases automatically
2. **Manual Triggers**: Use services for custom loading states or error handling
3. **User Experience**: Provide meaningful messages for loaders and errors
4. **Accessibility**: Components are designed with proper contrast and focus states
5. **Performance**: Services use efficient state management with RxJS

## Integration

These components are automatically included in the main app component and shared module, making them available throughout the application without additional imports.
