# GitHub Repository Secrets Setup Guide

## Overview
This guide will help you configure the required GitHub repository secrets for automatic deployment to your devmain.co.ke server.

## Step 1: Access GitHub Repository Secrets

1. Go to your GitHub repository: https://github.com/kibirastephengichigi-bit/website
2. Click on **Settings** tab
3. Click on **Secrets and variables** in the left sidebar
4. Click on **Actions**
5. Click **New repository secret**

## Step 2: Add Required Secrets

### 2.1 Server Connection Secrets

**SERVER_HOST**
```
devmain.co.ke
```

**SERVER_PORT**
```
22
```

**SERVER_USER**
```
deploy
```

**SERVER_APP_DIR**
```
/var/www/website
```

**SERVER_SSH_KEY**
```
-----BEGIN OPENSSH PRIVATE KEY-----
[Your private key content from /var/www/deploy/.ssh/github_deploy_key]
-----END OPENSSH PRIVATE KEY-----
```

### 2.2 Service Names

**FRONTEND_SERVICE**
```
devmain-frontend.service
```

**BACKEND_SERVICE**
```
devmain-backend.service
```

### 2.3 Application Secrets

**DATABASE_URL**
```
postgresql://stephenasatsa_user:secure_password@localhost:5432/stephenasatsa
```

**NEXTAUTH_SECRET**
```
[your-nextauth-secret-key]
```

**NEXTAUTH_URL**
```
https://devmain.co.ke
```

**GOOGLE_CLIENT_ID** (if using Google OAuth)
```
[your-google-client-id]
```

**GOOGLE_CLIENT_SECRET** (if using Google OAuth)
```
[your-google-client-secret]
```

**JWT_SECRET**
```
[your-jwt-secret-key]
```

## Step 3: Get SSH Private Key

### 3.1 On Your Server
```bash
sudo cat /var/www/deploy/.ssh/github_deploy_key
```

### 3.2 Copy the entire output including the BEGIN and END lines
Make sure to copy the complete key including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
[all the key content]
-----END OPENSSH PRIVATE KEY-----
```

## Step 4: Test Configuration

### 4.1 Manual Test
After setting up all secrets, test the deployment manually:

1. Go to **Actions** tab in your GitHub repository
2. Click on **Deploy Website** workflow
3. Click **Run workflow**
4. Select **main** branch
5. Click **Run workflow**

### 4.2 Automatic Test
Make a small change to your code and push to main branch:
```bash
# Make a small change
echo "// Test deployment" >> README.md

# Commit and push
git add README.md
git commit -m "Test automatic deployment"
git push origin main
```

## Step 5: Monitor Deployment

### 5.1 Check GitHub Actions
- Go to **Actions** tab
- Click on the running workflow
- Monitor the logs for any errors

### 5.2 Check Server Status
```bash
# Check services
sudo systemctl status devmain-frontend
sudo systemctl status devmain-backend

# Check logs
sudo journalctl -u devmain-frontend -f
sudo journalctl -u devmain-backend -f
```

## Step 6: Troubleshooting

### Common Issues and Solutions

#### SSH Connection Failed
**Problem**: GitHub Actions cannot connect to your server
**Solution**: 
1. Verify SSH key is correctly added to GitHub deploy keys
2. Check server firewall allows SSH from GitHub IPs
3. Test SSH connection manually

#### Build Failed
**Problem**: Application build fails during deployment
**Solution**:
1. Check environment variables are correct
2. Verify database connection
3. Check Node.js and Python versions

#### Service Won't Start
**Problem**: Services fail to start after deployment
**Solution**:
1. Check systemd logs: `sudo journalctl -u service-name -f`
2. Verify file permissions
3. Check configuration files

#### Database Connection Failed
**Problem**: Application cannot connect to database
**Solution**:
1. Verify PostgreSQL is running
2. Check database credentials
3. Test connection: `psql -h localhost -U stephenasatsa_user -d stephenasatsa`

## Step 7: Security Best Practices

### 7.1 Regular Security Updates
```bash
# Update GitHub secrets regularly
# Rotate SSH keys every 90 days
# Update database passwords regularly
```

### 7.2 Access Control
- Limit who has access to repository secrets
- Use least privilege principle
- Regularly audit access permissions

### 7.3 Monitoring
- Set up alerts for failed deployments
- Monitor server resource usage
- Regular security scans

## Step 8: Advanced Configuration

### 8.1 Environment-Specific Secrets
For different environments (staging, production), you can use:
- Separate branches with different secrets
- Environment-specific secret prefixes
- GitHub environments for better isolation

### 8.2 Rollback Strategy
- Keep previous deployments
- Quick rollback scripts
- Database backup before major changes

### 8.3 Performance Optimization
- Build caching
- Parallel deployments
- Health checks before traffic routing

## Summary

Once you complete this setup:
1. Push to main branch triggers automatic deployment
2. GitHub Actions builds and tests your application
3. Changes are deployed to devmain.co.ke automatically
4. Services are restarted and verified
5. SSL certificates are automatically renewed
6. Database is backed up daily

Your CI/CD pipeline will be fully automated and ready for production use!
