# Security Policy

## Security Summary

The CarPool application has been designed with security as a priority. This document outlines the security measures implemented and guidance for secure deployment.

## Security Features Implemented

### Authentication & Authorization
- **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
- **JWT Tokens**: Stateless authentication using JSON Web Tokens
- **Token Expiration**: Configurable token expiration (default: 7 days)
- **Protected Routes**: Authentication required for sensitive operations
- **Authorization Checks**: Users can only access/modify their own resources

### Rate Limiting
- **Global Rate Limiting**: 100 requests per 15 minutes per IP for all API endpoints
- **Authentication Rate Limiting**: 5 login/register attempts per 15 minutes per IP
- **DDoS Protection**: Prevents brute force and denial-of-service attacks

### CORS Configuration
- **Environment-Based**: Different CORS policies for development and production
- **Production Default**: Restricted to specific domain (configurable)
- **Development Mode**: Can use wildcard for local testing only
- **Recommendation**: Always set CORS_ORIGIN to your frontend domain in production

### Database Security
- **SQL Injection Prevention**: All queries use parameterized statements
- **Connection Pooling**: Secure database connection management
- **Foreign Key Constraints**: Data integrity enforcement
- **Cascade Deletions**: Proper cleanup of related records

### Input Validation
- **Request Validation**: express-validator ready for additional validation
- **Type Checking**: Proper data type validation in controllers
- **Constraint Checks**: Database constraints for data integrity

### Session Management
- **Stateless**: JWT-based authentication doesn't require server-side sessions
- **Token Storage**: Client-side token storage with HttpOnly cookie option available
- **No Credentials in Code**: Environment variables for sensitive data

## Known Security Considerations

### CORS Configuration (Low Risk)
- **Issue**: CORS origin can be set to wildcard in development
- **Mitigation**: 
  - Production mode defaults to specific domain
  - Wildcard only used when explicitly set in development
  - Documented in configuration guide
- **Recommendation**: Always set CORS_ORIGIN to your specific frontend domain in production

### Rate Limiting Bypass
- **Issue**: Rate limiting is IP-based and can be bypassed with distributed requests
- **Mitigation**: Current limits are reasonable for normal use
- **Future Enhancement**: Consider implementing API key-based rate limiting

## Security Best Practices for Deployment

### Environment Configuration
```bash
# Use strong JWT secret (minimum 32 characters)
JWT_SECRET=use_a_very_long_random_string_here_minimum_32_chars

# Set NODE_ENV to production
NODE_ENV=production

# Restrict CORS to your frontend domain
CORS_ORIGIN=https://your-frontend-domain.com

# Use secure database credentials
DB_PASSWORD=strong_database_password
```

### HTTPS/SSL
- Always use HTTPS in production
- Use a reverse proxy (nginx, Apache) with SSL certificates
- Redirect all HTTP traffic to HTTPS
- Consider using Let's Encrypt for free SSL certificates

### Database Security
```bash
# Create dedicated database user with limited privileges
CREATE USER carpool_app WITH PASSWORD 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO carpool_app;

# Don't use default postgres user in production
# Restrict database access to application server only
```

### Additional Security Measures
1. **Firewall**: Configure firewall to only allow necessary ports
2. **Monitoring**: Set up logging and monitoring for suspicious activity
3. **Backups**: Regular database backups with encryption
4. **Updates**: Keep dependencies updated
5. **Secrets Management**: Use secrets management service (AWS Secrets Manager, etc.)

### Docker Security
```bash
# Don't run as root
USER node

# Use specific versions, not latest
FROM node:18-alpine

# Scan images for vulnerabilities
docker scan carpool-app
```

## Reporting Security Issues

If you discover a security vulnerability, please:
1. **DO NOT** open a public issue
2. Email security concerns to: [your-security-email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Checklist for Production

- [ ] Set strong JWT_SECRET (minimum 32 characters)
- [ ] Set NODE_ENV=production
- [ ] Configure specific CORS_ORIGIN (no wildcards)
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Database backups enabled
- [ ] Rate limiting configured appropriately
- [ ] Remove or secure debug endpoints
- [ ] Review and minimize exposed ports

## Dependency Security

All dependencies are regularly checked for vulnerabilities using GitHub Advisory Database and npm audit.

**Note**: Always verify current dependency security status by running:
```bash
npm audit
```

At the time of initial deployment, all major dependencies were verified to have no known vulnerabilities. However, new vulnerabilities may be discovered over time, so regular checks are essential.

## Security Testing

### Automated Testing
```bash
# Check for dependency vulnerabilities
npm audit

# Run security linting
npm run lint

# Static analysis with CodeQL (if available)
```

### Manual Testing
- Test authentication flows
- Verify authorization checks
- Test rate limiting
- Attempt SQL injection
- Test CORS configuration
- Verify error messages don't leak sensitive info

## Future Security Enhancements

Planned security improvements:
1. Two-factor authentication (2FA)
2. Email verification for new accounts
3. Account lockout after failed attempts
4. IP-based geolocation restrictions (optional)
5. Content Security Policy (CSP) headers
6. Additional security headers (Helmet.js)
7. API key authentication for third-party integrations
8. Audit logging for sensitive operations

## Compliance

This application implements security best practices aligned with:
- OWASP Top 10 guidelines
- Node.js security best practices
- PostgreSQL security recommendations
- JWT security guidelines

## Security Review Status

Last Security Review: 2024
CodeQL Analysis: Passed with documented considerations
Dependency Audit: Clean (no vulnerabilities)
Security Fixes Applied:
- Rate limiting implemented (all endpoints)
- CORS configuration hardened
- Authentication rate limiting added

## Contact

For security-related questions or concerns, please refer to the contributing guidelines or contact the maintainers.

---

**Note**: This security policy is subject to updates as new security features are implemented or vulnerabilities are discovered.
