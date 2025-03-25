// src/components/StudentTable.jsx
import React from 'react';
// في أعلى ملف StudentForm.jsx


import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Stack
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';

const StudentTable = ({
  students = [],
  totalLectures,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  getStudentAttendance,
  handleAttendance,
  setEditStudent,
  setOpenEdit,
  setStudentToDelete,
  currentAttendance
}) => {
  const SortIcon = ({ field }) => (
    sortBy === field &&
    (sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)
  );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell onClick={() => { setSortBy('name'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }} sx={{ cursor: 'pointer' }}>
              <Stack direction="row" alignItems="center" gap={1}>
                الاسم <SortIcon field="name" />
              </Stack>
            </TableCell>
            <TableCell onClick={() => { setSortBy('department'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }} sx={{ cursor: 'pointer' }}>
              <Stack direction="row" alignItems="center" gap={1}>
                القسم <SortIcon field="department" />
              </Stack>
            </TableCell>
            <TableCell onClick={() => { setSortBy('grade'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }} sx={{ cursor: 'pointer' }}>
              <Stack direction="row" alignItems="center" gap={1}>
                المرحلة <SortIcon field="grade" />
              </Stack>
            </TableCell>
            <TableCell onClick={() => { setSortBy('subject'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }} sx={{ cursor: 'pointer' }}>
              <Stack direction="row" alignItems="center" gap={1}>
                المادة <SortIcon field="subject" />
              </Stack>
            </TableCell>
            <TableCell onClick={() => { setSortBy('studyType'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }} sx={{ cursor: 'pointer' }}>
              <Stack direction="row" alignItems="center" gap={1}>
                نوع الدراسة <SortIcon field="studyType" />
              </Stack>
            </TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell>الإجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map(student => {
            const attended = getStudentAttendance(student.id);
            return (
              <TableRow
                key={student.id}
                sx={{
                  backgroundColor: currentAttendance[student.id]
                    ? 'rgba(76, 175, 80, 0.1)'
                    : 'rgba(244, 67, 54, 0.1)',
                  '&:hover': {
                    backgroundColor: currentAttendance[student.id]
                      ? 'rgba(76, 175, 80, 0.2)'
                      : 'rgba(244, 67, 54, 0.2)',
                  }
                }}
              >
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.department}</TableCell>
                <TableCell>{student.grade}</TableCell>
                <TableCell>{student.subject}</TableCell>
                <TableCell>{student.studyType}</TableCell>
                <TableCell>
                  <Chip label={currentAttendance[student.id] ? 'حاضر' : 'غائب'} color={currentAttendance[student.id] ? 'success' : 'error'} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleAttendance(student.id, true)} color="success">
                    <CheckCircle />
                  </IconButton>
                  <IconButton onClick={() => handleAttendance(student.id, false)} color="error">
                    <Cancel />
                  </IconButton>
                  <IconButton onClick={() => { setEditStudent(student); setOpenEdit(true); }} color="info">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => setStudentToDelete(student.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StudentTable;
