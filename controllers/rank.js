const crypt = require('./code');
const find = require('./user');

const handleRank = (knex) => (req, res) => {
    // Check input: no body and required code length
    const { code } = req.params;
    if (Object.keys(req.body).length
        || code.length != 10)
        { res.status(400).json('error getting user') }
    // Decode user code
    // Get user.product through joining on internal id
    // Count rows with product > user.product
    let decoded = crypt.decode(code).toString();
    find.user(knex, decoded)
    .then(user => {
        if (user.length) {
            knex('users_tb')
            .count('product')
            .where('product','>', user[0].product)
            .then(n => {
                if (n.length) {
                    n[0].count++;
                    res.json(n[0].count)
                }
                else res.status(400).json('error getting user')
            })
        }
        else res.status(400).json('error getting user')
    })
    .catch(console.log)
}

module.exports = { handleRank }