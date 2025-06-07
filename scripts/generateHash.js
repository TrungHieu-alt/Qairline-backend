const bcrypt = require('bcrypt');

async function generateHash(password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
}

// Lấy mật khẩu từ command line argument
const password = process.argv[2];
if (!password) {
    console.error('Vui lòng nhập mật khẩu: node generateHash.js <password>');
    process.exit(1);
}

generateHash(password); 