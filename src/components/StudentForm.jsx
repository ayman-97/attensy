import React, { useMemo } from 'react';
import { TextField, MenuItem, Button, Stack, Typography, Box } from '@mui/material';
import { AddCircle } from '@mui/icons-material';
import { GRADES } from '../App';

const StudentForm = ({
  newStudent,
  setNewStudent,
  addStudent,
  COLLEGES,
  DEPARTMENTS_BY_COLLEGE,
  GRADES, 
  courses = []
}) => {

  const filteredDepartments = useMemo(() => {
    if (!newStudent.college) return [];
    return DEPARTMENTS_BY_COLLEGE[newStudent.college] || [];
  }, [newStudent.college, DEPARTMENTS_BY_COLLEGE]);

  const filteredGrades = useMemo(() => {
    return GRADES;
  }, []);

  const filteredSubjects = useMemo(() => {
    if (!newStudent.college || !newStudent.department || !newStudent.grade) return [];
    return courses
      .filter(course => 
        course.college === newStudent.college && 
        course.department === newStudent.department && 
        course.grade === newStudent.grade
      )
      .flatMap(course => course.subjects)
      .filter((value, index, self) => self.indexOf(value) === index);
  }, [courses, newStudent.college, newStudent.department, newStudent.grade]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addStudent(e);
  };

  return (
    <Box sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {/* حقل الاسم */}
          <TextField
            label="اسم الطالب"
            value={newStudent.name}
            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            required
            fullWidth
            size="small"
          />

          {/* نوع الدراسة */}
          <TextField
            select
            label="نوع الدراسة"
            value={newStudent.studyType}
            onChange={(e) => setNewStudent({ ...newStudent, studyType: e.target.value })}
            required
            fullWidth
            size="small"
          >
            <MenuItem value="صباحي">صباحي</MenuItem>
            <MenuItem value="مسائي">مسائي</MenuItem>
          </TextField>

          {/* فلتر الكلية */}
          <TextField
            select
            label="الكلية"
            value={newStudent.college}
            onChange={(e) => {
              setNewStudent({
                ...newStudent,
                college: e.target.value,
                department: '',
                grade: '',
                subject: ''
              });
            }}
            required
            fullWidth
            size="small"
          >
            <MenuItem value="">اختر الكلية</MenuItem>
            {COLLEGES.map(college => (
              <MenuItem key={college} value={college}>{college}</MenuItem>
            ))}
          </TextField>

          {/* فلتر القسم */}
          <TextField
            select
            label="القسم"
            value={newStudent.department}
            onChange={(e) => {
              setNewStudent({
                ...newStudent,
                department: e.target.value,
                grade: '',
                subject: ''
              });
            }}
            disabled={!newStudent.college}
            required
            fullWidth
            size="small"
          >
            <MenuItem value="">اختر القسم</MenuItem>
            {filteredDepartments.map(department => (
              <MenuItem key={department} value={department}>{department}</MenuItem>
            ))}
          </TextField>

          {/* فلتر المرحلة */}
          <TextField
            select
            label="المرحلة"
            value={newStudent.grade}
            onChange={(e) => {
              setNewStudent({
                ...newStudent,
                grade: e.target.value,
                subject: ''
              });
            }}
            disabled={!newStudent.department}
            required
            fullWidth
            size="small"
          >
            <MenuItem value="">اختر المرحلة</MenuItem>
            {filteredGrades.map(grade => (
              <MenuItem key={grade} value={grade}>{grade}</MenuItem>
            ))}
          </TextField>

          {/* فلتر المادة */}
          <TextField
            select
            label="المادة"
            value={newStudent.subject}
            onChange={(e) => setNewStudent({ ...newStudent, subject: e.target.value })}
            disabled={!newStudent.grade}
            required
            fullWidth
            size="small"
          >
            <MenuItem value="">اختر المادة</MenuItem>
            {filteredSubjects.map(subject => (
              <MenuItem key={subject} value={subject}>{subject}</MenuItem>
            ))}
          </TextField>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<AddCircle />}
          >
            إضافة الطالب
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default StudentForm;