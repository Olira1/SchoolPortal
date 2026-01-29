// Student Controller
// Handles viewing grades, reports, and rankings for the logged-in student

const { pool } = require('../config/db');

// Helper to get student info from user
const getStudentInfo = async (userId) => {
  const [students] = await pool.query(
    `SELECT s.id, s.student_id_number as code, u.name, s.sex as gender,
            s.class_id, c.name as class_name, g.name as grade_name, g.id as grade_id
     FROM students s
     JOIN users u ON s.user_id = u.id
     JOIN classes c ON s.class_id = c.id
     JOIN grades g ON c.grade_id = g.id
     WHERE s.user_id = ?`,
    [userId]
  );
  return students.length > 0 ? students[0] : null;
};

// ==========================================
// VIEW SEMESTER REPORT
// ==========================================

/**
 * GET /api/v1/student/reports/semester
 * View semester grade report
 */
const getSemesterReport = async (req, res) => {
  try {
    const { semester_id, academic_year_id } = req.query;
    const student = await getStudentInfo(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Student profile not found.' }
      });
    }

    const [semesterInfo] = await pool.query('SELECT name FROM semesters WHERE id = ?', [semester_id]);
    const [yearInfo] = await pool.query('SELECT name FROM academic_years WHERE id = ?', [academic_year_id]);

    // Check if results are published
    const [results] = await pool.query(
      `SELECT * FROM student_semester_results 
       WHERE student_id = ? AND semester_id = ? AND is_published = TRUE`,
      [student.id, semester_id]
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Report not yet published.' }
      });
    }

    const result = results[0];

    // Get subject scores
    const [subjects] = await pool.query(
      `SELECT s.name,
              SUM(m.score / m.max_score * COALESCE(aw.weight_percent, at.default_weight_percent)) as score
       FROM marks m
       JOIN teaching_assignments ta ON m.teaching_assignment_id = ta.id
       JOIN subjects s ON ta.subject_id = s.id
       JOIN assessment_types at ON m.assessment_type_id = at.id
       LEFT JOIN assessment_weights aw ON aw.teaching_assignment_id = m.teaching_assignment_id 
                                       AND aw.assessment_type_id = m.assessment_type_id 
                                       AND aw.semester_id = m.semester_id
       WHERE m.student_id = ? AND m.semester_id = ? AND ta.class_id = ?
       GROUP BY s.id, s.name
       ORDER BY s.name`,
      [student.id, semester_id, student.class_id]
    );

    // Get total students in class
    const [totalStudents] = await pool.query(
      'SELECT COUNT(*) as count FROM students WHERE class_id = ?',
      [student.class_id]
    );

    return res.status(200).json({
      success: true,
      data: {
        student: {
          id: student.id,
          code: student.code,
          name: student.name,
          class_name: student.class_name,
          grade_name: student.grade_name
        },
        semester: semesterInfo[0]?.name,
        academic_year: yearInfo[0]?.name,
        subjects: subjects.map(s => ({
          name: s.name,
          score: Math.round((s.score || 0) * 100) / 100
        })),
        summary: {
          total: parseFloat(result.total_score) || 0,
          average: parseFloat(result.average_score) || 0,
          rank_in_class: result.rank_in_class,
          total_students: totalStudents[0].count,
          remark: result.remark
        },
        status: 'published',
        published_at: result.published_at
      },
      error: null
    });
  } catch (error) {
    console.error('Get semester report error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch semester report.' }
    });
  }
};

// ==========================================
// VIEW SUBJECT GRADES
// ==========================================

/**
 * GET /api/v1/student/subjects/:subject_id/grades
 * View detailed subject grade breakdown
 */
const getSubjectGrades = async (req, res) => {
  try {
    const { subject_id } = req.params;
    const { semester_id } = req.query;
    const student = await getStudentInfo(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Student profile not found.' }
      });
    }

    const [semesterInfo] = await pool.query('SELECT name FROM semesters WHERE id = ?', [semester_id]);
    const [subjectInfo] = await pool.query('SELECT id, name FROM subjects WHERE id = ?', [subject_id]);

    if (subjectInfo.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Subject not found.' }
      });
    }

    // Get teaching assignment for this subject/class
    const [assignments] = await pool.query(
      `SELECT ta.id, u.name as teacher_name
       FROM teaching_assignments ta
       JOIN users u ON ta.teacher_id = u.id
       WHERE ta.class_id = ? AND ta.subject_id = ?`,
      [student.class_id, subject_id]
    );

    if (assignments.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Subject not assigned to your class.' }
      });
    }

    // Get assessment scores
    const [assessments] = await pool.query(
      `SELECT at.name as type, m.score, m.max_score,
              COALESCE(aw.weight_percent, at.default_weight_percent) as weight_percent,
              (m.score / m.max_score * COALESCE(aw.weight_percent, at.default_weight_percent)) as weighted_score,
              m.created_at as date
       FROM marks m
       JOIN assessment_types at ON m.assessment_type_id = at.id
       LEFT JOIN assessment_weights aw ON aw.teaching_assignment_id = m.teaching_assignment_id 
                                       AND aw.assessment_type_id = m.assessment_type_id 
                                       AND aw.semester_id = m.semester_id
       WHERE m.student_id = ? AND m.teaching_assignment_id = ? AND m.semester_id = ?
       ORDER BY m.created_at`,
      [student.id, assignments[0].id, semester_id]
    );

    // Calculate summary
    const subjectTotal = assessments.reduce((sum, a) => sum + (a.score || 0), 0);
    const subjectAverage = assessments.reduce((sum, a) => sum + (a.weighted_score || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        subject: subjectInfo[0],
        teacher: { name: assignments[0].teacher_name },
        semester: semesterInfo[0]?.name,
        assessments: assessments.map(a => ({
          type: a.type,
          score: a.score,
          max_score: a.max_score,
          weight_percent: parseFloat(a.weight_percent),
          weighted_score: Math.round((a.weighted_score || 0) * 100) / 100,
          date: a.date
        })),
        summary: {
          subject_total: subjectTotal,
          subject_average: Math.round(subjectAverage * 100) / 100
        }
      },
      error: null
    });
  } catch (error) {
    console.error('Get subject grades error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch subject grades.' }
    });
  }
};

// ==========================================
// VIEW RANK
// ==========================================

/**
 * GET /api/v1/student/rank
 * View rank and comparison
 */
const getRank = async (req, res) => {
  try {
    const { semester_id, academic_year_id, type = 'semester' } = req.query;
    const student = await getStudentInfo(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Student profile not found.' }
      });
    }

    const [semesterInfo] = await pool.query('SELECT name FROM semesters WHERE id = ?', [semester_id]);
    const [yearInfo] = await pool.query('SELECT name FROM academic_years WHERE id = ?', [academic_year_id]);

    // Get student's result
    const [results] = await pool.query(
      `SELECT * FROM student_semester_results WHERE student_id = ? AND semester_id = ?`,
      [student.id, semester_id]
    );

    // Get class statistics
    const [classStats] = await pool.query(
      `SELECT 
         AVG(ssr.average_score) as class_average,
         MAX(ssr.total_score) as highest_total,
         MIN(ssr.total_score) as lowest_total,
         COUNT(*) as total_students
       FROM student_semester_results ssr
       JOIN students s ON ssr.student_id = s.id
       WHERE s.class_id = ? AND ssr.semester_id = ?`,
      [student.class_id, semester_id]
    );

    const studentResult = results[0] || {};
    const stats = classStats[0] || {};

    const classAverage = parseFloat(stats.class_average) || 0;
    const studentAverage = parseFloat(studentResult.average_score) || 0;

    return res.status(200).json({
      success: true,
      data: {
        student_id: student.id,
        student_name: student.name,
        class_name: student.class_name,
        type: type,
        period: `${semesterInfo[0]?.name} ${yearInfo[0]?.name}`,
        rank: {
          position: studentResult.rank_in_class || null,
          total_students: stats.total_students || 0
        },
        scores: {
          total: parseFloat(studentResult.total_score) || 0,
          average: studentAverage
        },
        comparison: {
          class_average: Math.round(classAverage * 100) / 100,
          class_highest_total: parseFloat(stats.highest_total) || 0,
          class_lowest_total: parseFloat(stats.lowest_total) || 0,
          above_average: studentAverage > classAverage,
          difference_from_average: Math.round((studentAverage - classAverage) * 100) / 100
        },
        remark: studentResult.remark || 'Pending'
      },
      error: null
    });
  } catch (error) {
    console.error('Get rank error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch rank.' }
    });
  }
};

// ==========================================
// GET PROFILE
// ==========================================

/**
 * GET /api/v1/student/profile
 * Get student profile
 */
const getProfile = async (req, res) => {
  try {
    const student = await getStudentInfo(req.user.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Student profile not found.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: student.id,
        code: student.code,
        name: student.name,
        gender: student.gender,
        class_name: student.class_name,
        grade_name: student.grade_name
      },
      error: null
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch profile.' }
    });
  }
};

module.exports = {
  getSemesterReport,
  getSubjectGrades,
  getRank,
  getProfile
};


