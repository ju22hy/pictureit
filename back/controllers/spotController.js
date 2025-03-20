const pool = require('../database/database');

const addPhotoSpot = async (req, res) => {
  const { spot_title, spot_description, latitude, longitude } = req.body;
  const user_id = req.userId;

  try {
    // 포토스팟 추가 쿼리
    const query = `
      INSERT INTO sry.photo_spot (user_id, spot_title, spot_description, latitude, longitude, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING point_id;
    `;
    const values = [user_id, spot_title, spot_description || null, latitude, longitude];
    
    const result = await pool.query(query, values);

    res.status(201).json({
      message: '포토스팟 추가 성공',
      point_id: result.rows[0].point_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '포토스팟 추가 중 오류 발생', message: err.message });
  }
};

const getPhotoSpots = async (req, res) => {
  const { latitude, longitude, radius } = req.query;

  try {
    // 주어진 위도, 경도를 기준으로 일정 반경 내의 포토 스팟을 조회하는 쿼리
    const query = `
      SELECT 
        ps.point_id, ps.user_id, ps.spot_title, ps.spot_description, ps.latitude, ps.longitude, 
        ps.created_at, ps.spot_state, u.nickname
      FROM sry.photo_spot ps
      JOIN sry.users u ON ps.user_id = u.user_id  -- user_id로 users 테이블에서 nickname을 가져옴
      WHERE ST_Distance(
        ST_SetSRID(ST_MakePoint(ps.longitude, ps.latitude), 4326), 
        ST_SetSRID(ST_MakePoint($1, $2), 4326)
      ) <= $3
      AND ps.spot_state = TRUE;
    `;

    const values = [longitude, latitude, radius]; // 경도, 위도, 반경

    const result = await pool.query(query, values);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '포토스팟 목록 조회 중 오류 발생', message: err.message });
  }
};

module.exports = { addPhotoSpot, getPhotoSpots };