const crypt = require('./code');
const find = require('./user');

const handleProfile = (knex) => (req, res) => {
    // Check input: no body and required code length
    const { code } = req.params;
    if (Object.keys(req.body).length 
        || code.length != 10)
        { res.status(400).json('error getting user -1') }
    // Decode user code
    // Get user.name|entries|faces through joining on internal id
    let decoded = crypt.decode(code).toString();
    find.user(knex, decoded)
    .then(user => {
        if (user.length) res.json(user[0])
        else res.status(400).json('error getting user')
    })
    .catch(console.log)
}

module.exports = { handleProfile }