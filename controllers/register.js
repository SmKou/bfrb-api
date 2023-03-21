const crypt = require('./code');

const generateCode = (knex) => (req, res) => {
    // Check input: no body
    if (!req.body)
    { res.status(400).json('user filled in code') }
    // Create cache and send to random number (recursive)
    // Return last code in cache
    const cache = [];
    let n = randomNumber(cache, knex);
    console.log(n);
    res.json(cache[cache.length - 1]);
}

const randomNumber = (cache, knex) => {
    // Generate string of random numbers
    let n = '';
    for (let i = 0; i < 8; i++) { n += Math.floor(Math.random() * 10) }
    // Check cache and add if not included
    if (!cache.includes(n)) { cache.push(n) }
    // Check database and return code if not included
    knex('login_tb')
    .select('code')
    .where({ code: n })
    .then(found => {
        if (!found.length) { return n }
        else { return randomNumber() }
    })
    .catch(console.log)
}

const missingCode = (knex) => (req, res) => {
    // Check input: no body and required code length
    const { code } = req.params;
    if (Object.keys(req.body).length
        || code.length != 8)
        { res.status(400).json('error getting user') }
    // Check if user exists
    knex('login_tb')
    .where({ code: code })
    .on('query-error', () => res.status(400).json('user does not exist'))
    .then(() => {
        const encoded = crypt.encode(code);
        res.json(encoded);
    })
}

const handleRegister = (knex, bcrypt, salt) => (req, res) => {
    // Check input: name, email, password, code required
    const { name, email, password, code } = req.body;
    if (!email || !password || !code) {
        console.log(name, email, password, code);
        res.status(400).json('incorrect form submission')
    }
    // Hash email and password
    const contact = bcrypt.hashSync(email, salt);
    const hash = bcrypt.hashSync(password, salt);
    // Transaction: create login then create user
    // Commit on success
    knex
    .on('query-error', () => res.status(400).json('unable to register'))
    .transaction(trx => {
        trx
        .insert({ code, contact, hash })
        .into('login_tb')
        .then(() => {
            return trx
            .returning('*')
            .insert({ name: name })
            .into('users_tb')
            .then(user => {
                if (!user.length)
                { res.status(400).json('unable to register') }
                else { res.json(user[0])
                    /*  Note: Internal error - unfixed
                        Workaround: Modify db manually
                        Reason: personal project
                        Revisit: loginId[0].id !== user[0].id
                        Method:
                        - Attempt to set loginId to userId in login_tb
                        - Success: return true
                        - Attempt to set userId to loginId in users_tb
                        - Success: return true
                        - Failure: return false
                    */
                }
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    });
}

module.exports = { generateCode, missingCode, handleRegister }