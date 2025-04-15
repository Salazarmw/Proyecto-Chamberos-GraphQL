# Chamberos GraphQL API

This is the GraphQL API for the Chamberos platform, providing a flexible and efficient way to query and mutate data.

## Features

- GraphQL API for Chamberos platform
- MongoDB integration
- JWT Authentication
- Social Authentication (Google, Facebook)
- AWS S3 integration for image uploads
- Real-time updates

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- AWS Account (for S3)
- Google Developer Account (for OAuth)
- Facebook Developer Account (for OAuth)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `PORT`: Server port (default: 4000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `AWS_BUCKET_NAME`: S3 bucket name
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `FACEBOOK_APP_ID`: Facebook App ID
- `FACEBOOK_APP_SECRET`: Facebook App Secret

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm test`: Run tests

## API Documentation

The GraphQL API documentation is available at `/graphql` when the server is running.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 