require('dotenv').config();
require('express-async-errors');

//security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

const express = require('express');
const app = express();


const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');

//routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1);//Ensures that the rate limiter correctly identifies the client’s IP address.
app.use(rateLimiter({//Prevents brute-force attacks and DDoS attacks by limiting excessive requests & from being overwhelmed by too many requests.
  windowMs : 15 * 60 * 1000,// 15 minutes
  max : 100// Limit each IP to 100 requests per windowMs
}))
app.use(express.json());
app.use(helmet());//secure your Express app by setting various HTTP headers.
app.use(cors());//middleware that allows or restricts requests from different origins (domains).
app.use(xss());//It cleanses data in req.body, req.query, and req.params by removing or encoding malicious scripts.


// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
