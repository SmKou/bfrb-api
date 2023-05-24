const crypt = require('./code');
const find = require('./user');

const rank = (trx, user) => {
    return  trx('users_tb')
            .count('product')
            .where('product', '>', user[0].product)
}

const handleProfile = (knex) => (req, res) => {
    const { code } = req.body;
    if (!code || code.length != 10)
    { res.status(400).json('error getting user -1') }
    
    let decoded = crypt.decode(code).toString();
    find.user(knex, decoded)
    .then(user => {
        let userRank = '';
        rank(knex, user)
        .then(count => {
            if (count.length) userRank = count;
            console.log(userRank)
        })
        return user;
    })
    .then(user => {
        if (user.length) {
            delete user[0].id;
            delete user[0].contact;
            delete user[0].hash;
            delete user[0].product;
            res.json(user[0]);
        }
        else res.status(400).json('error getting user')
    })
    .catch(console.log)
}

module.exports = { handleProfile }