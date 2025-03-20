const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); 
const spotRoutes = require('./routes/spotRoutes'); 
const commentRoutes = require('./routes/commentRoutes'); 

// 환경변수 설정 파일 로드
dotenv.config();

const app = express(); // express 모듈로 서버 애플리케이션 생성

// 모든 요청에서 CORS 정책 허용 = 다른 도메인에서 서버에 요청 보내는 것을 허용
app.use(cors()); 
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/spot', spotRoutes);
app.use('/api/spot', commentRoutes);

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});