import mysql from 'mysql'

const dbconfigure = (req, res) => {
    const db = mysql.createConnection({
        host: '89.117.27.154',
        user: 'u101703965_aadwan_users',
        password: 'Rajat@0110',
        database: 'u101703965_aadwan'
    })
    if (db) { console.log("Connection Successfull") }
    let sql = "SELECT * FROM tbl_donate_user"
    db.query(sql, (err, data) => {
        if (err) console.log(err)
        console.log(data)
        return res.json(data)
    })
}

export { dbconfigure }