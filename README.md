# ShopKart

A small full stack shopping site I built for my lab. You can register, log in, browse
products, add stuff to your wishlist and cart, and place an order with Razorpay.

## Tech used

- Backend: Node.js, Express, MongoDB, Mongoose, bcrypt, jsonwebtoken, cookie-parser
- Frontend: React (Vite), React Router, Axios

## Folder layout

```
ShopKart/
  backend/
    controllers/
    models/
    routes/
    middlewares/
    utils/
    config/
    index.js
  frontend/
    src/
      pages/
      components/
      context/
      services/
```

## Env variables

Backend (`backend/.env`):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Frontend (`frontend/.env`):

```
VITE_API_URL=http://localhost:5000
```

For payments I made a Test Mode account on Razorpay and copied the keys from the
dashboard. `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` go into `backend/.env`. The
key id is sent to the checkout page, the secret stays only on the server. The
Razorpay popup only opens after you hit continue on the checkout form, nothing
happens before that.

## Running the backend

```
cd backend
copy .env.example .env
npm install
npm run dev
```

Fill in `MONGO_URI` and `JWT_SECRET` in `backend/.env` before starting.

## Running the frontend

```
cd frontend
copy .env.example .env
npm install
npm run dev
```

Then open http://localhost:5173

Frontend and backend are two separate folders so keep both terminals running side
by side, else the api calls just fail.

## Api endpoints

| Method | Endpoint | Auth | What it does |
|--------|----------|------|--------------|
| POST | /customers/register | No | Register a customer |
| POST | /customers/login | No | Login and set the jwt cookie |
| GET | /customers/me | Yes | Get the logged in customer |
| POST | /customers/logout | Yes | Clear the jwt cookie |
| POST | /orders/create-payment-order | Yes | Create the order + razorpay payment session |
| POST | /orders/verify-payment | Yes | Check the razorpay signature and finish the order |
| GET | /orders | Yes | List the current user orders |
| GET | /orders/:id | Yes | Get one order |

## How login works

1. Login -> backend checks the bcrypt password
2. Backend makes a jwt
3. Jwt is stored in an HttpOnly cookie called `token`
4. Axios sends the cookie automatically (`withCredentials: true`)
5. Auth middleware checks the jwt on protected routes
6. Then `GET /customers/me` returns the customer
