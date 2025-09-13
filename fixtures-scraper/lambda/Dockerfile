# Use AWS Lambda base image for Node.js 20
FROM public.ecr.aws/lambda/nodejs:20

# Set working directory to Lambda task root
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy package files
COPY package*.json ./

# Install dependencies (including @sparticuz/chromium which provides the browser)
RUN npm install --omit=dev

# Copy function code
COPY index-lambda.js ./

# Set the handler
CMD ["index-lambda.handler"]