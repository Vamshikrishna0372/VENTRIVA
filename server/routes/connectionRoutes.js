const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Connection endpoints scheduled for future phase.' });
});

module.exports = router;
