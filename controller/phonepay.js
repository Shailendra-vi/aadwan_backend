import crypto from 'crypto'
import axios from 'axios';
import mysql from 'mysql'

const salt_key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
const merchant_id = "PGTESTPAYUAT"

const newPayment = async (req, res) => {
    const { fullName, mobile, alternatemobile, amount, MUID, transactionId, fathersName, dateOfBirth, category, gender, addressLine1, state, city, pinCode, aadhaarNumber, familyAnnualIncome, email, educationalInstitute, course, courseLevel, yearOfStudy, passingYear, programName, courseName } = req.body;
    try {
        const data = {
            merchantId: merchant_id,
            merchantTransactionId: transactionId,
            merchantUserId: "MUID123",
            amount: req.body.amount * 100,
            redirectUrl: `https://aadwan-backend.onrender.com/status`,
            redirectMode: 'POST',
            callbackUrl: `https://aadwan-backend.onrender.com/status`,
            mobileNumber: req.body.number,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        // const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox"
        const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };


        axios.request(options).then(function (response) {
            const db = mysql.createConnection({
                host: '89.117.27.154',
                user: 'u101703965_aadwan_users',
                password: 'Rajat@0110',
                database: 'u101703965_aadwan'
            })
            db.connect((err) => {
                if (err) {
                    console.error('Error connecting to database:', err);
                    return;
                }
                console.log('Connection successful');
            });
            const sql = `INSERT INTO tbl_register_user (name, mobile, alternatemobile, amount, MUID, transactionId, fathersName, dateOfBirth, category, gender, addressLine1, state, city, pincode, aadhar, familyAnnualIncome, email, educationalInstitute, course, courseLevel, yearOfStudy, passingYear, programName, courseName)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [fullName, mobile, alternatemobile, amount, MUID, transactionId, fathersName, dateOfBirth, category, gender, addressLine1, state, city, pinCode, aadhaarNumber, familyAnnualIncome, email, educationalInstitute, course, courseLevel, yearOfStudy, passingYear, programName, courseName];
            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return;
                }
                console.log('Data inserted successfully:', result);
            });
            db.end();

            return res.status(200).send(response.data.data.instrumentResponse.redirectInfo.url)
        }).catch(function (error) {
            console.error(error.message);
        });

    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false
        })
    }
}

const checkStatus = async (req, res) => {
    const merchantTransactionId = res.req.body.transactionId
    const merchantId = res.req.body.merchantId

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;
    const URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status"
    // const URL ='https://api.phonepe.com/apis/hermes/pg/v1/status' 

    const options = {
        method: 'GET',
        url: `${URL}/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }
    };

    axios.request(options).then(async (response) => {
        if (response.data.success === true) {
            const url = `https://aadwan.in/success`
            return res.redirect(url)
        } else {
            const db = mysql.createConnection({
                host: '89.117.27.154',
                user: 'u101703965_aadwan_users',
                password: 'Rajat@0110',
                database: 'u101703965_aadwan'
            })
            db.connect((err) => {
                if (err) {
                    console.error('Error connecting to database:', err);
                    return;
                }
                console.log('Connection successful');
            });
            const sql = `DELETE FROM tbl_register_user WHERE transactionID = ?`;
            db.query(sql, [merchantTransactionId], (err, result) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return;
                }
                console.log('Data inserted successfully:', result);
            });
            db.end();

            const url = `https://aadwan.in/failure`
            return res.redirect(url)
        }
    }).catch((error) => {
        // console.error(error);
    });
};

export { newPayment, checkStatus }