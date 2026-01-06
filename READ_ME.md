Steps to run server:-
1. cd ./server 
2. npm install 
3. Write .env file. It requires below fields 
PORT = 8080
MONGO_URL = mongodb://localhost:27017/task-management
JWT_SECRET_KEY = krishna
FRONTEND_URL = http://localhost:3000
EMAIL_ID = abhinavjoshi1798@gmail.com
EMAIL_PASSWORD = jfxz zpjq pltu htsf
ADMIN_SECRET_KEY = ADMIN_SECRET_KEY_123
REDIS_HOST = localhost
REDIS_PORT = 6379
4. Command to run server
npm run dev

Steps to run Frontend:-
1. cd ./fe
2. npm install
3. write .env file. It requires below fields
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8080
4. npm run dev