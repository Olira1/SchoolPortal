// School Head Controller
// Handles grades, classes, subjects, assessment types, and teacher assignments
// All operations are scoped to the school from JWT token

const { pool } = require('../config/db');

// Helper to get current academic year
const getCurrentAcademicYear = async () => {
  const [years] = await pool.query(
    'SELECT * FROM academic_years WHERE is_current = true LIMIT 1'
  );
  return years.length > 0 ? years[0] : null;
};

// ==========================================
// GRADES MANAGEMENT
// ==========================================

/**
 * GET /api/v1/school/grades
 * List all grades for the school
 */
const listGrades = async (req, res) => {
  try {
    const schoolId = req.user.school_id;

    const [grades] = await pool.query(
      `SELECT g.*, 
              (SELECT COUNT(*) FROM classes c WHERE c.grade_id = g.id) as total_classes,
              (SELECT COUNT(*) FROM students s 
               JOIN classes c ON s.class_id = c.id 
               WHERE c.grade_id = g.id) as total_students
       FROM grades g
       WHERE g.school_id = ?
       ORDER BY g.level ASC`,
      [schoolId]
    );

    return res.status(200).json({
      success: true,
      data: { items: grades },
      error: null
    });
  } catch (error) {
    console.error('List grades error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch grades.' }
    });
  }
};

/**
 * GET /api/v1/school/grades/:grade_id
 * Get grade details with classes
 */
const getGrade = async (req, res) => {
  try {
    const { grade_id } = req.params;
    const schoolId = req.user.school_id;

    const [grades] = await pool.query(
      'SELECT * FROM grades WHERE id = ? AND school_id = ?',
      [grade_id, schoolId]
    );

    if (grades.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Grade not found.' }
      });
    }

    const grade = grades[0];

    // Get classes for this grade
    const [classes] = await pool.query(
      `SELECT c.id, c.name, 
              (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) as student_count
       FROM classes c WHERE c.grade_id = ?`,
      [grade_id]
    );

    return res.status(200).json({
      success: true,
      data: { ...grade, classes },
      error: null
    });
  } catch (error) {
    console.error('Get grade error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch grade.' }
    });
  }
};

/**
 * POST /api/v1/school/grades
 * Create a new grade
 */
const createGrade = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { level, name } = req.body;

    if (!level || !name) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Level and name are required.' }
      });
    }

    // Check if grade level already exists
    const [existing] = await pool.query(
      'SELECT id FROM grades WHERE school_id = ? AND level = ?',
      [schoolId, level]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: { code: 'CONFLICT', message: 'Grade level already exists.' }
      });
    }

    const [result] = await pool.query(
      'INSERT INTO grades (school_id, level, name) VALUES (?, ?, ?)',
      [schoolId, level, name]
    );

    return res.status(201).json({
      success: true,
      data: { id: result.insertId, level, name, school_id: schoolId },
      error: null
    });
  } catch (error) {
    console.error('Create grade error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create grade.' }
    });
  }
};

/**
 * PUT /api/v1/school/grades/:grade_id
 * Update grade
 */
const updateGrade = async (req, res) => {
  try {
    const { grade_id } = req.params;
    const schoolId = req.user.school_id;
    const { name } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM grades WHERE id = ? AND school_id = ?',
      [grade_id, schoolId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Grade not found.' }
      });
    }

    await pool.query('UPDATE grades SET name = ? WHERE id = ?', [name, grade_id]);

    return res.status(200).json({
      success: true,
      data: { id: parseInt(grade_id), name, updated: true },
      error: null
    });
  } catch (error) {
    console.error('Update grade error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update grade.' }
    });
  }
};

/**
 * DELETE /api/v1/school/grades/:grade_id
 * Delete grade
 */
const deleteGrade = async (req, res) => {
  try {
    const { grade_id } = req.params;
    const schoolId = req.user.school_id;

    const [existing] = await pool.query(
      'SELECT * FROM grades WHERE id = ? AND school_id = ?',
      [grade_id, schoolId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Grade not found.' }
      });
    }

    // Check for classes
    const [classes] = await pool.query(
      'SELECT COUNT(*) as count FROM classes WHERE grade_id = ?',
      [grade_id]
    );

    if (classes[0].count > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: { code: 'CONFLICT', message: 'Grade has classes. Delete classes first.' }
      });
    }

    await pool.query('DELETE FROM grades WHERE id = ?', [grade_id]);

    return res.status(200).json({
      success: true,
      data: { message: 'Grade deleted successfully.' },
      error: null
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete grade.' }
    });
  }
};

// ==========================================
// CLASSES MANAGEMENT
// ==========================================

/**
 * GET /api/v1/school/classes
 * List all classes for the school
 */
const listClasses = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { grade_id } = req.query;

    let query = `
      SELECT c.*, g.name as grade_name, g.level as grade_level,
             u.name as class_head_name, u.phone as class_head_phone,
             (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) as student_count
      FROM classes c
      JOIN grades g ON c.grade_id = g.id
      LEFT JOIN users u ON c.class_head_id = u.id
      WHERE g.school_id = ?
    `;
    const params = [schoolId];

    if (grade_id) {
      query += ' AND c.grade_id = ?';
      params.push(grade_id);
    }

    query += ' ORDER BY g.level, c.name';

    const [classes] = await pool.query(query, params);

    const items = classes.map(c => ({
      id: c.id,
      name: c.name,
      grade_id: c.grade_id,
      grade_name: c.grade_name,
      grade_level: c.grade_level,
      class_head: c.class_head_id ? {
        id: c.class_head_id,
        name: c.class_head_name,
        phone: c.class_head_phone
      } : null,
      student_count: c.student_count
    }));

    return res.status(200).json({
      success: true,
      data: { items },
      error: null
    });
  } catch (error) {
    console.error('List classes error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch classes.' }
    });
  }
};

/**
 * GET /api/v1/school/classes/:class_id
 * Get class details
 */
const getClass = async (req, res) => {
  try {
    const { class_id } = req.params;
    const schoolId = req.user.school_id;

    const [classes] = await pool.query(
      `SELECT c.*, g.name as grade_name, g.level as grade_level,
              u.name as class_head_name, u.phone as class_head_phone
       FROM classes c
       JOIN grades g ON c.grade_id = g.id
       LEFT JOIN users u ON c.class_head_id = u.id
       WHERE c.id = ? AND g.school_id = ?`,
      [class_id, schoolId]
    );

    if (classes.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Class not found.' }
      });
    }

    const cls = classes[0];

    // Get student count
    const [studentCount] = await pool.query(
      'SELECT COUNT(*) as count FROM students WHERE class_id = ?',
      [class_id]
    );

    // Get teaching assignments
    const [assignments] = await pool.query(
      `SELECT ta.id, ta.teacher_id, u.name as teacher_name, 
              ta.subject_id, s.name as subject_name
       FROM teaching_assignments ta
       JOIN users u ON ta.teacher_id = u.id
       JOIN subjects s ON ta.subject_id = s.id
       WHERE ta.class_id = ?`,
      [class_id]
    );

    return res.status(200).json({
      success: true,
      data: {
        id: cls.id,
        name: cls.name,
        grade: { id: cls.grade_id, name: cls.grade_name, level: cls.grade_level },
        class_head: cls.class_head_id ? {
          id: cls.class_head_id,
          name: cls.class_head_name,
          phone: cls.class_head_phone
        } : null,
        student_count: studentCount[0].count,
        teaching_assignments: assignments
      },
      error: null
    });
  } catch (error) {
    console.error('Get class error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch class.' }
    });
  }
};

/**
 * POST /api/v1/school/classes
 * Create a new class
 */
const createClass = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { name, grade_id, class_head_id } = req.body;

    if (!name || !grade_id) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Name and grade_id are required.' }
      });
    }

    // Verify grade belongs to school
    const [grade] = await pool.query(
      'SELECT * FROM grades WHERE id = ? AND school_id = ?',
      [grade_id, schoolId]
    );

    if (grade.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid grade_id.' }
      });
    }

    // Get current academic year
    const academicYear = await getCurrentAcademicYear();
    if (!academicYear) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'No current academic year set.' }
      });
    }

    // Check if class name exists for this grade
    const [existing] = await pool.query(
      'SELECT id FROM classes WHERE grade_id = ? AND name = ?',
      [grade_id, name]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: { code: 'CONFLICT', message: 'Class name already exists for this grade.' }
      });
    }

    const [result] = await pool.query(
      'INSERT INTO classes (grade_id, name, class_head_id, academic_year_id) VALUES (?, ?, ?, ?)',
      [grade_id, name, class_head_id || null, academicYear.id]
    );

    return res.status(201).json({
      success: true,
      data: { id: result.insertId, name, grade_id },
      error: null
    });
  } catch (error) {
    console.error('Create class error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create class.' }
    });
  }
};

/**
 * PUT /api/v1/school/classes/:class_id
 * Update class
 */
const updateClass = async (req, res) => {
  try {
    const { class_id } = req.params;
    const schoolId = req.user.school_id;
    const { name, class_head_id } = req.body;

    // Verify class belongs to school
    const [cls] = await pool.query(
      `SELECT c.* FROM classes c
       JOIN grades g ON c.grade_id = g.id
       WHERE c.id = ? AND g.school_id = ?`,
      [class_id, schoolId]
    );

    if (cls.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Class not found.' }
      });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (class_head_id !== undefined) {
      updates.push('class_head_id = ?');
      params.push(class_head_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'No fields to update.' }
      });
    }

    params.push(class_id);
    await pool.query(`UPDATE classes SET ${updates.join(', ')} WHERE id = ?`, params);

    return res.status(200).json({
      success: true,
      data: { id: parseInt(class_id), updated: true },
      error: null
    });
  } catch (error) {
    console.error('Update class error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update class.' }
    });
  }
};

/**
 * DELETE /api/v1/school/classes/:class_id
 * Delete class
 */
const deleteClass = async (req, res) => {
  try {
    const { class_id } = req.params;
    const schoolId = req.user.school_id;

    // Verify class belongs to school
    const [cls] = await pool.query(
      `SELECT c.* FROM classes c
       JOIN grades g ON c.grade_id = g.id
       WHERE c.id = ? AND g.school_id = ?`,
      [class_id, schoolId]
    );

    if (cls.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Class not found.' }
      });
    }

    // Check for students
    const [students] = await pool.query(
      'SELECT COUNT(*) as count FROM students WHERE class_id = ?',
      [class_id]
    );

    if (students[0].count > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: { code: 'CONFLICT', message: 'Class has students enrolled.' }
      });
    }

    await pool.query('DELETE FROM classes WHERE id = ?', [class_id]);

    return res.status(200).json({
      success: true,
      data: { message: 'Class deleted successfully.' },
      error: null
    });
  } catch (error) {
    console.error('Delete class error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete class.' }
    });
  }
};

// ==========================================
// SUBJECTS MANAGEMENT
// ==========================================

/**
 * GET /api/v1/school/subjects
 * List all subjects for the school
 */
const listSubjects = async (req, res) => {
  try {
    const schoolId = req.user.school_id;

    const [subjects] = await pool.query(
      'SELECT * FROM subjects WHERE school_id = ? ORDER BY name',
      [schoolId]
    );

    return res.status(200).json({
      success: true,
      data: { items: subjects },
      error: null
    });
  } catch (error) {
    console.error('List subjects error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch subjects.' }
    });
  }
};

/**
 * POST /api/v1/school/subjects
 * Create a new subject
 */
const createSubject = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Subject name is required.' }
      });
    }

    // Check if subject exists
    const [existing] = await pool.query(
      'SELECT id FROM subjects WHERE school_id = ? AND name = ?',
      [schoolId, name]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: { code: 'CONFLICT', message: 'Subject already exists.' }
      });
    }

    const [result] = await pool.query(
      'INSERT INTO subjects (school_id, name) VALUES (?, ?)',
      [schoolId, name]
    );

    return res.status(201).json({
      success: true,
      data: { id: result.insertId, name, school_id: schoolId },
      error: null
    });
  } catch (error) {
    console.error('Create subject error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create subject.' }
    });
  }
};

/**
 * PUT /api/v1/school/subjects/:subject_id
 * Update subject
 */
const updateSubject = async (req, res) => {
  try {
    const { subject_id } = req.params;
    const schoolId = req.user.school_id;
    const { name } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM subjects WHERE id = ? AND school_id = ?',
      [subject_id, schoolId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Subject not found.' }
      });
    }

    await pool.query('UPDATE subjects SET name = ? WHERE id = ?', [name, subject_id]);

    return res.status(200).json({
      success: true,
      data: { id: parseInt(subject_id), name, updated: true },
      error: null
    });
  } catch (error) {
    console.error('Update subject error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update subject.' }
    });
  }
};

/**
 * DELETE /api/v1/school/subjects/:subject_id
 * Delete subject
 */
const deleteSubject = async (req, res) => {
  try {
    const { subject_id } = req.params;
    const schoolId = req.user.school_id;

    const [existing] = await pool.query(
      'SELECT * FROM subjects WHERE id = ? AND school_id = ?',
      [subject_id, schoolId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Subject not found.' }
      });
    }

    // Check for teaching assignments
    const [assignments] = await pool.query(
      'SELECT COUNT(*) as count FROM teaching_assignments WHERE subject_id = ?',
      [subject_id]
    );

    if (assignments[0].count > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: { code: 'CONFLICT', message: 'Subject has teaching assignments.' }
      });
    }

    await pool.query('DELETE FROM subjects WHERE id = ?', [subject_id]);

    return res.status(200).json({
      success: true,
      data: { message: 'Subject deleted successfully.' },
      error: null
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete subject.' }
    });
  }
};

// ==========================================
// ASSESSMENT TYPES
// ==========================================

/**
 * GET /api/v1/school/assessment-types
 * List assessment types for the school
 */
const listAssessmentTypes = async (req, res) => {
  try {
    const schoolId = req.user.school_id;

    const [types] = await pool.query(
      'SELECT * FROM assessment_types WHERE school_id = ? ORDER BY name',
      [schoolId]
    );

    return res.status(200).json({
      success: true,
      data: { items: types },
      error: null
    });
  } catch (error) {
    console.error('List assessment types error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch assessment types.' }
    });
  }
};

/**
 * POST /api/v1/school/assessment-types
 * Create assessment type
 */
const createAssessmentType = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { name, default_weight_percent } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Name is required.' }
      });
    }

    const [existing] = await pool.query(
      'SELECT id FROM assessment_types WHERE school_id = ? AND name = ?',
      [schoolId, name]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: { code: 'CONFLICT', message: 'Assessment type already exists.' }
      });
    }

    const [result] = await pool.query(
      'INSERT INTO assessment_types (school_id, name, default_weight_percent) VALUES (?, ?, ?)',
      [schoolId, name, default_weight_percent || null]
    );

    return res.status(201).json({
      success: true,
      data: { id: result.insertId, name, default_weight_percent },
      error: null
    });
  } catch (error) {
    console.error('Create assessment type error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create assessment type.' }
    });
  }
};

/**
 * PUT /api/v1/school/assessment-types/:type_id
 * Update assessment type
 */
const updateAssessmentType = async (req, res) => {
  try {
    const { type_id } = req.params;
    const schoolId = req.user.school_id;
    const { name, default_weight_percent } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM assessment_types WHERE id = ? AND school_id = ?',
      [type_id, schoolId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Assessment type not found.' }
      });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (default_weight_percent !== undefined) { 
      updates.push('default_weight_percent = ?'); 
      params.push(default_weight_percent); 
    }

    params.push(type_id);
    await pool.query(`UPDATE assessment_types SET ${updates.join(', ')} WHERE id = ?`, params);

    return res.status(200).json({
      success: true,
      data: { id: parseInt(type_id), updated: true },
      error: null
    });
  } catch (error) {
    console.error('Update assessment type error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update assessment type.' }
    });
  }
};

/**
 * DELETE /api/v1/school/assessment-types/:type_id
 * Delete assessment type
 */
const deleteAssessmentType = async (req, res) => {
  try {
    const { type_id } = req.params;
    const schoolId = req.user.school_id;

    const [existing] = await pool.query(
      'SELECT * FROM assessment_types WHERE id = ? AND school_id = ?',
      [type_id, schoolId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Assessment type not found.' }
      });
    }

    // Check for weights using this type
    const [weights] = await pool.query(
      'SELECT COUNT(*) as count FROM assessment_weights WHERE assessment_type_id = ?',
      [type_id]
    );

    if (weights[0].count > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: { code: 'CONFLICT', message: 'Assessment type is in use.' }
      });
    }

    await pool.query('DELETE FROM assessment_types WHERE id = ?', [type_id]);

    return res.status(200).json({
      success: true,
      data: { message: 'Assessment type deleted successfully.' },
      error: null
    });
  } catch (error) {
    console.error('Delete assessment type error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete assessment type.' }
    });
  }
};

// ==========================================
// TEACHING ASSIGNMENTS
// ==========================================

/**
 * GET /api/v1/school/teaching-assignments
 * List all teaching assignments
 */
const listTeachingAssignments = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { teacher_id, class_id, subject_id } = req.query;

    let query = `
      SELECT ta.*, 
             u.name as teacher_name, u.phone as teacher_phone,
             c.name as class_name, g.name as grade_name, g.level as grade_level,
             s.name as subject_name
      FROM teaching_assignments ta
      JOIN users u ON ta.teacher_id = u.id
      JOIN classes c ON ta.class_id = c.id
      JOIN grades g ON c.grade_id = g.id
      JOIN subjects s ON ta.subject_id = s.id
      WHERE g.school_id = ?
    `;
    const params = [schoolId];

    if (teacher_id) { query += ' AND ta.teacher_id = ?'; params.push(teacher_id); }
    if (class_id) { query += ' AND ta.class_id = ?'; params.push(class_id); }
    if (subject_id) { query += ' AND ta.subject_id = ?'; params.push(subject_id); }

    query += ' ORDER BY g.level, c.name, s.name';

    const [assignments] = await pool.query(query, params);

    const items = assignments.map(a => ({
      id: a.id,
      teacher: { id: a.teacher_id, name: a.teacher_name, phone: a.teacher_phone },
      class: { id: a.class_id, name: a.class_name, grade_name: a.grade_name },
      subject: { id: a.subject_id, name: a.subject_name }
    }));

    return res.status(200).json({
      success: true,
      data: { items },
      error: null
    });
  } catch (error) {
    console.error('List teaching assignments error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch teaching assignments.' }
    });
  }
};

/**
 * POST /api/v1/school/teaching-assignments
 * Create teaching assignment
 */
const createTeachingAssignment = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { teacher_id, class_id, subject_id } = req.body;

    if (!teacher_id || !class_id || !subject_id) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'teacher_id, class_id, and subject_id are required.' }
      });
    }

    // Verify teacher belongs to school
    const [teacher] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND school_id = ? AND role IN (?, ?)',
      [teacher_id, schoolId, 'teacher', 'class_head']
    );

    if (teacher.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid teacher.' }
      });
    }

    // Verify class belongs to school
    const [cls] = await pool.query(
      `SELECT c.* FROM classes c
       JOIN grades g ON c.grade_id = g.id
       WHERE c.id = ? AND g.school_id = ?`,
      [class_id, schoolId]
    );

    if (cls.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid class.' }
      });
    }

    // Get current academic year
    const academicYear = await getCurrentAcademicYear();

    // Check for existing assignment
    const [existing] = await pool.query(
      `SELECT id FROM teaching_assignments 
       WHERE teacher_id = ? AND class_id = ? AND subject_id = ? AND academic_year_id = ?`,
      [teacher_id, class_id, subject_id, academicYear.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: { code: 'CONFLICT', message: 'Teaching assignment already exists.' }
      });
    }

    const [result] = await pool.query(
      `INSERT INTO teaching_assignments (teacher_id, class_id, subject_id, academic_year_id)
       VALUES (?, ?, ?, ?)`,
      [teacher_id, class_id, subject_id, academicYear.id]
    );

    return res.status(201).json({
      success: true,
      data: { id: result.insertId, teacher_id, class_id, subject_id },
      error: null
    });
  } catch (error) {
    console.error('Create teaching assignment error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create teaching assignment.' }
    });
  }
};

/**
 * DELETE /api/v1/school/teaching-assignments/:assignment_id
 * Delete teaching assignment
 */
const deleteTeachingAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const schoolId = req.user.school_id;

    // Verify assignment belongs to school
    const [assignment] = await pool.query(
      `SELECT ta.* FROM teaching_assignments ta
       JOIN classes c ON ta.class_id = c.id
       JOIN grades g ON c.grade_id = g.id
       WHERE ta.id = ? AND g.school_id = ?`,
      [assignment_id, schoolId]
    );

    if (assignment.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Teaching assignment not found.' }
      });
    }

    // Check for marks
    const [marks] = await pool.query(
      'SELECT COUNT(*) as count FROM marks WHERE teaching_assignment_id = ?',
      [assignment_id]
    );

    if (marks[0].count > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: { code: 'CONFLICT', message: 'Assignment has marks recorded.' }
      });
    }

    await pool.query('DELETE FROM teaching_assignments WHERE id = ?', [assignment_id]);

    return res.status(200).json({
      success: true,
      data: { message: 'Teaching assignment deleted successfully.' },
      error: null
    });
  } catch (error) {
    console.error('Delete teaching assignment error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete teaching assignment.' }
    });
  }
};

// ==========================================
// TEACHERS LIST
// ==========================================

/**
 * GET /api/v1/school/teachers
 * List all teachers in the school
 */
const listTeachers = async (req, res) => {
  try {
    const schoolId = req.user.school_id;

    const [teachers] = await pool.query(
      `SELECT id, name, email, phone, role, is_active 
       FROM users 
       WHERE school_id = ? AND role IN ('teacher', 'class_head')
       ORDER BY name`,
      [schoolId]
    );

    return res.status(200).json({
      success: true,
      data: { items: teachers },
      error: null
    });
  } catch (error) {
    console.error('List teachers error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch teachers.' }
    });
  }
};

// ==========================================
// ASSIGN CLASS HEAD
// ==========================================

/**
 * POST /api/v1/school/classes/:class_id/class-head
 * Assign class head to a class
 */
const assignClassHead = async (req, res) => {
  try {
    const { class_id } = req.params;
    const schoolId = req.user.school_id;
    const { teacher_id } = req.body;

    // Verify class belongs to school
    const [cls] = await pool.query(
      `SELECT c.* FROM classes c
       JOIN grades g ON c.grade_id = g.id
       WHERE c.id = ? AND g.school_id = ?`,
      [class_id, schoolId]
    );

    if (cls.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Class not found.' }
      });
    }

    // Verify teacher exists and belongs to school
    const [teacher] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND school_id = ? AND role IN (?, ?)',
      [teacher_id, schoolId, 'teacher', 'class_head']
    );

    if (teacher.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid teacher.' }
      });
    }

    // Update class with class head
    await pool.query('UPDATE classes SET class_head_id = ? WHERE id = ?', [teacher_id, class_id]);

    // Update teacher role to class_head if not already
    await pool.query(
      "UPDATE users SET role = 'class_head' WHERE id = ? AND role = 'teacher'",
      [teacher_id]
    );

    return res.status(200).json({
      success: true,
      data: {
        class_id: parseInt(class_id),
        class_head: {
          id: teacher[0].id,
          name: teacher[0].name,
          phone: teacher[0].phone
        }
      },
      error: null
    });
  } catch (error) {
    console.error('Assign class head error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to assign class head.' }
    });
  }
};

/**
 * DELETE /api/v1/school/classes/:class_id/class-head
 * Remove class head from class
 */
const removeClassHead = async (req, res) => {
  try {
    const { class_id } = req.params;
    const schoolId = req.user.school_id;

    // Verify class belongs to school
    const [cls] = await pool.query(
      `SELECT c.* FROM classes c
       JOIN grades g ON c.grade_id = g.id
       WHERE c.id = ? AND g.school_id = ?`,
      [class_id, schoolId]
    );

    if (cls.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: 'Class not found.' }
      });
    }

    await pool.query('UPDATE classes SET class_head_id = NULL WHERE id = ?', [class_id]);

    return res.status(200).json({
      success: true,
      data: { message: 'Class head removed successfully.' },
      error: null
    });
  } catch (error) {
    console.error('Remove class head error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to remove class head.' }
    });
  }
};

module.exports = {
  // Grades
  listGrades, getGrade, createGrade, updateGrade, deleteGrade,
  // Classes
  listClasses, getClass, createClass, updateClass, deleteClass,
  // Subjects
  listSubjects, createSubject, updateSubject, deleteSubject,
  // Assessment Types
  listAssessmentTypes, createAssessmentType, updateAssessmentType, deleteAssessmentType,
  // Teaching Assignments
  listTeachingAssignments, createTeachingAssignment, deleteTeachingAssignment,
  // Teachers
  listTeachers,
  // Class Head
  assignClassHead, removeClassHead
};



