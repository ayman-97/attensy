import React, { useMemo } from 'react';
import { TextField, MenuItem, Button, Stack, Box } from '@mui/material';
import { AddCircle } from '@mui/icons-material';
import { GRADES } from '../App';

const CourseManager = ({
  newCourse = { college: '', department: '', grade: '', subject: '' },
  setNewCourse,
  addNewCourse,
  DEPARTMENTS_BY_COLLEGE,
  COLLEGES,
  courses = []
}) => {

  const filteredDepartments = useMemo(() => {
    if (!newCourse.college) return [];
    return DEPARTMENTS_BY_COLLEGE[newCourse.college] || [];
  }, [newCourse.college, DEPARTMENTS_BY_COLLEGE]);

  const filteredGrades = useMemo(() => {
    return GRADES;
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    addNewCourse(e);
  };

  return (
    <Box sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {/* فلتر الكلية */}
          <TextField
            select
            label="الكلية"
            value={newCourse.college}
            onChange={(e) => {
              setNewCourse({
                ...newCourse,
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
            value={newCourse.department}
            onChange={(e) => {
              setNewCourse({
                ...newCourse,
                department: e.target.value,
                grade: '',
                subject: ''
              });
            }}
            disabled={!newCourse.college}
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
            value={newCourse.grade}
            onChange={(e) => {
              setNewCourse({
                ...newCourse,
                grade: e.target.value,
                subject: ''
              });
            }}
            disabled={!newCourse.department}
            required
            fullWidth
            size="small"
          >
            <MenuItem value="">اختر المرحلة</MenuItem>
            {filteredGrades.map(grade => (
              <MenuItem key={grade} value={grade}>{grade}</MenuItem>
            ))}
          </TextField>

          {/* اسم المادة */}
          <TextField
            label="اسم المادة"
            value={newCourse.subject}
            onChange={(e) => setNewCourse({ ...newCourse, subject: e.target.value })}
            disabled={!newCourse.grade}
            required
            fullWidth
            size="small"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<AddCircle />}
          >
            إضافة المادة
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default CourseManager;