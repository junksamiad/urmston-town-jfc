# Testing Philosophy - Position Statement

## Core Principle: Pragmatic Validation Over Comprehensive Coverage

### Testing Approach

**We prioritize rapid, real-world validation over traditional test coverage metrics.**

Our testing strategy focuses on answering one simple question: "Does it actually work?" We achieve this through minimal, high-value integration tests that interact with real systems rather than mocked dependencies.

### Implementation Guidelines

1. **One Integration Test Per Story**
   - Write a single test that proves the feature works end-to-end
   - Use real databases, real APIs, real browsers - no mocks
   - Test implementation should take 5 minutes maximum
   - Clean up test data after execution

2. **Context-Based Testing Selection**
   - **Database changes**: Create/read/update/delete real records
   - **API endpoints**: Simple fetch/curl to verify response status
   - **UI flows**: Playwright E2E for critical user paths only
   - **Business logic**: Smoke test the happy path, skip edge cases

3. **What We Explicitly Avoid**
   - ❌ Mocking databases or external services
   - ❌ Unit tests for every function
   - ❌ Complex test fixtures or factories
   - ❌ Edge case testing during development
   - ❌ Test coverage metrics as goals
   - ❌ Tests that take longer to write than the feature

4. **What We Always Do**
   - ✅ Write one "proof of life" test per story
   - ✅ Use real services and connections
   - ✅ Keep tests simple enough to write in one attempt
   - ✅ Focus on user-facing functionality
   - ✅ Clean up test data to maintain idempotency

### Example Test Pattern

```typescript
// Good: One simple integration test
it('should create and retrieve admin user', async () => {
  const user = await createRealUser()
  const retrieved = await fetchUser(user.id)
  expect(retrieved).toBeDefined()
  await deleteUser(user.id)
})

// Avoid: Multiple unit tests with mocks
it('should validate email format')
it('should hash password correctly')
it('should emit user created event')
// ... 20 more tests
```

### Rationale

This approach optimizes for:
- **Development velocity**: More time building, less time testing
- **Confidence**: Real integration tests catch real problems
- **Maintainability**: Fewer tests to update when requirements change
- **Pragmatism**: Perfect test coverage is not the goal; working software is

### When to Expand Testing

Only add additional tests when:
- A production bug occurs (add regression test)
- A critical business flow needs protection
- External stakeholders require specific validations
- Performance benchmarks need monitoring

### Tools of Choice

- **Database Testing**: Direct Prisma client calls
- **API Testing**: Native fetch or curl commands
- **UI Testing**: Playwright MCP for E2E flows
- **Performance**: Production monitoring over test benchmarks

---

*This philosophy prioritizes shipping working features quickly while maintaining sufficient confidence through strategic integration testing. We test like users use the system, not like computers process code.*