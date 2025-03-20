const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']; // 클라이언트에서 토큰을 Authorization 헤더에 담아 보냄

  if (!token) {
    return res.status(403).json({ error: '토큰이 필요합니다.' });
  }

  // Bearer 토큰 앞에 붙은 'Bearer '를 떼어냄
  const accessToken = token.split(' ')[1];
  // console.log("Access Token:", accessToken);

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    // console.log("Decoded Token:", decoded);
    req.userId = decoded.userId;  // decoded에서 userId를 추출하여 req.userId에 저장
    next();  // 다음 미들웨어로 넘어가기
  } catch (err) {
    // console.log("JWT Verify Error:", err);
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = verifyToken;
