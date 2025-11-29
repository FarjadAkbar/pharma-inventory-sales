# Development Guidelines

## Overview
This document outlines the development guidelines and standards for the Ziauddin Hospital Pharma System frontend implementation.

## Development Standards

### Code Organization
- Use TypeScript throughout the application
- Follow Next.js 14 App Router conventions
- Implement proper error boundaries and loading states
- Use consistent naming conventions (camelCase for variables, PascalCase for components)

### Component Standards
- Create reusable components in `components/ui/`
- Use Shadcn/ui as the base component library
- Implement proper prop types and interfaces
- Follow single responsibility principle

### API Integration
- Use centralized API services for all backend communication
- **Use direct backend API calls instead of proxy APIs** - Call backend endpoints directly through `apiService`
- Implement automatic JWT token management
- Handle errors consistently across the application
- Use proper loading states and user feedback

**Direct API Usage Pattern:**
```typescript
// ✅ CORRECT: Direct backend API call
const response = await apiService.getUsers({ search: query, page: 1 })

// ❌ AVOID: Proxy API calls (unless specifically needed)
const response = await fetch('/api/users')
```

### Authentication & Security
- Implement JWT-based authentication
- Use middleware for route protection
- Implement permission-based UI rendering
- Follow security best practices

### UI/UX Standards
- Maintain consistent design system with orange theme
- Implement responsive design for all screen sizes
- Provide clear user feedback for all actions
- Follow accessibility guidelines

## Phase Implementation Order

1. **Phase 1**: Authentication Foundation
2. **Phase 2**: Core UI Components
3. **Phase 3**: Master Data Management
4. **Phase 4**: Procurement Module
5. **Phase 5**: Quality Control Module
6. **Phase 6**: Quality Assurance Module
7. **Phase 7**: Manufacturing Module
8. **Phase 8**: Warehouse Operations
9. **Phase 9**: Distribution & Sales
10. **Phase 10**: User Management
11. **Phase 11**: Reporting & Analytics
12. **Phase 12**: Bug Fixes & Form Actions
13. **Phase 13**: Missing Pages Implementation
14. **Phase 14**: Permission-Based Visibility
15. **Phase 15**: End-to-End Integration
16. **Phase 16**: API Integration

## Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Form validation testing
- API integration testing

### Integration Testing
- End-to-end user workflows
- Cross-browser compatibility
- Mobile responsiveness

### User Acceptance Testing
- Role-based scenario testing
- Performance testing with large datasets
- Accessibility compliance testing

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Authentication flow verified
- [ ] All phases implemented and tested
- [ ] Performance optimization completed
- [ ] Security audit passed
- [ ] Documentation updated
