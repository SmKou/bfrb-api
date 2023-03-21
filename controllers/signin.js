/* User uses decrypted code for signin */
const crypt = require('./code');

const checkCode = (knex, code) => {
    // Check input: required code length
    if (code.length != 8) { return false }
    // Check database: user code match
    const response = knex('login_tb')
        .select('code')
        .where({ code: code })
        .on('query-error', () => res.status(400).json('wrong credentials'))
        .returning('id')
        .then(key => {
            return key.length > 0
        });
    return response;
}

const handleSignIn = (knex, bcrypt) => (req, res) => {
    // Check input: email, password, code required
    const { email, password, code } = req.body;
    if (!email || !password || !code)
    { res.status(400).json('incorrect form submission') }
    // Check code: only execute if valid
    // Get encrypted email and password based on code
    // Compare hashed with submitted
    // Valid => return user info (signed in)
    if (checkCode(knex, code)) {
        knex('login_tb')
        .select('contact', 'hash')
        .where({ code: code })
        .on('query-error', () => res.status(400).json('wrong credentials'))
        .then(data => {
            const emailValid = data.length?
                bcrypt.compareSync(email, data[0].contact): 
                false;
            const passwordValid = data.length?
                bcrypt.compareSync(password, data[0].hash):
                false;

            if (emailValid && passwordValid) {
                knex('login_tb')
                .select('id')
                .where({ code: code })
                .then(key => {
                    knex('users_tb')
                    .select('*')
                    .where({ id: key[0].id })
                    .on('query-error', () => res.status(400).json('unable to signin'))
                    .then(user => {
                        if (user.length) { 
                            user[0].code = crypt.encode(code);
                            res.json(user[0]);
                        }
                        else res.status(400).json('wrong credentials')
                    })
                    .catch(console.log)
                })
                .catch(console.log)
            }
            else res.status(400).json('wrong credentials')
        })
        .catch(console.log)
    }
    else res.status(400).json('incorrect form submission')
}

module.exports = { handleSignIn }