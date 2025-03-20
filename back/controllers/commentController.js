const pool = require('../database/database');

const addComment = async (req, res) => {
  const { point_id, comment } = req.body;
  const user_id = req.userId;

  try {
    // 댓글 작성
    const query = `
      INSERT INTO sry.comments (point_id, user_id, comment)
      VALUES ($1, $2, $3) RETURNING comment_id;
    `;
    const values = [point_id, user_id, comment];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: '댓글 작성 성공',
      comment_id: result.rows[0].comment_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '댓글 작성 중 오류 발생', message: err.message });
  }
};

const getComments = async (req, res) => {
  const { point_id } = req.params;

  try {
    const query = `
      SELECT c.comment_id, c.user_id, c.comment, c.created_at, u.nickname
      FROM sry.comments c
      JOIN sry.users u ON c.user_id = u.user_id
      WHERE c.point_id = $1
        AND c.comment_state = TRUE;
    `;

    const values = [point_id]; // 해당 point_id에 대한 댓글 조회

    const result = await pool.query(query, values);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '댓글 조회 중 오류 발생', message: err.message });
  }
};

module.exports = { addComment, getComments };