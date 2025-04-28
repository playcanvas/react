# Testing Guidelines

## Structure
- `utils/`: Test utilities and helper functions
- `constants.ts`: Shared test constants and fixtures
- `setup.ts`: Global test setup and configuration

## Best Practices

### 1. Test Organization
- Tests should be co-located with their components
- Use descriptive test names that explain the behavior being tested
- Group related tests using `describe` blocks
- Use `beforeEach` and `afterEach` for setup and cleanup

### 2. Test Utilities
- Use `renderWithProviders` for components that need the Application context
- Use shared mock functions from `utils/index.ts`
- Use test constants from `constants.ts` for consistent test data

### 3. Mocking
- Mock external dependencies using `vi.mock()`
- Use `vi.clearAllMocks()` in `afterEach` to ensure clean state
- Mock only what's necessary for the test

### 4. Testing Patterns
```typescript
describe('Component', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### 5. Coverage
- Maintain minimum coverage thresholds:
  - Lines: 80%
  - Functions: 80%
  - Branches: 80%
  - Statements: 80%

### 6. Custom Matchers
- Use `toHaveBeenCalledWithProps` to verify mock calls with specific props
- Extend with additional matchers as needed

## Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
``` 