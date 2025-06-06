const bcrypt = require('bcrypt');

// Giả sử đây là hash bạn đã lưu trong DB
const storedHash = '$2b$10$7gX7GchJDT.BMG/kLvAg9.n2Dn/cU9Mfm/RrnP3ubDGEza4qLf3/S'; // hash của 'admin123'

async function checkPassword(plainTextPassword) {
  const isMatch = await bcrypt.compare(plainTextPassword, storedHash);
  if (isMatch) {
    console.log('✅ Mật khẩu đúng');
  } else {
    console.log('❌ Mật khẩu sai');
  }
}

checkPassword('123456'); // ✅
checkPassword('sai_mat_khau'); // ❌
