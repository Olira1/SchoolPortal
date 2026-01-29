// Student Routes
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, checkRole } = require('../middleware/auth');

// All routes require authentication and student role
router.use(verifyToken);
router.use(checkRole('student'));

// ==========================================
// PROFILE
// ==========================================
router.get('/profile', studentController.getProfile);

// ==========================================
// REPORTS
// ==========================================
router.get('/reports/semester', studentController.getSemesterReport);

// ==========================================
// SUBJECTS
// ==========================================
router.get('/subjects/:subject_id/grades', studentController.getSubjectGrades);

// ==========================================
// RANK
// ==========================================
router.get('/rank', studentController.getRank);

module.exports = router;



