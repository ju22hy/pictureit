const pool = require('../database/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const signup = async (req, res) => {
  const { email, nickname, password } = req.body;

  try {
    // 이메일 중복 확인
    const emailCheckQuery = 'SELECT * FROM sry.users WHERE email = $1';
    const emailCheckResult = await pool.query(emailCheckQuery, [email]);

    if (emailCheckResult.rows.length > 0) {
      return res.status(400).json({ error: '가입된 이메일입니다.' });
    }

    // 닉네임 중복 확인
    const nicknameCheckQuery = 'SELECT * FROM sry.users WHERE nickname = $1';
    const nicknameCheckResult = await pool.query(nicknameCheckQuery, [nickname]);

    if (nicknameCheckResult.rows.length > 0) {
      return res.status(400).json({ error: '이미 사용 중인 닉네임입니다.' });
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // DB에 사용자 정보 저장
    const query = 'INSERT INTO sry.users (email, nickname, password) VALUES ($1, $2, $3) RETURNING user_id';
    const values = [email, nickname, hashedPassword];
    
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering user', message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = 'SELECT * FROM sry.users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: '등록되지 않은 이메일입니다.' });
    }

    const user = result.rows[0];

    // 비밀번호 비교
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: '비밀번호가 틀렸습니다.' });
    }

    // 액세스 토큰 생성 (만료 시간 1일)
    const accessToken = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }  // 액세스 토큰 만료 시간
    );

    // 리프레시 토큰 생성 (만료 시간 2주)
    const refreshToken = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '14d' }  // 리프레시 토큰 만료 시간
    );

    // 리프레시 토큰을 DB에 저장 (기존 리프레시 토큰을 덮어쓰는 방식)
    const refreshTokenQuery = 'UPDATE sry.users SET refresh_token = $1 WHERE user_id = $2';
    await pool.query(refreshTokenQuery, [refreshToken, user.user_id]);

    // 토큰을 클라이언트에 반환
    res.status(200).json({
      message: '로그인 성공',
      accessToken,  // 클라이언트는 이 토큰을 이후 요청에 포함해서 서버로 보냄
      refreshToken  // 리프레시 토큰도 클라이언트에 보내줘야 함
    });
  } catch (err) {
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.', message: err.message });
  }
};

// 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급 및 업데이트
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: '리프레시 토큰이 필요합니다.' });
  }

  try {
    // 리프레시 토큰 검증
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // 새로운 액세스 토큰과 리프레시 토큰 발급
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }  // 새 액세스 토큰의 만료 시간
    );

    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: '14d' }  // 새 리프레시 토큰의 만료 시간
    );

    // 새로운 리프레시 토큰을 DB에 업데이트
    const updateRefreshTokenQuery = 'UPDATE sry.users SET refresh_token = $1 WHERE user_id = $2';
    await pool.query(updateRefreshTokenQuery, [newRefreshToken, decoded.userId]);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    res.status(401).json({ error: '리프레시 토큰이 만료되었거나 유효하지 않습니다.' });
  }
};

const logout = async (req, res) => {
  const userId = req.userId;
  console.log('userId:', userId);
  
  try {
    // 리프레시 토큰을 DB에서 삭제
    const query = 'UPDATE sry.users SET refresh_token = NULL WHERE user_id = $1';
    await pool.query(query, [userId]);

    res.status(200).json({ message: '로그아웃 성공' });
  } catch (err) {
    res.status(500).json({ error: '로그아웃 중 오류가 발생했습니다.', message: err.message });
  }
};

module.exports = { signup, login, refreshAccessToken, logout };