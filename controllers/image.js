const crypt = require('./code');
const find = require('./user');

const increment = (trx, user, faces) => {
    return  trx('users_tb')
            .where({ id: user[0].id })
            .increment({ entries: 1, faces: faces})
            .returning('*')
}

const update = (trx, user) => {
    return  trx('users_tb')
            .where({ id: user[0].id })
            .update({ product: user[0].entries * user[0].faces })
            .returning(['name'])
}

const handleImage = (knex, clarifai) => (req, res) => {
    // Check input: code, url required and required code length
    const { code, url } = req.body;
    if (!code || !url
        || code.length != 10)
    { res.status(400).json('incorrect form submission') }
    // Setup request to clarifai
    const { USER_ID, PAT, APP_ID, MODEL_ID } = clarifai;
    const requestOptions = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Key ${PAT}`
        },
        body: JSON.stringify({
          'user_app_id': {
            'user_id': USER_ID,
            'app_id': APP_ID
          },
          'inputs': [{ 'data': { 'image': { 'url': url }}}]
        })
    };
    // Fetch from clarifai
    // Update user's entries, faces, and product
    fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/outputs`, requestOptions)
    .then(response => response.json())
    .then(results => {
        if (results) {
            const decoded = crypt.decode(code);
            const faces = results.outputs[0].data.regions.length;
            knex.transaction(trx => {
                return  find.user(trx, decoded)
                        .then((user) => increment(trx, user, faces))
                        .then((user) => update(trx, user))
            })
            .then( res.json(results.outputs[0].data) )
        }
        else { res.status(400).json('failed to retrieve data -2') }
    })
    .catch(console.log)
}

module.exports = { handleImage }