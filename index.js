const express = require('express');
const cors = require('cors');
const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');
const app = express();
require('dotenv').config();
// const serverless = require('serverless-http');
const HospitalModel = require('./models/HospitalModel');
const AgentModel = require('./models/AgentModel');
const UserModel = require('./models/UserModel');
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
const mongoURI = process.env.MONGODB_URL;
mongoose.connect(mongoURI).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));
const corsOptions ={
    origin:process.env.HOST_ADDRESS, 
    credentials:true,      
    optionSuccessStatus:200
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.status(200).send('Server is running');
});

app.listen(process.env.PORT, () => {
    console.log('Server is running on port '+process.env.PORT);
});


app.post('/saveHospitalData', async (req, res) => {
    try {
        const hospitalData = req.body;
        await HospitalModel.create(hospitalData);
        res.status(200).send('Hospital data saved successfully');
    } catch (err) {
        console.error('Error saving hospital data:', err);
        res.status(500).send('Error saving hospital data');
    }
});


// opt section
app.post('/sendOTP', async (req, res) => {
    const { to, subject, otp } = req.body;
    try {
        
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const info = await transporter.sendMail({
            from: '"Healthkard" <healthkard99@gmail.com>',
            to: to,
            subject: subject,
            text: `Your OTP is: ${otp}`,
        });

        console.log("Message sent: %s", info.messageId);
        res.json(info);
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "An error occurred while sending the email.", error });
    }
});

// hospital routes
// checking for present or not
app.get('/checkMail/:email', async (req, res) => {
    const email = req.params.email;
    console.log(email)
    try {
        const result = await HospitalModel.findOne({ email });
        if (result) {
            res.status(200).json({ email: result.email, isverified: result.isverified ,hospitalId:result.hospitalId});
        } else {
            res.status(200).json({ email: "not found", isverified: "0", hospitalId : null});
        }
    } catch (err) {
        console.error("Error while checking the email:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// getting hospital details by id
app.get('/getHospitalDeatils/:hospitalId', async (req,res)=>{
    const hospitalId = req.params.hospitalId;
    try {
        const result = await HospitalModel.findOne({ hospitalId });
        if (result) {
            res.status(200).json(result.hospitalDetails);
        } else {
            res.status(200).json({ email: "not found", isverified: "0" });
        }
    } catch (err) {
        console.error("Error while checking the email:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
// getting hospital doctorDetails by id
app.get('/getDoctorDetails/:hospitalId', async (req,res)=>{
    const hospitalId = req.params.hospitalId;
    try {
        const result = await HospitalModel.findOne({ hospitalId });
        if (result) {
            res.status(200).json(result.doctorList);
        } else {
            res.status(200).json({ email: "not found", isverified: "0" });
        }
    } catch (err) {
        console.error("Error while checking the email:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
// getting hospital media Details by id
app.get('/getMediaDeatils/:hospitalId', async (req,res)=>{
    const hospitalId = req.params.hospitalId;
    try {
        const result = await HospitalModel.findOne({ hospitalId });
        if (result) {
            res.status(200).json(result.mediaDetails);
        } else {
            res.status(200).json({ email: "not found", isverified: "0" });
        }
    } catch (err) {
        console.error("Error while checking the email:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
// getting full hospital  Details by id
app.get('/getHospital/:hospitalId', async (req,res)=>{
    const hospitalId = req.params.hospitalId;
    try {
        const result = await HospitalModel.findOne({ hospitalId });
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(200).json({ email: "not found", isverified: "0" });
        }
    } catch (err) {
        console.error("Error while checking the email:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
// getting hospital users Details by id
app.get('/getUsers/:hospitalId', async (req,res)=>{
    const hospitalId = req.params.hospitalId;
    try {
        const result = await HospitalModel.findOne({ hospitalId });
        if (result) {
            res.status(200).json(result.users);
        } else {
            res.status(200).json({ email: "not found", isverified: "0" });
        }
    } catch (err) {
        console.error("Error while checking the email:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.post('/addUserToHospital/:hospitalId', async (req, res) => {
    try {
      const { hospitalId } = req.params;
      const { user } = req.body;
  
      // Find the hospital by hospitalId
      const hospital = await HospitalModel.findOne({ hospitalId });
        console.log(user)
      if (!hospital) {
        return res.status(404).json({ error: 'Hospital not found' });
      }
  
      // Add the user to the hospital's users array
      hospital.users.push(user);
  
      // Save the updated hospital document
      await hospital.save();
  
      return res.status(200).json({ message: 'User added successfully', hospital });
    } catch (error) {
      console.error('Error adding user to hospital:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
});
// get name by id
app.get('/getName/:hospitalId', async (req,res)=>{
    const hospitalId = req.params.hospitalId;
    console.log(hospitalId)
    try {
        const result = await HospitalModel.findOne({ hospitalId });
        if (result) {
            res.status(200).send(result.hospitalDetails.hospitalLegalName);
        } else {
            res.status(200).send(hospitalId);
        }
    } catch (err) {
        console.error("Error while checking the email:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
// get email by id
app.get('/getEmail/:hospitalId', async (req,res)=>{
    const hospitalId = req.params.hospitalId;
    console.log(hospitalId)
    try {
        const result = await HospitalModel.findOne({ hospitalId });
        if (result) {
            res.status(200).send(result.email);
        } else {
            res.status(200).send(hospitalId);
        }
    } catch (err) {
        console.error("Error while checking the email:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
// get details by id
app.get('/getDetails/:hospitalId', async (req,res)=>{
    const hospitalId = req.params.hospitalId;
    try {
        const result = await HospitalModel.findOne({ hospitalId });
        if (result) {
            res.status(200).send({hospitalId:result.hospitalId,email:result.email,agentID:result.agentID});
        } else {
            res.status(200).json({ email: "not found", isverified: "0" });
        }
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
})
app.put('/update/:hospitalId', async (req, res) => {
    const hospitalId = req.params.hospitalId;
    const updatedData = req.body;
    console.log(hospitalId)
    try {
        const result = await HospitalModel.findOneAndUpdate(
            { hospitalId: hospitalId }, 
            { $set: {hospitalDetails:updatedData.hospitalDetails,doctorList:updatedData.doctorList, updatedDate: new Date().toISOString() } },
            { new: true } 
        );        
        if (!result) {  
            return res.status(404).json({ message: "Hospital not found" });
        }
        res.status(200).json({ message: "Hospital updated successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: "Error updating hospital", error: error.message });
    }
});
app.put('/deleteMediaDetails/:hospitalId', async (req, res) => {
    const hospitalId = req.params.hospitalId;
    const updatedData = req.body;
    try {
        const result = await HospitalModel.findOneAndUpdate(
            { hospitalId: hospitalId }, 
            { $set: {mediaDetails:updatedData, updatedDate: new Date().toISOString() } },
            { new: true } 
        );        
        if (!result) {  
            return res.status(404).json({ message: "Hospital not found" });
        }
        res.status(200).json({ message: "Hospital updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating hospital", error: error.message });
    }
});
app.get('/hospitalStats', async (req, res) => {
    try {
        const pendingCount = await HospitalModel.countDocuments({ isverified: 1 });
        const approvedCount = await HospitalModel.countDocuments({ isverified: 2 });
        res.status(200).json({ pendingCount: pendingCount, approvedCount: approvedCount });
    } catch (error) {
        console.error('Error fetching user counts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




// techniqal routes
// Route to get hospital IDs and names for verified hospitals for pending
app.get('/verifiedHospitals', async (req, res) => {
    try {
        const verifiedHospitals = await HospitalModel.find(
            { isverified: '1' }, // Query condition
            { _id: 0, hospitalId: 1, 'hospitalDetails.hospitalLegalName': 1 } // Projection
        );
        res.status(200).json(verifiedHospitals);
    } catch (error) {
        console.error('Error retrieving verified hospitals:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Route to get hospital IDs and names for verified hospitals for approved
app.get('/approvedHospitals', async (req, res) => {
    try {
        const verifiedHospitals = await HospitalModel.find(
            { isverified: '2' }, // Query condition
            { _id: 0, hospitalId: 1, 'hospitalDetails.hospitalLegalName': 1 } 
        );
        res.status(200).json(verifiedHospitals);
    } catch (error) {
        console.error('Error retrieving verified hospitals:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// update the isverified to 2
app.put('/updateIsVerified/:hospitalId', async (req, res) => {
    const hospitalId = req.params.hospitalId;
    try {
        const updatedHospital = await HospitalModel.findOneAndUpdate(
            { hospitalId: hospitalId }, 
            { isverified: '2' }, 
            { new: true } 
        );
        if (!updatedHospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }
        res.status(200).json({ message: "Hospital isverified updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating hospital isverified", error: error.message });
    }
});


app.delete('/deleteProfile/:hospitalId', async (req, res) => {
    const hospitalId = req.params.hospitalId;
    try {
        // Find the hospital profile by hospitalId and delete it
        const result = await HospitalModel.findOneAndDelete({ hospitalId: hospitalId });
        
        // Check if the hospital profile was found and deleted
        if (!result) {
            return res.status(404).json({ message: "Hospital profile not found" });
        }
        
        // Respond with success message
        res.status(200).json({ message: "Hospital profile deleted successfully" });
    } catch (error) {
        // Handle errors
        console.error("Error deleting hospital profile:", error);
        res.status(500).json({ message: "Error deleting hospital profile", error: error.message });
    }
});
// get hospital basic details
app.get('/hospitals', async (req, res) => {
    try {
        const hospitals = await HospitalModel.find({}, { hospitalId: 1, 'hospitalDetails.hospitalTradeName': 1, 'hospitalDetails.address': 1, 'mediaDetails.logoURL': 1 ,'mediaDetails.hospitalImageURL':1});

        res.json(hospitals);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// agent routes
// Route to add an agent
app.post('/addAgent', async (req, res) => {
    try {
        const agentData = req.body;
        await AgentModel.create(agentData);
        res.status(200).send('Agent data saved successfully');
    } catch (err) {
        res.status(500).send('Error saving Agent data');
    }
});
app.post('/reset-todays-count', async (req, res) => {
    try {
        // Update all agents to set todaysCount to 0
        await AgentModel.updateMany({}, { $set: { todaysCount: 0 } });

        res.status(200).json({ message: 'Todays count reset for all agents' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to get hospital IDs and names for agents
app.get('/agents', async (req, res) => {
    try {
        const agents = await AgentModel.find({}, 'agentID name');
        res.status(200).json(agents);
    } catch (error) {
        res.status(500).send("Error while retriving");
    }
});
// checking agents
app.get('/checkAgent/:agentID', async (req, res) => {
    try {
        const agentID = req.params.agentID;
        const agents = await AgentModel.find({ agentID: agentID });
        if (agents.length === 0) {
            res.status(404).send("Agent doesn't exist");
        } else {
            res.status(200).json(agents);
        }
    } catch (error) {
        console.error("Error while retrieving agent:", error);
        res.status(500).send("Error while retrieving agent");
    }
});


// getting agent details by id
app.get('/getAgentDetails/:agentId', async (req,res)=>{
    const agentID = req.params.agentId;
    try {
        const result = await AgentModel.findOne({ agentID });
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(200).json({ email: "not found"});
        }
    } catch (err) {
        console.error("Error while checking the email:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
// getting agent details by id
app.get('/getAgentPassword/:email', async (req,res)=>{
    const email = req.params.email;
    try {
        const result = await AgentModel.findOne({ email });
        if (result) {
            res.status(200).json({password: result.password ,agentID:result.agentID});
        } else {
            res.status(200).json({ password: null});
        }
    } catch (err) {
        console.error("Error while checking the email:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
// code to add the users to agents table
app.put('/addUser/:agentID', async (req, res) => {
    const agentID = req.params.agentID;
    try {
        const agent = await AgentModel.findOne({agentID});
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found' });
        }
        agent.totalCount += 1;
        const today = new Date().toISOString().split('T')[0];
        const lastUserAddedDate = agent.usersAdded.length > 0 ? agent.usersAdded[agent.usersAdded.length - 1].date.toISOString().split('T')[0] : null;
        if (lastUserAddedDate === today) {
            agent.todaysCount += 1;
        }else{
            agent.todaysCount = 1;
        }
        agent.usersAdded.push(req.body);
        await agent.save();
        return res.status(200).json({ message: 'Agent updated successfully', agent });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
// update the payment status
app.put('/payment/:healthId',async (req,res)=>{
    const healthId = req.params.healthId;
    const paymentStatus = req.body.paymentStatus;
    try{
        const user = await UserModel.findOne({healthId});
        user.paymentStatus = paymentStatus;
        await user.save();
        res.send("Successfully updated");
    }catch(err){
        console.log("Error while updating the status");
    }
    
})
// code to add the users to agents table
app.put('/addHospital/:agentID', async (req, res) => {
    const agentID = req.params.agentID;
    try {
        const agent = await AgentModel.findOne({agentID});
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found' });
        }
        agent.totalCount += 1;
        const today = new Date().toISOString().split('T')[0];
        const lastUserAddedDate = agent.hospitalsAdded.length > 0 ? agent.hospitalsAdded[agent.usersAdded.length - 1].date.toISOString().split('T')[0] : null;
        if (lastUserAddedDate === today) {
            agent.todaysCount += 1;
        }else{
            agent.todaysCount = 1;
        }
        agent.hospitalsAdded.push(req.body);
        await agent.save();
        return res.status(200).json({ message: 'Agent updated successfully', agent });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});





// user rounts here
app.post('/addUser', async (req, res) => {
    try {
        const userData = req.body;
        await UserModel.create(userData);
        res.status(200).send('User data saved successfully');
    } catch (err) {
        console.log(err)
        res.status(500).send('Error saving User data');
    }
});

app.delete('/user/:userId',async(req,res)=>{
    const healthId = req.params.userId;
    try {
        const result = await UserModel.findOneAndDelete({ healthId });
        if (result) {
            res.status(200).json({message:"deleted successfully"});
        } else {
            res.status(200).json({ user: "not found"});
        }
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
})
app.delete('/agent/:agentID',async(req,res)=>{
    const agentID = req.params.agentID;
    try {
        const result = await AgentModel.findOneAndDelete({ agentID });
        if (result) {
            res.status(200).json({message:"deleted successfully"});
        } else {
            res.status(200).json({ user: "not found"});
        }
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
})
app.get('/getuserDetails/:userId', async (req,res)=>{
    const healthId = req.params.userId;
    try {
        const result = await UserModel.findOne({ healthId });
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(200).json({ email: "not found"});
        }
    } catch (err) {
        console.error("Error while checking the email:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.get('/getUserNameID', async (req, res) => {
    try {
        const results = await UserModel.find({});
        if (results.length > 0) {
            const users = results.map(user => ({ name: user.name, healthId: user.healthId,paymentStatus: user.paymentStatus }));
            res.status(200).json(users);
        } else {
            res.status(200).json({ message: "No users found" });
        }
    } catch (err) {
        console.error("Error while retrieving user data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get('/getUsers', async (req, res) => {
    try {
        const results = await UserModel.find({});
        res.status(200).json(results);
    } catch (err) {
        console.error("Error while retrieving user data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get('/getUser/:healthId', async (req, res) => {
    try {
        const result = await UserModel.findOne({healthId:req.params.healthId});
        res.status(200).json(result);
    } catch (err) {
        console.error("Error while retrieving user data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get('/getUserByNumber/:number', async (req, res) => {
    try {
        const result = await UserModel.find({number:req.params.number});
        res.status(200).json(result);
    } catch (err) {
        console.error("Error while retrieving user data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// stats for users active and total
app.get('/userStats', async (req, res) => {
    try {
        const currentDate = new Date();
        await UserModel.updateMany(
            { expireDate: { $lt: currentDate } },
            { $set: { paymentStatus: false } }
        );
        const allUsers = await UserModel.find({});
        const totalUsers = allUsers.length;
        const activeUsers = allUsers.filter(user => user.expireDate > currentDate).length;
        res.status(200).json({
            user: totalUsers,
            active: activeUsers
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/sendCardURL', async (req, res) => {
    const { to, subject, url } = req.body;
    try {
        
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const info = await transporter.sendMail({
            from: '"Healthkard" <healthkard99@gmail.com>',
            to: to,
            subject: subject,
            text: `Your Card URL is: ${url}`,
        });
        res.json(info);
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "An error occurred while sending the email.", error });
    }
});
app.post('/denyReason', async (req, res) => {
    const { to, subject, body } = req.body;
    try {
        
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const info = await transporter.sendMail({
            from: '"Healthkard" <healthkard99@gmail.com>',
            to: to,
            subject: subject,
            text: body,
        });
        res.json(info);
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "An error occurred while sending the email.", error });
    }
});
app.put('/visited/:healthId', async (req, res) => {
    const healthId = req.params.healthId;
    try {
        const user = await UserModel.findOne({ healthId });
        const { hospitalId } = req.body;
        const visitedHospitalIndex = user.visited.findIndex(visit => visit.hospitalId === hospitalId);
        if (visitedHospitalIndex !== -1) {
            user.visited[visitedHospitalIndex].frequency += 1;
        } else {
            user.visited.push(req.body);
        }
        await user.save();
        res.status(200).json({ message: 'Saved successfully', user });
    } catch (error) {
        console.error('Error updating visited data:', error);
        res.status(500).send('Internal Server Error');
    }
});


const PHONE_PE_HOST_URL = process.env.PHONE_PE_HOST_URL;
const MERCHANT_ID = process.env.MERCHANT_ID;
const SALT_INDEX = process.env.SALT_INDEX;
const SALT_KEY = process.env.SALT_KEY;
let HEALTHKARD_ID = "";
let IS_NEW = true;
let PLAN = "one month"
const planPrices = {
    'one month': 99,
    'three months': 297,
    'six months': 499,
    'one year': 899
};
app.get('/pay',(req,res)=>{
    const { name,mobileNumber,healthID,plan,isNew } = req.query;
    PLAN = plan;
    const amount = planPrices[plan];
    IS_NEW = isNew;
    HEALTHKARD_ID = healthID;
    const payEndPoint = '/pg/v1/pay';
    let merchantTransactionId = uniqid();
    let merchantUserId = "MUID123";
    const payload ={
      "merchantId": MERCHANT_ID,
      "merchantTransactionId": merchantTransactionId,
      "merchantUserId": merchantUserId,
      "amount": amount*100,
      "redirectUrl": `${process.env.SERVER_URL}/redirect-url/${merchantTransactionId}`,
      "redirectMode": "POST",
      "mobileNumber": mobileNumber,
      "paymentInstrument": {
        "type": "PAY_PAGE"
      }
    }
    let bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    let base64EncodedPayload = bufferObj.toString("base64");
    const xVerify = sha256(base64EncodedPayload+payEndPoint+SALT_KEY) + "###" + SALT_INDEX;
    const options = {
      method: 'post',
      url: `${PHONE_PE_HOST_URL}${payEndPoint}`,
      headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            },
    data: {
      request:base64EncodedPayload
    }
    };
    axios
      .request(options)
          .then(function (response) {
          const url = response.data.data.instrumentResponse.redirectInfo.url;
          // res.send(url);
          res.redirect(url);
          // res.send(response.data)
      })
      .catch(function (error) {
        res.send({message:"Error",error})
      });
  })
  app.get("/redirect-url/:merchantTransactionId", async (req, res) => {
    const { merchantTransactionId } = req.params;
    if (merchantTransactionId) {
        try {
            const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + "###" + SALT_INDEX;
            const options = {
                method: 'get',
                url: `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-MERCHANT-ID': MERCHANT_ID,
                    'X-VERIFY': xVerify
                }
            };
            const response = await axios.request(options);
            if (response.data.code === "PAYMENT_SUCCESS") {
                console.log("payment ")
                if(IS_NEW==true)
                    await axios.put(`${process.env.SERVER_URL}/payment/${HEALTHKARD_ID}`, { paymentStatus: true })
                else
                    await axios.put(`${process.env.SERVER_URL}/renewal/${HEALTHKARD_ID}`, { planDuration: PLAN })
                // res.send(200).send("Payment successfull")
                res.redirect(`https://healthkard.in/userCard/${HEALTHKARD_ID}`);
            } else {
                console.log("Payment failed:", response.data);
                res.status(400).send("Payment failed");
            }
        } catch (error) {
            console.error("Error during payment status check or update:");
            res.send("Please contact to healthkard team");
            // res.status(500).send(`You can get your card by clicking this : https://healthkard.in/userCard/${HEALTHKARD_ID}`);
        }
    } else {
        res.status(400).send({ error: "Invalid merchantTransactionId" });
    }
  });


//   renewal route
// Define the plan durations in days
const planDurations = {
    'one month': 28,
    'three months': 84,
    'six months': 168,
    'one year': 336
};

app.put('/renewal/:healthId', async (req, res) => {
    const { healthId } = req.params;
    const { planDuration } = req.body;
    try {
        // Find the user by healthId
        const user = await UserModel.findOne({ healthId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the plan duration in days
        const durationInDays = planDurations[planDuration.toLowerCase()];
        if (!durationInDays) {
            return res.status(400).json({ message: 'Invalid plan duration' });
        }

        // Determine the new expiration date
        const currentDate = new Date();
        const baseDate = user.expireDate && user.expireDate > currentDate ? user.expireDate : currentDate;
        const newExpireDate = new Date(baseDate);
        newExpireDate.setDate(newExpireDate.getDate() + durationInDays);

        // Update the user's startDate and expireDate
        user.startDate = user.expireDate && user.expireDate > currentDate ? user.startDate : currentDate;
        user.expireDate = newExpireDate;
        user.lastPlan = planDuration;
        user.paymentStatus = true;
        // Save the updated user
        await user.save();

        res.json({ message: 'User renewed successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


