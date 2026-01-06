Setting Up :- <br />
BE : <br />
cd server <br />
npm install <br />
npm run dev <br />
<br />
FE: <br />
npm install <br />
npm run dev  <br />
<br />
Steps to Create Admin : <br/>
Url : http://localhost:8080/api/admin/create <br/>
Post Request <br/>
req.body :  <br/>
{ <br/>
  "email": "abhinavjoshi1798@gmail.com",  <br/>
  "password": "admin123", <br/>
  "name": "Admin User", <br/>
  "secretKey": "ADMIN_SECRET_KEY_123" <br />
}

