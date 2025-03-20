-- Users 테이블 생성
CREATE TABLE sry.users (
  user_id SERIAL PRIMARY KEY,            -- 사용자 고유 ID
  email VARCHAR(255) UNIQUE NOT NULL,     -- 사용자 이메일 (유니크)
  password VARCHAR(255) NOT NULL,         -- 사용자 비밀번호 (해시된 비밀번호)
  nickname VARCHAR(10) UNIQUE NOT NULL,   -- 사용자 닉네임 (유니크)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 계정 생성 시간
  delete_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 계정 삭제 시간 (소프트 삭제 시 사용)
  user_state BOOLEAN NOT NULL DEFAULT TRUE  -- 사용자 상태 (기본값 TRUE, 소프트 삭제 여부)
  refresh_token VARCHAR(255) -- 리프레시 토큰
);

-- PhotoSpot 테이블 생성
CREATE TABLE sry.photo_spot (
  point_id SERIAL PRIMARY KEY,            -- 사진 포인트 고유 ID
  user_id INT REFERENCES sry.users(user_id) ON DELETE CASCADE, -- 해당 포인트를 추가한 사용자
  spot_title VARCHAR(20) NOT NULL,       -- 사진 포인트 제목
  spot_description VARCHAR(300),                 -- 사진 포인트 설명
  latitude DOUBLE PRECISION NOT NULL,    -- 위도
  longitude DOUBLE PRECISION NOT NULL,   -- 경도
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 포인트 생성 시간
  spot_state BOOLEAN NOT NULL DEFAULT TRUE -- 포인트 상태 (소프트 삭제 여부)
);

-- Comments 테이블 생성
CREATE TABLE sry.comments (
  comment_id SERIAL PRIMARY KEY,         -- 댓글 고유 ID
  point_id INT REFERENCES sry.photo_spot(point_id) ON DELETE CASCADE, -- 해당 댓글이 달린 사진 포인트 ID
  user_id INT REFERENCES sry.users(user_id) ON DELETE CASCADE, -- 댓글 작성 사용자
  comment VARCHAR(300) NOT NULL,                 -- 댓글 내용
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 댓글 작성 시간
  comment_state BOOLEAN NOT NULL DEFAULT TRUE -- 댓글 상태 (소프트 삭제 여부)
);
