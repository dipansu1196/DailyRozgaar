require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const moment = require('moment');
const cron = require('node-cron');
// Initialize app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SESSION_SECRET,  
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000,secure: false,httpOnly: true}

}));

app.use(express.static(path.join(__dirname,'public')));


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'root',
    database: 'dailyrozgaar'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database!');
});

// File upload setup: Handle multiple files
const upload = multer({
    dest: 'public/image/temporary', 
    limits: { fileSize: 500 * 1024 }, 
}).fields([
    { name: 'uploadImage', maxCount: 1 },
    { name: 'uploadAadharCard', maxCount: 1 }
]);

//generate password
function generatePassword(aadhaar, dob, phone) {
    const yearOfBirth = new Date(dob).getFullYear();
    return aadhaar.substring(0, 4) + yearOfBirth + phone.substring(0, 4);
}

// Check if phone exists in database
function checkPhoneExists(phone, table, callback) {
    db.query(`SELECT * FROM ${table} WHERE phoneNumber = ?`, [phone], (err, results) => {
        if (err) throw err;
        callback(results.length > 0);
    });
}
// Function to check if the email exists
function checkEmailExists(email, table, callback) {
    db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], (err, results) => {
        if (err) throw err;
        callback(results.length > 0);
    });
}
// Check User Exist or not For login
function checkUserExist(phone, table, callback) {
    db.query(`SELECT * FROM ${table} WHERE phoneNumber = ?`, [phone], (err, results) => {
        if (err) throw err;
        callback(results.length > 0 ? results[0] : null);  // Return user if found, or null
    });
}
//Worker Registration
app.post('/register', upload, (req, res) => {
    console.log("Form Data Received: ", req.body); 
    console.log("Occupation: ", req.body.occupation);
    const { fullName, phoneNumber, dob, aadhaarNumber, occupation, address1, zip, state, city, subdivision } = req.body;
    const phone = phoneNumber.trim();
    const aadhaar = aadhaarNumber.replace(/\D/g, '');  
    checkPhoneExists(phone, 'workers', (exists) => {
        if (exists) {
            return res.json({ message:true});
        }

        const password = generatePassword(aadhaar, dob, phone);

        const getFileExtension = (filename) => path.extname(filename);
        const imageFilePath = `image/profile_images/${phone}${getFileExtension(req.files.uploadImage[0].originalname)}`;
        const aadhaarFilePath = `image/aadhaar_cards/${phone}${getFileExtension(req.files.uploadAadharCard[0].originalname)}`;

        if (req.files.uploadImage && req.files.uploadAadharCard) {
            fs.renameSync(req.files.uploadImage[0].path, `public/${imageFilePath}`);
            fs.renameSync(req.files.uploadAadharCard[0].path, `public/${imageFilePath}`);

        }
        const query = `
            INSERT INTO workers 
            (fullName, phoneNumber, dob, aadhaarNumber, occupation, address1, zip, state, city, subdivision, image, aadhaarImage, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [
            fullName, phone, dob, aadhaar, occupation, address1, zip, state, city, subdivision,
            imageFilePath, aadhaarFilePath, password
        ], (err, result) => {
            if (err) throw err;
            console.log('User added to database');
            res.json({ password});
        });
    });
});


//Customer Registration
app.post('/register-customer', upload, (req, res) => {
    console.log("Customer Form Data Received: ", req.body);
    const { fullName, phoneNumber, email, password, zip, state, city, subdivision, address1 } = req.body;
    const phone = phoneNumber.trim();

    checkPhoneExists(phone, 'customers', (exists) => {
        console.log("Phone exists:", exists); 
        if (exists) {
            
            return res.json({ status: 'existing' }); 

        }
        const getFileExtension = (filename) => path.extname(filename);
        const imageFilePath = `image/profile_images/${phone}${getFileExtension(req.files.uploadImage[0].originalname)}`;

        if (req.files.uploadImage) {
            fs.renameSync(req.files.uploadImage[0].path, `public/${imageFilePath}`);
        }
        const query = `
            INSERT INTO customers 
            (fullName, phoneNumber, email, password, profileImage, zip, state, city, subdivision, address1)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [
            fullName, phone, email, password, imageFilePath, zip, state, city, subdivision, address1
        ], (err, result) => {
            if (err) throw err;
            console.log('Customer added to database');
            return res.json({status: 'success' });
        });
    });
});

//Customer Detail Update
app.post('/updateDetails', upload, (req, res) => {
    const { fullName, phoneNumber, email, zip, state, city, subdivision, address1 } = req.body;
    const phone = phoneNumber.trim();
    const customerid=req.session.user.customerid;
    console.log(req.body);

    checkPhoneExists(phone, 'customers', (exists) => {
        if (exists && phone !== req.session.user.phoneNumber) {
            console.log("Phone already exists in the database.");
            return res.json({ status: 'existingPhone' });
        }

        checkEmailExists(email, 'customers', (exists) => {
            if (exists && email !== req.session.user.email) {
                return res.json({ status: 'existingEmail' });
            }

            let updateQuery = `
                UPDATE customers 
                SET fullName = ?, phoneNumber = ?, email = ?, zip = ?, state = ?, city = ?, subdivision = ?, address1 = ? 
                WHERE customerid = ?
            `;
            const params = [fullName, phone, email, zip, state, city, subdivision, address1, customerid];
            console.log("Update Query:", updateQuery);
            console.log("Parameters:", params);
            db.query(updateQuery, params, (err, result) => {
                if (err) throw err;

                // Handle profile image update if available
                if (req.files && req.files.uploadImage) {
                    const imageFilePath = `image/profile_images/${phone}${path.extname(req.files.uploadImage[0].originalname)}`;
                    fs.renameSync(req.files.uploadImage[0].path, `public/${imageFilePath}`);

                    db.query('UPDATE customers SET profileImage = ? WHERE phoneNumber = ?', [imageFilePath, phone], (err, result) => {
                        if (err) throw err;
                        res.json({ status: 'success' });
                    });
                } else {
                    res.json({ status: 'success' });
                }
            });
        });
    });
});

//Worker Detail Update
app.post('/updateWorkerDetails', upload, (req, res) => {
    const { fullName, phoneNumber, dob, zip, state, city, subdivision, address1 } = req.body;
    const phone = phoneNumber.trim();
    const workerid=req.session.user.workerid;
    console.log(req.body);
    checkPhoneExists(phone, 'workers', (exists) => {
        if (exists && phone !== req.session.user.phoneNumber) {
            return res.json({ status: 'existingPhone' });
        }

            let updateQuery = `
                UPDATE workers 
                SET fullName = ?, phoneNumber = ?, dob = ?, zip = ?, state = ?, city = ?, subdivision = ?, address1 = ? 
                WHERE workerid = ?
            `;
            db.query(updateQuery, [fullName, phone, dob, zip, state, city, subdivision, address1, workerid], (err, result) => {
                if (err) throw err;

                if (req.files && req.files.uploadImage) {
                    const imageFilePath = `image/profile_images/${phone}${path.extname(req.files.uploadImage[0].originalname)}`;
                    fs.renameSync(req.files.uploadImage[0].path, `public/${imageFilePath}`);

                    db.query('UPDATE workers SET image = ? WHERE phoneNumber = ?', [imageFilePath, phone], (err, result) => {
                        if (err) throw err;
                        res.json({ status: 'success' });
                    });
                } else {
                    res.json({ status: 'success' });
                }
           
        });
    });
});

//Customer Login
app.post('/customerloginaction', (req, res) => {
    const { customerPhoneNumber, customerpassword } = req.body;  
    const phone = customerPhoneNumber.trim();
    const password = customerpassword.trim();

    checkUserExist(phone, 'customers', (user) => {
        if (user && user.password === password) {
            
            req.session.user = user;
            req.session.role = 'customer';
            console.log("Session Set:", req.session);
            return res.json({ success: true, redirectUrl: '/customerhomepage.html' });
        } else {
            return res.json({ success: false, message: 'Invalid phone number or password' });
        }
    });
});


//Worker Login
app.post('/workerloginaction', (req, res) => { 
    const { workerPhoneNumber, workerpassword, dob } = req.body; 

    const phone = workerPhoneNumber.trim();
    const password = workerpassword.trim();

    checkUserExist(phone, 'workers', (user) => {
        if (user) {
            const userDob = moment(user.dob).format('YYYY-MM-DD');  
            const inputDob = moment(dob).format('YYYY-MM-DD');  

            console.log("Normalized Database Date:", userDob);
            console.log("Normalized Input Date:", inputDob);
            
            if (user.password === password && userDob === inputDob) {
                
                req.session.user = user;
                req.session.role = 'worker';
                return res.json({ success: true, redirectUrl: '/workerhomepage.html' });
            } else {
                return res.json({ success: false, message: 'Invalid phone number or password' });
            }
        } else {
            return res.json({ success: false, message: 'User not found' });
        }
    });
});

//Customer Detail fetch on Profile Page
app.get('/customerprofile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    const userPhone = req.session.user.phoneNumber;
    db.query('SELECT * FROM customers WHERE phoneNumber = ?', [userPhone], (err, results) => {
        if (err) throw err;
        const customer = results[0];
        res.json({
            fullName: customer.fullName,
            phoneNumber: customer.phoneNumber,
            email: customer.email,
            zip: customer.zip,
            state: customer.state,
            city: customer.city,
            subdivision: customer.subdivision, 
            address1: customer.address1,
            profileImage: customer.profileImage });
    });
});

//Worker Detail fetch on Profile Page
app.get('/workerprofile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');  
    }
    const userPhone = req.session.user.phoneNumber;
    db.query('SELECT * FROM workers WHERE phoneNumber = ?', [userPhone], (err, results) => {
        if (err) throw err;
        const worker = results[0];
        console.log('Worker Profile Data:', worker);
        res.json({
            fullName: worker.fullName,
            phoneNumber: worker.phoneNumber,
            dob: worker.dob,
            zip: worker.zip,
            state: worker.state,
            city: worker.city,
            subdivision: worker.subdivision,
            address1: worker.address1,
            image: worker.image }); 
    });
});

//Fetch worker Detail on customer homepage according to selected category
// app.get('/profiles', (req, res) => {
//     const occupation = req.query.category;
//     const zip = req.session.user.zip; 
//     db.query(
//         'SELECT * FROM workers WHERE occupation = ? AND zip = ?',
//         [occupation, zip],
//         (err, results) => {
//             if (err) throw err;
//             res.json(results);
//         }
//     );
// });
app.get('/profiles', (req, res) => {
    const occupation = req.query.category;
    const zip = req.session.user.zip;
    const customerId = req.session.user.customerid; // Assuming customer ID is in session

    const query = `
        SELECT 
            w.*, 
            r.status AS requestStatus 
        FROM workers w
        LEFT JOIN servicerequests r 
        ON w.workerid = r.workerid AND r.customerid = ?
        WHERE w.occupation = ? AND w.zip = ?
    `;

    db.query(query, [customerId, occupation, zip], (err, results) => {
        if (err) throw err;
        console.log("Database query results:", results);
        res.json(results);
    });
});

//Show worker Details on Modal
app.get('/worker/:id', (req, res) => {
    const workerId = req.params.id;
    db.query('SELECT * FROM workers WHERE workerid = ?', [workerId], (err, results) => {
        if (err) throw err;
        const worker = results[0];
        res.json({
            fullName: worker.fullName,
            phoneNumber: worker.phoneNumber,
            image: worker.image,
            workerid: worker.workerid,
            address: `${worker.address1}, ${worker.subdivision}, ${worker.city}, ${worker.state}, ${worker.zip}`
        });
    });
});

//Send Request to worker
app.post('/sendRequests/:workerId', (req, res) => {
    const workerId = req.params.workerId;
    const customerId = req.session.user.customerid;
  
    // Check if a request already exists for this customer and worker
    const checkQuery = 'SELECT * FROM servicerequests WHERE customerid = ? AND workerid = ? AND status = "pending"';
    db.query(checkQuery, [customerId, workerId], (err, result) => {
      if (result.length > 0) {
        return res.status(400).json({ success: false, message: 'Request already sent' });
      }
  
      const query = 'INSERT INTO serviceRequests (customerid, workerid, status) VALUES (?, ?, "pending")';
      db.query(query, [customerId, workerId], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Error sending request' });
        }
        res.status(200).json({ success: true, message: 'Request sent successfully' });
      });
    });
  });

//cancel request
app.post('/cancelRequests/:workerId', (req, res) => {
    const workerId = req.params.workerId;
    const customerId = req.session.user.customerid;
  
    const query = 'UPDATE serviceRequests SET status = "cancelled" WHERE customerid = ? AND workerid = ? AND status = "pending"';
    db.query(query, [customerId, workerId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error cancelling request' });
      }
      res.status(200).json({ success: true, message: 'Request cancelled successfully' });
    });
  });

//Fetch Status of request show on customer homepage
app.get('/checkRequestStatus/:workerId', (req, res) => {
    const workerId = req.params.workerId;
    const customerId = req.session.user.customerid;
    const query = `
        SELECT status FROM serviceRequests 
        WHERE customerid = ? AND workerid = ? 
        AND (status = 'pending' OR status = 'completed')
    `;
    
    db.query(query, [customerId, workerId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error fetching request status' });
        }
        
        if (result.length > 0) {
            const requestStatus = result[0].status;
            return res.status(200).json({ success: true, requestStatus });
        }

        res.status(200).json({ success: true, requestStatus: 'none' });
    });
});

//Fetch request and show on worker homepage
app.get("/workerrequests", (req, res) => {
    const workerId = req.session.user.workerid;
    console.log(workerId);
    const query = `
      SELECT sr.id, sr.status, sr.requestDate, 
             c.customerid, c.fullName, c.phoneNumber, c.profileImage 
      FROM serviceRequests sr
      JOIN customers c ON sr.customerId = c.customerid
      WHERE sr.workerId = ?;
    `;
  
    db.query(query, [workerId], (err, results) => {
      if (err) return handleError(res, err);
      const requests = results.map(request => ({
        id: request.id,
            status: request.status,
            requestDate: request.requestDate,
            fullName: request.fullName,
            phoneNumber: request.phoneNumber,
            profileImage: request.profileImage,
        showContactButton: request.status === 'completed',
        showDeleteButton: request.status === 'accepted'
      }));
  
      res.json({ success: true, requests });
    });
  });

  //Accept Request
  app.post("/worker/request/accept", (req, res) => {
    const { requestId } = req.body;
  
    const query = "UPDATE serviceRequests SET status = 'completed' WHERE id = ?";
    db.query(query, [requestId], (err) => {
      if (err) return handleError(res, err);
      res.json({ success: true, message: "Request accepted successfully" });
    });
  });

  //Reject Request
  app.post("/worker/request/reject", (req, res) => {
    const { requestId } = req.body;
  
    const query = "UPDATE serviceRequests SET status = 'cancelled' WHERE id = ?";
    db.query(query, [requestId], (err) => {
      if (err) return handleError(res, err);
      res.json({ success: true, message: "Request rejected successfully" });
    });
  });

  //Delete Request
  app.post("/worker/request/delete", (req, res) => {
    const { requestId } = req.body;
  
    const query = "DELETE FROM serviceRequests WHERE id = ?";
    db.query(query, [requestId], (err) => {
      if (err) return handleError(res, err);
      res.json({ success: true, message: "Request deleted successfully" });
    });
  });

  //Request delete after seven days
  cron.schedule('0 0 * * *', () => {
    console.log('Running the cleanup job for completed requests older than 7 days');
    
    const query = `
        DELETE FROM serviceRequests 
        WHERE status = 'completed' AND requestDate <= NOW() - INTERVAL 7 DAY
    `;
    
    db.query(query, (err, result) => {
        if (err) {
            console.error("Error deleting old completed requests:", err);
        } else {
            console.log(`${result.affectedRows} old completed requests deleted.`);
        }
    });
});

//load page by default on index.html
app.get('/', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname,'index.html'));
    } else {
        res.sendFile(path.join(__dirname,'index.html'));
    }
});

//redirect to homepage according to user if user try to go on login page
app.get('/login.html', (req, res) => {
    if (req.session.user) {
        
        if (req.session.role === 'customer') {
            console.log("Redirecting Customer");
            return res.redirect('/customerhomepage.html');
        } else if (req.session.role === 'worker') {
            console.log("Redirecting Worker");
            return res.redirect('/workerhomepage.html');
        }
    }

    res.sendFile(path.join(__dirname, 'login.html'));
});


//redirect customer to login page if user not login
app.get('/customerhomepage.html', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');  
    }
    res.sendFile(path.join(__dirname, 'customerhomepage.html'));
});
//redirect Worker to login page if user not login
app.get('/workerhomepage.html', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html'); 
    }
    res.sendFile(path.join(__dirname, 'workerhomepage.html'));
});

//if customer try to registration while already login redirect to customerhomepage
app.get('/Customerregistration.html', (req, res) => {
    if (req.session.user) {
        res.redirect('/customerhomepage.html');
    } else {
        res.sendFile(path.join(__dirname,'Customerregistration.html'));
    }
});

//if Worker try to registration while already login redirect to customerhomepage
app.get('/workerregistration.html', (req, res) => {
    if (req.session.user) {
        res.redirect('/customerhomepage.html');
    } else {
        res.sendFile(path.join(__dirname,'workerregistration.html'));
    }
});

// Logout route to clear the session
app.get('/logout', (req, res) => {
    console.log('Logging out...');
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session', err);
            return res.status(500).send('Failed to log out');
        }
        console.log('Session destroyed');
        res.redirect('/login.html');  
    });
});


const cleanupInterval = 1 * 60 * 1000; 

setInterval(() => {
    const tempDir = 'public/image/temporary';

    // Read the files in the temporary directory
    fs.readdir(tempDir, (err, files) => {
        if (err) throw err;

        files.forEach(file => {
            const filePath = path.join(tempDir, file);
            const fileStat = fs.statSync(filePath);

            // Delete files older than 1 day
            if (Date.now() - fileStat.mtimeMs > cleanupInterval) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting old file:', file);
                    else console.log('Deleted old file:', file);
                });
            }
        });
    });
}, cleanupInterval);  

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
