// Seed TiDB Database with Initial Data
// Run this with: node seed-tidb-database.js

require('dotenv').config({ path: '.env.production' });
const mysql = require('mysql2/promise');

async function seedDatabase() {
  console.log('🌱 Seeding TiDB Cloud Database...\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });

    console.log('✅ Connected to TiDB Cloud\n');

    // Password hash for "password123"
    const passwordHash = '$2b$10$wiwNbdc86UtSNX.Ov0NPEe7/TwojKO5MrBTVHGfNEoPqPIF7ojzNa';

    // 1. Insert Admin
    console.log('👤 Creating admin user...');
    await connection.query(`
      INSERT INTO users (name, email, password, phone, role, school_id) VALUES
      ('System Admin', 'admin@schoolportal.com', '${passwordHash}', '0911000000', 'admin', NULL)
    `);

    // 2. Insert Schools
    console.log('🏫 Creating schools...');
    await connection.query(`
      INSERT INTO schools (name, address, phone, email) VALUES
      ('Addis Ababa Secondary School', 'Bole, Addis Ababa', '0111234567', 'info@aass.edu.et'),
      ('Bahir Dar Comprehensive School', 'Bahir Dar City', '0582201234', 'info@bdcs.edu.et')
    `);

    // 3. Insert School Heads
    console.log('👔 Creating school heads...');
    await connection.query(`
      INSERT INTO users (name, email, password, phone, role, school_id) VALUES
      ('Ato Kebede Alemu', 'schoolhead@schoolportal.com', '${passwordHash}', '0912111111', 'school_head', 1),
      ('Ato Tadesse Bekele', 'schoolhead2@schoolportal.com', '${passwordHash}', '0913222222', 'school_head', 2)
    `);

    // Update schools with their school heads
    await connection.query('UPDATE schools SET school_head_id = 2 WHERE id = 1');
    await connection.query('UPDATE schools SET school_head_id = 3 WHERE id = 2');

    // 4. Insert Academic Years
    console.log('📅 Creating academic years...');
    await connection.query(`
      INSERT INTO academic_years (name, start_date, end_date, is_current) VALUES
      ('2015 E.C', '2022-09-01', '2023-06-30', FALSE),
      ('2016 E.C', '2023-09-01', '2024-06-30', FALSE),
      ('2017 E.C', '2024-09-01', '2025-06-30', TRUE)
    `);

    // 5. Insert Semesters
    console.log('📆 Creating semesters...');
    await connection.query(`
      INSERT INTO semesters (academic_year_id, name, semester_number, start_date, end_date, is_current) VALUES
      (1, 'First Semester', 1, '2022-09-01', '2023-01-31', FALSE),
      (1, 'Second Semester', 2, '2023-02-01', '2023-06-30', FALSE),
      (2, 'First Semester', 1, '2023-09-01', '2024-01-31', FALSE),
      (2, 'Second Semester', 2, '2024-02-01', '2024-06-30', FALSE),
      (3, 'First Semester', 1, '2024-09-01', '2025-01-31', TRUE),
      (3, 'Second Semester', 2, '2025-02-01', '2025-06-30', FALSE)
    `);

    // 6. Insert Grades
    console.log('📊 Creating grades...');
    await connection.query(`
      INSERT INTO grades (school_id, level, name) VALUES
      (1, 9, 'Grade 9'),
      (1, 10, 'Grade 10'),
      (1, 11, 'Grade 11'),
      (1, 12, 'Grade 12')
    `);

    // 7. Insert Classes
    console.log('🎓 Creating classes...');
    await connection.query(`
      INSERT INTO classes (grade_id, name, class_head_id, academic_year_id) VALUES
      (1, '9A', NULL, 3),
      (1, '9B', NULL, 3),
      (2, '10A', NULL, 3),
      (2, '10B', NULL, 3)
    `);

    // 8. Insert Subjects
    console.log('📚 Creating subjects...');
    await connection.query(`
      INSERT INTO subjects (school_id, name) VALUES
      (1, 'Mathematics'),
      (1, 'English'),
      (1, 'Physics'),
      (1, 'Chemistry'),
      (1, 'Biology'),
      (1, 'History'),
      (1, 'Geography'),
      (1, 'Amharic')
    `);

    // 9. Insert Teachers
    console.log('👨‍🏫 Creating teachers...');
    await connection.query(`
      INSERT INTO users (name, email, password, phone, role, school_id) VALUES
      ('Teacher Almaz Tesfaye', 'teacher@schoolportal.com', '${passwordHash}', '0914111111', 'teacher', 1),
      ('Teacher Mulugeta Haile', 'teacher2@schoolportal.com', '${passwordHash}', '0914222222', 'teacher', 1)
    `);

    // 10. Insert Class Head
    console.log('👨‍🎓 Creating class head...');
    await connection.query(`
      INSERT INTO users (name, email, password, phone, role, school_id) VALUES
      ('Class Head Yohannes Bekele', 'classhead@schoolportal.com', '${passwordHash}', '0915111111', 'class_head', 1)
    `);

    // Update class with class head
    await connection.query('UPDATE classes SET class_head_id = 6 WHERE id = 1');

    // 11. Insert Students
    console.log('👨‍🎓 Creating students...');
    await connection.query(`
      INSERT INTO users (name, email, password, phone, role, school_id) VALUES
      ('Student Abebe Kebede', 'student@schoolportal.com', '${passwordHash}', '0916111111', 'student', 1),
      ('Student Tigist Alemu', 'student2@schoolportal.com', '${passwordHash}', '0916222222', 'student', 1),
      ('Student Dawit Tesfaye', 'student3@schoolportal.com', '${passwordHash}', '0916333333', 'student', 1)
    `);

    await connection.query(`
      INSERT INTO students (user_id, class_id, student_id_number, date_of_birth, sex, date_of_admission) VALUES
      (7, 1, 'AASS-2024-001', '2008-05-15', 'Male', '2024-09-01'),
      (8, 1, 'AASS-2024-002', '2008-07-20', 'Female', '2024-09-01'),
      (9, 1, 'AASS-2024-003', '2008-03-10', 'Male', '2024-09-01')
    `);

    // 12. Insert Parents
    console.log('👨‍👩‍👧 Creating parents...');
    await connection.query(`
      INSERT INTO users (name, email, password, phone, role, school_id) VALUES
      ('Parent Kebede Alemu', 'parent@schoolportal.com', '${passwordHash}', '0917111111', 'parent', 1),
      ('Parent Almaz Tesfaye', 'parent2@schoolportal.com', '${passwordHash}', '0917222222', 'parent', 1)
    `);

    await connection.query(`
      INSERT INTO student_parents (student_id, parent_id, relationship) VALUES
      (1, 10, 'Father'),
      (2, 11, 'Mother')
    `);

    // 13. Insert Store House
    console.log('🏪 Creating store house user...');
    await connection.query(`
      INSERT INTO users (name, email, password, phone, role, school_id) VALUES
      ('Store House Manager', 'storehouse@schoolportal.com', '${passwordHash}', '0918111111', 'store_house', 1)
    `);

    // 14. Insert Assessment Types
    console.log('📝 Creating assessment types...');
    await connection.query(`
      INSERT INTO assessment_types (school_id, name, default_weight_percent) VALUES
      (1, 'Test', 15.00),
      (1, 'Quiz', 10.00),
      (1, 'Assignment', 10.00),
      (1, 'Mid-Exam', 25.00),
      (1, 'Final Exam', 40.00)
    `);

    // 15. Insert Teaching Assignments
    console.log('📖 Creating teaching assignments...');
    await connection.query(`
      INSERT INTO teaching_assignments (teacher_id, class_id, subject_id, academic_year_id) VALUES
      (4, 1, 1, 3),
      (4, 1, 3, 3),
      (5, 1, 2, 3),
      (5, 1, 4, 3)
    `);

    // 16. Insert Promotion Criteria
    console.log('📋 Creating promotion criteria...');
    await connection.query(`
      INSERT INTO promotion_criteria (name, passing_average, passing_per_subject, max_failing_subjects, is_active) VALUES
      ('Standard Secondary Criteria', 50.00, 40.00, 2, TRUE)
    `);

    console.log('\n✅ Database seeded successfully!\n');

    // Show summary
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [schoolCount] = await connection.query('SELECT COUNT(*) as count FROM schools');
    const [studentCount] = await connection.query('SELECT COUNT(*) as count FROM students');
    const [subjectCount] = await connection.query('SELECT COUNT(*) as count FROM subjects');

    console.log('📊 Summary:');
    console.log(`  Users: ${userCount[0].count}`);
    console.log(`  Schools: ${schoolCount[0].count}`);
    console.log(`  Students: ${studentCount[0].count}`);
    console.log(`  Subjects: ${subjectCount[0].count}`);

    console.log('\n🔑 Test Credentials (password: password123):');
    console.log('  Admin: admin@schoolportal.com');
    console.log('  School Head: schoolhead@schoolportal.com');
    console.log('  Teacher: teacher@schoolportal.com');
    console.log('  Class Head: classhead@schoolportal.com');
    console.log('  Student: student@schoolportal.com');
    console.log('  Parent: parent@schoolportal.com');
    console.log('  Store House: storehouse@schoolportal.com');

    await connection.end();
    console.log('\n🎉 Seeding complete!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seeding failed!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

seedDatabase();
