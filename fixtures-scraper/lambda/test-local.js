// Local test script for Lambda function
// This allows testing the Lambda handler locally before deployment

require('dotenv').config();

// Import the Lambda handler
const { handler } = require('./index-lambda');

// Mock Lambda event
const mockEvent = {
  source: 'local-test',
  time: new Date().toISOString()
};

// Mock Lambda context
const mockContext = {
  functionName: 'urmston-fixtures-scraper',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:aws:lambda:eu-west-2:123456789:function:urmston-fixtures-scraper',
  memoryLimitInMB: '1024',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/urmston-fixtures-scraper',
  logStreamName: '2025/01/13/[$LATEST]test',
  getRemainingTimeInMillis: () => 120000
};

// Run the test
async function testLambda() {
  console.log('🧪 Testing Lambda function locally...');
  console.log('================================');

  try {
    const result = await handler(mockEvent, mockContext);

    console.log('\n✅ Lambda execution completed');
    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.statusCode === 200) {
      const body = JSON.parse(result.body);
      console.log('\n📊 Summary:');
      console.log(`   Fixtures found: ${body.fixturesFound}`);
      console.log(`   Success: ${body.success}`);
      console.log(`   Timestamp: ${body.timestamp}`);
    } else {
      console.log('\n❌ Lambda returned error status:', result.statusCode);
    }

  } catch (error) {
    console.error('\n❌ Lambda execution failed:', error);
    process.exit(1);
  }
}

// Check environment variables
console.log('🔧 Environment Check:');
console.log(`   WIDGET_URL: ${process.env.WIDGET_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`   API_URL: ${process.env.API_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`   API_TOKEN: ${process.env.API_TOKEN ? '✅ Set' : '❌ Not set'}`);
console.log('');

// Run test
testLambda();