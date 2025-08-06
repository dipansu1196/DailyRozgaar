-- Create workers table
CREATE TABLE workers (
    workerid SERIAL PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(15) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    aadhaarNumber VARCHAR(12) NOT NULL,
    occupation VARCHAR(100) NOT NULL,
    address1 TEXT NOT NULL,
    zip VARCHAR(10) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    subdivision VARCHAR(100) NOT NULL,
    image TEXT,
    aadhaarImage TEXT,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE customers (
    customerid SERIAL PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profileImage TEXT,
    zip VARCHAR(10) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    subdivision VARCHAR(100) NOT NULL,
    address1 TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create servicerequests table
CREATE TABLE servicerequests (
    id SERIAL PRIMARY KEY,
    customerid INTEGER REFERENCES customers(customerid),
    workerid INTEGER REFERENCES workers(workerid),
    status VARCHAR(20) DEFAULT 'pending',
    requestDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);