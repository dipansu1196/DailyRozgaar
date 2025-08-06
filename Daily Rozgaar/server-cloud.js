require('dotenv').config();
const express = require('express');
const supabase = require('./config/database');
const cloudinary = require('./config/cloudinary');
const multer = require('multer');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const moment = require('moment');
const cron = require('node-cron');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,  
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000, secure: false, httpOnly: true }
}));

app.use(express.static(path.join(__dirname,'public')));

// Multer for handling file uploads (memory storage for Cloudinary)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 }
}).fields([
    { name: 'uploadImage', maxCount: 1 },
    { name: 'uploadAadharCard', maxCount: 1 }
]);

// Upload to Cloudinary
async function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: folder },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        ).end(buffer);
    });
}

// Generate password
function generatePassword(aadhaar, dob, phone) {
    const yearOfBirth = new Date(dob).getFullYear();
    return aadhaar.substring(0, 4) + yearOfBirth + phone.substring(0, 4);
}

// Check if phone exists
async function checkPhoneExists(phone, table) {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('phoneNumber', phone);
    
    if (error) throw error;
    return data.length > 0;
}

// Check if email exists
async function checkEmailExists(email, table) {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('email', email);
    
    if (error) throw error;
    return data.length > 0;
}

// Check user exists for login
async function checkUserExist(phone, table) {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('phoneNumber', phone);
    
    if (error) throw error;
    return data.length > 0 ? data[0] : null;
}

// Worker Registration
app.post('/register', upload, async (req, res) => {
    try {
        const { fullName, phoneNumber, dob, aadhaarNumber, occupation, address1, zip, state, city, subdivision } = req.body;
        const phone = phoneNumber.trim();
        const aadhaar = aadhaarNumber.replace(/\D/g, '');

        const exists = await checkPhoneExists(phone, 'workers');
        if (exists) {
            return res.json({ message: true });
        }

        const password = generatePassword(aadhaar, dob, phone);

        // Upload images to Cloudinary
        const imageUrl = await uploadToCloudinary(req.files.uploadImage[0].buffer, 'profile_images');
        const aadhaarUrl = await uploadToCloudinary(req.files.uploadAadharCard[0].buffer, 'aadhaar_cards');

        const { data, error } = await supabase
            .from('workers')
            .insert([{
                fullName, phoneNumber: phone, dob, aadhaarNumber: aadhaar, occupation,
                address1, zip, state, city, subdivision, image: imageUrl, aadhaarImage: aadhaarUrl, password
            }]);

        if (error) throw error;
        res.json({ password });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Customer Registration
app.post('/register-customer', upload, async (req, res) => {
    try {
        const { fullName, phoneNumber, email, password, zip, state, city, subdivision, address1 } = req.body;
        const phone = phoneNumber.trim();

        const exists = await checkPhoneExists(phone, 'customers');
        if (exists) {
            return res.json({ status: 'existing' });
        }

        const imageUrl = await uploadToCloudinary(req.files.uploadImage[0].buffer, 'profile_images');

        const { data, error } = await supabase
            .from('customers')
            .insert([{
                fullName, phoneNumber: phone, email, password, profileImage: imageUrl,
                zip, state, city, subdivision, address1
            }]);

        if (error) throw error;
        res.json({ status: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Customer Login
app.post('/customerloginaction', async (req, res) => {
    try {
        const { customerPhoneNumber, customerpassword } = req.body;
        const phone = customerPhoneNumber.trim();
        const password = customerpassword.trim();

        const user = await checkUserExist(phone, 'customers');
        if (user && user.password === password) {
            req.session.user = user;
            req.session.role = 'customer';
            return res.json({ success: true, redirectUrl: '/customerhomepage.html' });
        } else {
            return res.json({ success: false, message: 'Invalid phone number or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Worker Login
app.post('/workerloginaction', async (req, res) => {
    try {
        const { workerPhoneNumber, workerpassword, dob } = req.body;
        const phone = workerPhoneNumber.trim();
        const password = workerpassword.trim();

        const user = await checkUserExist(phone, 'workers');
        if (user) {
            const userDob = moment(user.dob).format('YYYY-MM-DD');
            const inputDob = moment(dob).format('YYYY-MM-DD');

            if (user.password === password && userDob === inputDob) {
                req.session.user = user;
                req.session.role = 'worker';
                return res.json({ success: true, redirectUrl: '/workerhomepage.html' });
            } else {
                return res.json({ success: false, message: 'Invalid credentials' });
            }
        } else {
            return res.json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get profiles
app.get('/profiles', async (req, res) => {
    try {
        const occupation = req.query.category;
        const zip = req.session.user.zip;
        const customerId = req.session.user.customerid;

        const { data, error } = await supabase
            .from('workers')
            .select(`
                *,
                servicerequests!left(status)
            `)
            .eq('occupation', occupation)
            .eq('zip', zip);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
});

// Get worker details
app.get('/worker/:id', async (req, res) => {
    try {
        const workerId = req.params.id;
        const { data, error } = await supabase
            .from('workers')
            .select('*')
            .eq('workerid', workerId)
            .single();

        if (error) throw error;
        res.json({
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            image: data.image,
            workerid: data.workerid,
            address: `${data.address1}, ${data.subdivision}, ${data.city}, ${data.state}, ${data.zip}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch worker details' });
    }
});

// Send request
app.post('/sendRequests/:workerId', async (req, res) => {
    try {
        const workerId = req.params.workerId;
        const customerId = req.session.user.customerid;

        const { data: existing } = await supabase
            .from('servicerequests')
            .select('*')
            .eq('customerid', customerId)
            .eq('workerid', workerId)
            .eq('status', 'pending');

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Request already sent' });
        }

        const { data, error } = await supabase
            .from('servicerequests')
            .insert([{ customerid: customerId, workerid: workerId, status: 'pending' }]);

        if (error) throw error;
        res.json({ success: true, message: 'Request sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send request' });
    }
});

// Cancel request
app.post('/cancelRequests/:workerId', async (req, res) => {
    try {
        const workerId = req.params.workerId;
        const customerId = req.session.user.customerid;

        const { data, error } = await supabase
            .from('servicerequests')
            .update({ status: 'cancelled' })
            .eq('customerid', customerId)
            .eq('workerid', workerId)
            .eq('status', 'pending');

        if (error) throw error;
        res.json({ success: true, message: 'Request cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to cancel request' });
    }
});

// Check request status
app.get('/checkRequestStatus/:workerId', async (req, res) => {
    try {
        const workerId = req.params.workerId;
        const customerId = req.session.user.customerid;

        const { data, error } = await supabase
            .from('servicerequests')
            .select('status')
            .eq('customerid', customerId)
            .eq('workerid', workerId)
            .in('status', ['pending', 'completed']);

        if (error) throw error;
        
        if (data.length > 0) {
            return res.json({ success: true, requestStatus: data[0].status });
        }
        
        res.json({ success: true, requestStatus: 'none' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch request status' });
    }
});

// Get customer profile
app.get('/customerprofile', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login.html');
        }
        
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('phoneNumber', req.session.user.phoneNumber)
            .single();

        if (error) throw error;
        res.json({
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            email: data.email,
            zip: data.zip,
            state: data.state,
            city: data.city,
            subdivision: data.subdivision,
            address1: data.address1,
            profileImage: data.profileImage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Get worker profile
app.get('/workerprofile', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login.html');
        }
        
        const { data, error } = await supabase
            .from('workers')
            .select('*')
            .eq('phoneNumber', req.session.user.phoneNumber)
            .single();

        if (error) throw error;
        res.json({
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            dob: data.dob,
            zip: data.zip,
            state: data.state,
            city: data.city,
            subdivision: data.subdivision,
            address1: data.address1,
            image: data.image
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Routes for static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/workerregistration.html', (req, res) => {
    if (req.session.user) {
        return res.redirect('/workerhomepage.html');
    }
    res.sendFile(path.join(__dirname, 'workerregistration.html'));
});

app.get('/Customerregistration.html', (req, res) => {
    if (req.session.user) {
        return res.redirect('/customerhomepage.html');
    }
    res.sendFile(path.join(__dirname, 'Customerregistration.html'));
});

app.get('/login.html', (req, res) => {
    if (req.session.user) {
        if (req.session.role === 'customer') {
            return res.redirect('/customerhomepage.html');
        } else if (req.session.role === 'worker') {
            return res.redirect('/workerhomepage.html');
        }
    }
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/customerhomepage.html', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'customerhomepage.html'));
});

app.get('/workerhomepage.html', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'workerhomepage.html'));
});

// Get worker requests
app.get('/workerrequests', async (req, res) => {
    try {
        if (!req.session.user || req.session.role !== 'worker') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const workerId = req.session.user.workerid;
        const { data, error } = await supabase
            .from('servicerequests')
            .select(`
                *,
                customers(fullName, phoneNumber, profileImage)
            `)
            .eq('workerid', workerId)
            .neq('status', 'cancelled');

        if (error) throw error;
        
        const requests = data.map(request => ({
            id: request.id,
            status: request.status,
            fullName: request.customers.fullName,
            phoneNumber: request.customers.phoneNumber,
            profileImage: request.customers.profileImage
        }));

        res.json({ success: true, requests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch requests' });
    }
});

// Accept worker request
app.post('/worker/request/accept', async (req, res) => {
    try {
        const { requestId } = req.body;
        const { data, error } = await supabase
            .from('servicerequests')
            .update({ status: 'completed' })
            .eq('id', requestId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// Reject worker request
app.post('/worker/request/reject', async (req, res) => {
    try {
        const { requestId } = req.body;
        const { data, error } = await supabase
            .from('servicerequests')
            .update({ status: 'cancelled' })
            .eq('id', requestId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// Delete worker request
app.post('/worker/request/delete', async (req, res) => {
    try {
        const { requestId } = req.body;
        const { data, error } = await supabase
            .from('servicerequests')
            .delete()
            .eq('id', requestId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// Update customer details
app.post('/updateDetails', upload, async (req, res) => {
    try {
        if (!req.session.user || req.session.role !== 'customer') {
            return res.status(401).json({ status: 'unauthorized' });
        }

        const { fullName, phoneNumber, email, zip, state, city, subdivision, address1 } = req.body;
        const customerId = req.session.user.customerid;
        const currentPhone = req.session.user.phoneNumber;
        const currentEmail = req.session.user.email;

        // Check if phone number changed and exists
        if (phoneNumber !== currentPhone) {
            const exists = await checkPhoneExists(phoneNumber, 'customers');
            if (exists) {
                return res.json({ status: 'existingPhone' });
            }
        }

        // Check if email changed and exists
        if (email !== currentEmail) {
            const exists = await checkEmailExists(email, 'customers');
            if (exists) {
                return res.json({ status: 'existingEmail' });
            }
        }

        let updateData = {
            fullName, phoneNumber, email, zip, state, city, subdivision, address1
        };

        // Handle image upload if provided
        if (req.files && req.files.uploadImage) {
            const imageUrl = await uploadToCloudinary(req.files.uploadImage[0].buffer, 'profile_images');
            updateData.profileImage = imageUrl;
        }

        const { data, error } = await supabase
            .from('customers')
            .update(updateData)
            .eq('customerid', customerId);

        if (error) throw error;
        
        // Update session data
        req.session.user = { ...req.session.user, ...updateData };
        
        res.json({ status: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error' });
    }
});

// Update worker details
app.post('/updateWorkerDetails', upload, async (req, res) => {
    try {
        if (!req.session.user || req.session.role !== 'worker') {
            return res.status(401).json({ status: 'unauthorized' });
        }

        const { fullName, phoneNumber, dob, zip, state, city, subdivision, address1 } = req.body;
        const workerId = req.session.user.workerid;
        const currentPhone = req.session.user.phoneNumber;

        // Check if phone number changed and exists
        if (phoneNumber !== currentPhone) {
            const exists = await checkPhoneExists(phoneNumber, 'workers');
            if (exists) {
                return res.json({ status: 'existingPhone' });
            }
        }

        let updateData = {
            fullName, phoneNumber, dob, zip, state, city, subdivision, address1
        };

        // Handle image upload if provided
        if (req.files && req.files.uploadImage) {
            const imageUrl = await uploadToCloudinary(req.files.uploadImage[0].buffer, 'profile_images');
            updateData.image = imageUrl;
        }

        const { data, error } = await supabase
            .from('workers')
            .update(updateData)
            .eq('workerid', workerId);

        if (error) throw error;
        
        // Update session data
        req.session.user = { ...req.session.user, ...updateData };
        
        res.json({ status: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/login.html');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});