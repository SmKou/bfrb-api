const bcrypt = require('bcrypt');
const saltRounds = 10;

// Generate a password x3
// Compare each iteration

const password = 'node.js';
const variants = [];

const convert = (pass, salt) => bcrypt.hash(pass, salt, (err, hash) => {
    if (err) { console.log(err) }
    if (hash) { variants.push(hash) }
})

const generate = () => {
    for (let i = 0; i < 3; i++) {
        convert(password, saltRounds);
    }
}

const testHash = () => {
    if (variants.length) {
        console.log(variants);
        variants.forEach(hash => bcrypt.compare(password, hash).then(console.log))
    }
    if (!variants.length) {
        setTimeout(testHash, 75);
    }
}
generate();
testHash();