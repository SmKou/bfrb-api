/* Practice encrypting and decrypting between server and client
   Not secure method: test-only
*/
const crypt = [1,9,2,8,3,7,4,6];

const additionalN = () => Math.floor(Math.random() * 10)
const encode = (code) => {
    let n = '';
    for (let i = 0; i < code.length; i++) {
        n += (Number(code.charAt(i)) + crypt[i]) % 10;
    }
    n += `${additionalN()}${additionalN()}`;
    return n;
}

const decode = (code) => {
    let n = '';
    for (let i = 0; i < code.length - 2; i++) {
        n += (Number(code.charAt(i)) + 10 - crypt[i]) % 10;
    }
    return n;
}

// console.log(encode('57935794'));
// console.log(encode(''));

module.exports = { encode, decode }