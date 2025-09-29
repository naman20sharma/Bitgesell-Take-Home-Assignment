## Overview
This document outlines the fixes and improvements made to address the intentional issues in the take-home assessment.

## Backend Improvements

### 1. Refactored Blocking I/O
**Problem**: `src/routes/items.js` used `fs.readFileSync`, blocking the event loop.

**Solution**:
- Replaced with `fs.promises.readFile` for async operations
- Added proper error handling for file operations

**Trade-offs**:
- Memory usage slightly increased due to caching
- Better performance under concurrent load

```javascript
// Before: fs.readFileSync(DATA_PATH)
// After: await fs.readFile(DATA_PATH, 'utf8') with caching
```

### 2. Performance - Stats Caching
**Problem**: `/api/stats` recalculated stats on every request.

**Solution**:
- Implemented a 5-minute in-memory TTL cache for `/api/stats`
- Utilized existing `utils/stats.js` mean function

**Trade-offs**:
- 5-minute cache balances freshness vs performance
- Memory overhead minimal for stats data
- Could be extended to Redis for multi-instance deployments
- Current response includes `total` and `averagePrice` only (kept minimal and clear).

### 3. Testing
**Added**: Comprehensive Jest unit tests for items routes
- Happy path scenarios
- Error cases (404, validation errors)
- Pagination and search functionality
- Proper setup/teardown with test data

## Frontend Improvements

### 1. Memory Leak Fix
**Problem**: `Items.js` could call setState after component unmount.

**Solution**:
- Added cleanup using `AbortController` in `useEffect` to cancel in-flight fetches on unmount
- Proper cleanup function prevents memory leaks
- Enhanced error handling

```javascript
useEffect(() => {
  const ac = new AbortController();
  fetch(url, { signal: ac.signal })
    .then(r => r.json())
    .then(data => setState(data))
    .catch(e => { if (e.name !== 'AbortError') console.error(e); });
  return () => ac.abort();
}, [url]);
```

### 2. Pagination & Search
**Implementation**:
- Server-side search with `q` parameter support
- Client-side debouncing (300ms) for search input
- Pagination controls with proper state management
- Backend returns structured response with pagination metadata

**Trade-offs**:
- Server-side search reduces client memory usage
- Network requests on each search (mitigated by debouncing)
- Simple pagination vs infinite scroll (chosen for clarity)

### 3. Performance - Virtualization
**Solution**: Integrated `react-window` for large lists
- Only renders visible items
- Fixed item height (60px) for predictable performance
- Maintains smooth scrolling even with thousands of items

**Trade-offs**:
- Additional dependency (`react-window`)
- Fixed height items (could be made dynamic if needed)
- Excellent performance for large datasets

### 4. UI/UX Polish
**Enhancements**:
- Loading states and error messaging
- Clean, functional styling without over-engineering
- Responsive search input with proper feedback
- Accessible button states and keyboard navigation

## Architecture Decisions

### Data Context Improvements
- Enhanced with loading states and error handling
- Structured API responses with pagination metadata
- Better separation of concerns

### Error Handling
- Consistent error responses across all endpoints
- Input validation for POST requests
- Proper HTTP status codes

### Code Quality
- Minimal but necessary comments
- Consistent naming conventions
- Proper async/await usage throughout
- Edge case handling (empty arrays, invalid IDs, etc.)

## Testing Strategy

### Backend Tests
- Unit tests for all route handlers
- Mocked file system operations
- Coverage for success and failure scenarios
- Proper test data setup/cleanup

### Frontend Testing
- Could be extended with React Testing Library
- Current focus on functionality over UI testing

## Performance Considerations

### Backend
- File caching reduces I/O operations
- Stats caching prevents repeated calculations
- Async operations prevent blocking

### Frontend
- Virtualization handles large lists efficiently
- Debounced search reduces API calls
- Proper cleanup prevents memory leaks

## Potential Future Improvements

1. **Backend**:
   - Database integration for better scalability
   - Redis caching for multi-instance deployments
   - Rate limiting and request validation middleware

2. **Frontend**:
   - Infinite scroll option
   - Advanced search filters
   - Optimistic updates for better UX

3. **General**:
   - TypeScript for better type safety
   - E2E testing with Cypress/Playwright
   - Docker containerization

## Installation Notes

### New Dependencies Added:
```bash
# Frontend
npm install react-window

# Backend (dev dependencies already included)
# jest, supertest, nodemon
```


### Running Tests:
```bash
# Backend
cd backend && npm test

# Frontend  
cd frontend && npm test
```

### Running the Application
```bash
# Backend
cd backend
npm install
npm start   # serves http://localhost:3001

# Frontend (in a second terminal)
cd frontend
npm install
npm start   # serves http://localhost:3000 and proxies /api to backend
```

### Running Tests (Frontend & Backend)
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../frontend
npm test
```

## Summary

All objectives have been successfully addressed with clean, maintainable code that follows React and Node.js best practices. The solutions balance performance, maintainability, and user experience while keeping complexity manageable for a take-home assessment context.
