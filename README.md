# retro-v

This is a simple CRUD backend for vinyl shop e-commerce with AWS S3 and RDS implementation

## Usage
### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ziqu98/retro-v-backend.git
   ```

2. **Install Node Modules:**
   ```bash
   npm install
   ```

3. **Create .env File:**
   Duplicate the `.env.example` file and name it `.env`. Fill in the configuration values according to your requirements.
   ```env
   # Example .env

   # Port Number
   PORT='your-port-number'

   # Database Connection
   DB_HOST='your-rds-endpoint.amazonaws.com'
   DB_USER='your-db-username'
   DB_PASSWORD='your-db-password'
   DB_DATABASE='your-db-name'

   # AWS Secrets
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=your-region
   AWS_BUCKET_NAME=your-s3-bucket-name
   ```
    

4. **Run the Application:**
   ```bash
   npm run start
   ```

   The application can now be accessed at `http://localhost:<PORT>`.