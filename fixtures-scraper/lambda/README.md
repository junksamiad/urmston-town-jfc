# AWS Lambda Deployment - Urmston Fixtures Scraper

## Overview
This directory contains the AWS Lambda implementation for automated fixture scraping. It replaces the problematic GitHub Actions approach with a reliable containerized Lambda function.

## Architecture
```
EventBridge (9 AM & 3 PM) → Lambda Container → FA Widget → PHP API → MySQL Database
```

## Files
- `index-lambda.js` - Main Lambda handler function
- `Dockerfile` - Container definition with Chrome dependencies
- `package.json` - Node.js dependencies
- `deploy.sh` - Automated deployment script
- `test-local.js` - Local testing script
- `.env.example` - Environment variables template

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **AWS CLI**: Install and configure AWS CLI
   ```bash
   brew install awscli  # macOS
   aws configure        # Set up credentials
   ```
3. **Docker**: Install Docker Desktop for building containers
4. **Node.js 20+**: For local testing

## Quick Start

### 1. Set Environment Variables
```bash
cd fixtures-scraper/lambda
cp .env.example .env
# Edit .env with your API token
export API_TOKEN=a8f3d2b1c9e4f7a6d5b8c3e2f1a9b4c7
```

### 2. Deploy to AWS
```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
- Create ECR repository
- Build and push Docker image
- Create/update Lambda function
- Set up EventBridge schedules (9 AM & 3 PM)
- Configure environment variables

### 3. Test Manually
```bash
# Test Lambda function
aws lambda invoke --function-name urmston-fixtures-scraper output.json
cat output.json

# Check logs
aws logs tail /aws/lambda/urmston-fixtures-scraper --follow
```

## Local Testing

### Install Dependencies
```bash
npm install
```

### Run Local Test
```bash
npm test
# or
node test-local.js
```

## AWS Resources Created

1. **ECR Repository**: `urmston-fixtures-scraper`
2. **Lambda Function**: `urmston-fixtures-scraper`
3. **IAM Role**: `urmston-fixtures-scraper-role`
4. **EventBridge Rules**:
   - `urmston-fixtures-09-00` (9 AM UTC)
   - `urmston-fixtures-15-00` (3 PM UTC)
5. **CloudWatch Logs**: `/aws/lambda/urmston-fixtures-scraper`

## Configuration

### Lambda Settings
- **Memory**: 1024 MB
- **Timeout**: 120 seconds (2 minutes)
- **Runtime**: Container (Node.js 20)
- **Architecture**: x86_64

### Environment Variables
```
WIDGET_URL=https://pages.urmstontownjfc.co.uk/fa-widget.html
API_URL=https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php
API_TOKEN=<your-secret-token>
```

## Monitoring

### View Logs
```bash
# Tail logs in real-time
aws logs tail /aws/lambda/urmston-fixtures-scraper --follow

# Get last 10 log streams
aws logs describe-log-streams \
  --log-group-name /aws/lambda/urmston-fixtures-scraper \
  --order-by LastEventTime \
  --descending \
  --limit 10
```

### Check Invocations
```bash
# List recent invocations
aws lambda list-function-event-invoke-configs \
  --function-name urmston-fixtures-scraper
```

### AWS Console
View function details, metrics, and logs at:
```
https://eu-west-2.console.aws.amazon.com/lambda/home?region=eu-west-2#/functions/urmston-fixtures-scraper
```

## Costs

### Estimated Monthly Costs
- **Lambda Invocations**: 60 × $0.0000002 = $0.000012
- **Lambda Duration**: 60 × 30s × 1GB × $0.0000166667 = $0.03
- **ECR Storage**: 1GB × $0.10 = $0.10
- **Total**: ~$0.13/month

### AWS Free Tier
First year includes:
- 1 million Lambda requests free
- 400,000 GB-seconds free
- **Actual cost**: $0 for first year

## Troubleshooting

### Common Issues

1. **Deployment fails with permissions error**
   ```bash
   # Ensure AWS CLI is configured
   aws sts get-caller-identity
   ```

2. **Docker build fails**
   ```bash
   # Ensure Docker is running
   docker info
   ```

3. **Lambda timeout**
   - Increase timeout in deploy.sh (currently 120 seconds)
   - Check CloudWatch logs for bottlenecks

4. **No fixtures found**
   - Check if FA widgets are loading
   - Verify selectors in index-lambda.js
   - Test widget URL directly in browser

### Manual Lambda Update
```bash
# Update function code only
docker build -t urmston-fixtures-scraper .
docker tag urmston-fixtures-scraper:latest $ECR_URI:latest
docker push $ECR_URI:latest
aws lambda update-function-code \
  --function-name urmston-fixtures-scraper \
  --image-uri $ECR_URI:latest
```

### Delete Resources
```bash
# Remove Lambda function
aws lambda delete-function --function-name urmston-fixtures-scraper

# Remove EventBridge rules
aws events delete-rule --name urmston-fixtures-09-00
aws events delete-rule --name urmston-fixtures-15-00

# Remove ECR repository
aws ecr delete-repository --repository-name urmston-fixtures-scraper --force

# Remove IAM role
aws iam detach-role-policy \
  --role-name urmston-fixtures-scraper-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name urmston-fixtures-scraper-role
```

## Security

### API Token
- Store API_TOKEN as Lambda environment variable
- Never commit tokens to version control
- Rotate tokens periodically

### IAM Permissions
Lambda function has minimal permissions:
- Write to CloudWatch Logs
- No access to other AWS services

## Support

For issues or questions:
1. Check CloudWatch logs for errors
2. Review this README
3. Test locally with test-local.js
4. Contact team lead if issues persist

## Success Metrics

✅ Function deployed successfully when:
- Lambda invokes without errors
- 38+ fixtures scraped per run
- Data appears in Hostinger database
- Costs remain under $1/month
- Scheduled runs execute at 9 AM and 3 PM