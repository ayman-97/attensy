// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import AddCircle from '@mui/icons-material/AddCircle';
import PersonAdd from '@mui/icons-material/PersonAdd';
import MenuIcon from '@mui/icons-material/Menu';
import {
  IconButton,
  Button,
  TextField,
  Container,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Alert,
  Chip,
  Stack,
  Box,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Search,
  Save,
  Edit,
  Print,
  Upload,
  Delete,
  ArrowUpward,
  ArrowDownward,
  AccountCircle,
  Lock,
  ExitToApp
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { arSA } from 'date-fns/locale';
import { getDateKey } from './utils/getDateKey';
import AuthForm from './components/AuthForm';
import StudentTable from './components/StudentTable';
import CourseManager from './components/CourseManager';
import StudentForm from './components/StudentForm';
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useAuth } from './context/AuthContext';

export const COLLEGES = [
  'كلية الصيدلة',
  'كلية طب الاسنان',
  'كلية التقنيات الصحية والطبية',
  'كلية التمريض',
  'كلية الهندسة',
  'كلية التقنيات الهندسية',
  'كلية العلوم',
  'كلية التربية البدنية وعلوم الرياضة',
  'كلية القانون',
  'كلية العلوم الادارية والمالية',
  'كلية التربية'
];

// تعريف الأقسام لكل كلية
export const DEPARTMENTS_BY_COLLEGE = {
  'كلية الصيدلة': ['قسم الصيدلة'],
  'كلية طب الاسنان': ['قسم طب الاسنان'],
  'كلية التقنيات الصحية والطبية': ['قسم تقنيات المختبرات الطبية'],
  'كلية التمريض': ['قسم التمريض'],
  'كلية الهندسة': ['قسم الهندسة المدنية'],
  'كلية التقنيات الهندسية': ['قسم هندسة تقنيات الاجهزة الطبية', 'قسم هندسة تقنيات الحاسوب'],
  'كلية العلوم': ['قسم علوم الحاسوب'],
  'كلية التربية البدنية وعلوم الرياضة': ['قسم التربية البدنية وعلوم الرياضة'],
  'كلية القانون': ['قسم القانون'],
  'كلية العلوم الادارية والمالية': ['قسم العلوم المالية والمصرفية', 'قسم ادارة الاعمال'],
  'كلية التربية': ['قسم اللغة العربية', 'قسم اللغة الانكليزية']
};

export const GRADES = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة'];

const App = () => {
  const { currentUser, logout } = useAuth();
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDeleteCourseDialog, setOpenDeleteCourseDialog] = useState(false);
  const [selectedStudyType, setSelectedStudyType] = useState('الكل');
  
  // حالات إضافة وتعديل البيانات
  const [newStudent, setNewStudent] = useState({
    name: '',
    studyType: 'صباحي',
    college: '',
    department: '',
    grade: '',
    subject: ''
  });  
  const [newCourse, setNewCourse] = useState({ college: '', department: '', grade: '', subject: '' });  
  const [editStudent, setEditStudent] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [totalLectures, setTotalLectures] = useState(0);
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem("darkMode")) || false;
  });
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  // تحميل البيانات عند تسجيل الدخول
  useEffect(() => {
    if (!currentUser) return;
    
    try {
      const loadUserData = (key) => {
        const data = localStorage.getItem(`${key}_${currentUser.id}`);
        return data ? JSON.parse(data) : (key === 'attendance' ? {} : []);
      };
      
      setCourses(loadUserData('courses'));
      setStudents(loadUserData('students'));
      setAttendance(loadUserData('attendance'));
    } catch (error) {
      console.error('Error loading user data:', error);
      setSnackbar({
        open: true,
        message: 'حدث خطأ أثناء تحميل البيانات',
        severity: 'error'
      });
    }
  }, [currentUser]);

  const sideMenuItems = [
    {
      text: 'إضافة طالب',
      icon: <PersonAdd />,
      onClick: () => setSelectedMenu('addStudent')
    },
    {
      text: 'إدارة المواد',
      icon: <AddCircle />,
      onClick: () => setSelectedMenu('courseManager')
    }
  ];

  // تحديث localStorage عند تغيير الوضع
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));
  };

  // إنشاء الثيم (Theme) بناءً على الوضع الحالي
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  // الحفظ التلقائي للبيانات
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (currentUser) {
        const saveUserData = (key, data) =>
          localStorage.setItem(`${key}_${currentUser.id}`, JSON.stringify(data));
        saveUserData('courses', courses);
        saveUserData('students', students);
        saveUserData('attendance', attendance);
        console.log('تم الحفظ التلقائي');
      }
    }, 5000); // حفظ كل 5 ثوانٍ

    return () => clearInterval(saveInterval);
  }, [courses, students, attendance, currentUser]);

  useEffect(() => {
    const dates = Object.keys(attendance);
    setTotalLectures(dates.length);
  }, [attendance]);

  // دالة لحساب حضور طالب معين
  const getStudentAttendance = (studentId) => {
    return Object.values(attendance).reduce((acc, day) => acc + (day[studentId] ? 1 : 0), 0);
  };

  // دالة حذف مادة مع حذف الطلاب المرتبطين بها
  const deleteCourse = (college, department, grade, subject) => {
    const updatedCourses = courses
      .map(course => {
        if (
          course.college === college && // إضافة شرط الكلية
          course.department === department &&
          course.grade === grade
        ) {
          return { ...course, subjects: course.subjects.filter(sub => sub !== subject) };
        }
        return course;
      })
      .filter(course => course.subjects.length > 0);
    setCourses(updatedCourses);
  
    const updatedStudents = students.filter(student =>
      !(student.college === college && // إضافة شرط الكلية
        student.department === department &&
        student.grade === grade &&
        student.subject === subject)
    );
    setStudents(updatedStudents);
  };

  // دالة الاستيراد (Import)
const handleImport = (e) => {
  const file = e.target.files[0];
  if (!file) {
    console.log("لم يتم اختيار ملف");
    return;
  }
  
  // التأكد من أن الفلاتر (القسم، المرحلة، المادة) محددة
  if (!selectedDepartment || !selectedGrade || !selectedSubject) {
    alert('الرجاء تحديد القسم والمرحلة والمادة أولاً');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target.result);
      console.log("بيانات الملف:", data);
      
      const workbook = XLSX.read(data, { type: 'array' });
      console.log("المصنف (Workbook):", workbook);
      
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      console.log("ورقة العمل (Worksheet):", worksheet);
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log("بيانات JSON:", jsonData);
      
      if (jsonData.length === 0) {
        alert("ملف الاستيراد فارغ أو لا يحتوي على بيانات");
        return;
      }
      
      const headers = jsonData[0];
      console.log("عناوين الأعمدة:", headers);
      
      const importedStudents = jsonData.slice(1).map(row => ({
        id: Date.now() + Math.random(),
        name: row[headers.indexOf('الاسم')],
        studyType: row[headers.indexOf('نوع الدراسة')] || 'صباحي',
        college: selectedCollege, // إضافة هذه السطر
        department: selectedDepartment,
        grade: selectedGrade,
        subject: selectedSubject,
      }));
      console.log("الطلاب المستوردون:", importedStudents);
      
      // إضافة الطلاب المستوردين إلى الحالة الحالية
      setStudents(prev => [...prev, ...importedStudents]);
      
      setSnackbar({
        open: true,
        message: `تم استيراد ${importedStudents.length} طالب بنجاح للفلتر الحالي`,
        severity: 'success'
      });
      
      // إعادة تعيين قيمة عنصر الإدخال للسماح باختيار الملف نفسه مرة أخرى
      e.target.value = "";
    } catch (error) {
      console.error("حدث خطأ أثناء الاستيراد:", error);
      alert("حدث خطأ أثناء استيراد البيانات");
    }
  };
  reader.readAsArrayBuffer(file);
};

// دالة التصدير (Export)
const exportFilteredExcel = () => {
  if (!selectedCollege || !selectedDepartment || !selectedGrade || !selectedSubject) {
    alert('الرجاء تحديد القسم والمرحلة والمادة أولاً');
    return;
  }

  // تصفية الطلاب بناءً على الفلاتر
  const filteredStudents = students.filter(student => 
    student.college === selectedCollege &&
    student.department === selectedDepartment &&
    student.grade === selectedGrade &&
    student.subject === selectedSubject
  );

  if (filteredStudents.length === 0) {
    alert('لا يوجد بيانات لتصديرها');
    return;
  }

  // جمع جميع التواريخ التي تم تسجيل الحضور فيها لأي من الطلاب المُفلترين
  const relevantDatesSet = new Set();
  filteredStudents.forEach(student => {
    Object.keys(attendance).forEach(dateKey => {
      // سنعتبر إذا لم يكن هناك سجل، فهذا يعني غياب
      // لذلك نجمع التواريخ من جميع الأيام المسجلة في attendance
      relevantDatesSet.add(dateKey);
    });
  });

  // تحويل المجموعة إلى مصفوفة وترتيبها زمنيًا
  const relevantDates = Array.from(relevantDatesSet);
  relevantDates.sort((a, b) => new Date(a) - new Date(b));

  // إعداد البيانات للتصدير:
  // لكل طالب، نُجهز صفاً يحتوي على بياناته الأساسية، 
  // ثم لكل تاريخ من relevantDates، إذا كان هناك سجل حضور للطالب:
  //   - إذا كان true، نضع "حاضر"
  //   - إذا كان false، نضع "غائب"
  // وإذا لم يكن هناك سجل، نضع "غائب" (القيمة الافتراضية)
  // ثم نضيف عمود "الحضور" الذي يعرض النتيجة كـ "عدد الحضور/عدد المحاضرات"
  const formattedData = filteredStudents.map(student => {
    const row = {
      'الاسم': student.name,
      'نوع الدراسة': student.studyType,
      'القسم': student.department,
      //'المرحلة': student.grade,
      //'المادة': student.subject,
    };

    let attendedCount = 0;
    relevantDates.forEach(dateKey => {
      const displayDate = new Date(dateKey).toLocaleDateString('ar-EG');
      // إذا كان هناك سجل، نستخدمه، وإلا نعتبره غائب
      if (attendance[dateKey] && attendance[dateKey][student.id] !== undefined) {
        if (attendance[dateKey][student.id]) {
          row[displayDate] = 'حاضر';
          attendedCount++;
        } else {
          row[displayDate] = 'غائب';
        }
      } else {
        row[displayDate] = 'غائب';
      }
    });

    // عمود واحد يلخص الحضور: "عدد الحضور/عدد المحاضرات"
    row['الحضور'] = `${attendedCount}/${relevantDates.length}`;
    return row;
  });

  // إعداد ورقة العمل باستخدام XLSX
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // إعداد عرض الأعمدة:
  // الأعمدة الأساسية (5 أعمدة)، ثم أعمدة التواريخ، ثم عمود "الحضور"
  const dateCols = relevantDates.map(() => ({ wch: 15 }));
  const colWidths = [
    { wch: 25 }, // الاسم
    { wch: 15 }, // نوع الدراسة
    { wch: 20 }, // القسم
    { wch: 15 }, // المرحلة
    { wch: 20 }, // المادة
    ...dateCols,
    { wch: 10 }  // عمود الحضور
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الحضور');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  const filename = `الحضور_${selectedDepartment}_${selectedGrade}_${selectedSubject}.xlsx`;
  saveAs(dataBlob, filename);
};

  // دالة حذف جميع الطلاب حسب المادة المحددة
  const deleteStudentsBySubject = () => {
    if (!selectedDepartment || !selectedGrade || !selectedSubject) {
      alert("الرجاء تحديد المادة أولاً");
      return;
    }

    const studentsToDelete = students.filter(s =>
      s.department === selectedDepartment &&
      s.grade === selectedGrade &&
      s.subject === selectedSubject &&
      (selectedStudyType === 'الكل' || s.studyType === selectedStudyType)
    );

    if (studentsToDelete.length === 0) {
      alert("لا يوجد طلاب للحذف في المادة المحددة");
      return;
    }

    const studentIds = studentsToDelete.map(s => s.id);
    setStudents(prev => prev.filter(s => !studentIds.includes(s.id)));
    
    // حذف سجلات الحضور للطلاب المحذوفين
    setAttendance(prev => {
      const newAttendance = { ...prev };
      Object.keys(newAttendance).forEach(date => {
        studentIds.forEach(id => {
          if (newAttendance[date][id] !== undefined) {
            delete newAttendance[date][id];
          }
        });
      });
      return newAttendance;
    });

    setDeleteAllOpen(false);
    alert("تم حذف الطلاب بنجاح");
  };

  // دالة حذف جميع الطلاب
  const handleDeleteAll = () => {
    setStudents([]);
    setAttendance({});
    setDeleteAllOpen(false);
    setSnackbar({ open: true, message: 'تم حذف جميع الطلاب بنجاح', severity: 'success' });
  };

  // تصفية قائمة المواد بناءً على القسم والمرحلة
  const filteredSubjects = useMemo(() => {
    const course = courses.find(c => 
      c.college === selectedCollege && 
      c.department === selectedDepartment && 
      c.grade === selectedGrade
    );
    return course ? course.subjects : [];
  }, [selectedCollege, selectedDepartment, selectedGrade, courses]);

  // بيانات الحضور للتاريخ المختار
  const currentAttendance = useMemo(() => {
    const dateKey = getDateKey(selectedDate);
    return attendance[dateKey] || {};
  }, [attendance, selectedDate]);

  // حساب الإحصائيات الخاصة بالمادة المحددة
  const stats = useMemo(() => {
    if (!selectedDepartment || !selectedGrade || !selectedSubject) {
      return { total: 0, present: 0, absent: 0, percentage: 0 };
    }

    const filteredStudents = students.filter(s =>
      s.department.toLowerCase() === selectedDepartment.toLowerCase() &&
      s.grade.toLowerCase() === selectedGrade.toLowerCase() &&
      s.subject.toLowerCase() === selectedSubject.toLowerCase() &&
      (selectedStudyType === 'الكل' || s.studyType === selectedStudyType)
    );
    
    const total = filteredStudents.length;
    
    const present = Object.entries(currentAttendance)
      .filter(([id]) => filteredStudents.some(s => s.id === id))
      .filter(([_, value]) => value)
      .length;

    return {
      total,
      present,
      absent: total - present,
      percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0
    };
  }, [students, currentAttendance, selectedDepartment, selectedGrade, selectedSubject, selectedStudyType]);

  // تصفية قائمة الطلاب بناءً على الفلاتر
  const filteredStudents = useMemo(() => {
    if (!selectedDepartment || !selectedGrade || !selectedSubject) return [];
    return students
      .filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        student.department.toLowerCase() === selectedDepartment.toLowerCase() &&
        student.grade.toLowerCase() === selectedGrade.toLowerCase() &&
        student.subject.toLowerCase() === selectedSubject.toLowerCase() &&
        (selectedStudyType === 'الكل' || student.studyType === selectedStudyType)
      )
      .sort((a, b) => {
        const modifier = sortOrder === 'asc' ? 1 : -1;
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name) * modifier;
          case 'department':
            return a.department.localeCompare(b.department) * modifier;
          case 'grade':
            return a.grade.localeCompare(b.grade) * modifier;
          case 'subject':
            return a.subject.localeCompare(b.subject) * modifier;
          case 'studyType':
            return a.studyType.localeCompare(b.studyType) * modifier;
          default:
            return 0;
        }
      });
  }, [students, searchTerm, selectedDepartment, selectedGrade, selectedSubject, sortBy, sortOrder, selectedStudyType]);

  // دالة تسجيل حضور طالب
  const handleAttendance = (id, status) => {
    const date = new Date(selectedDate);
    if (isNaN(date)) {
      alert('الرجاء اختيار تاريخ صحيح');
      return;
    }
    const dateKey = getDateKey(date);
    setAttendance(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [id]: status
      }
    }));
  };

  // دالة الطباعة التي تطبع محتوى العنصر المحدد (الجدول فقط)
const handlePrintTable = () => {
  const tableContainer = document.getElementById("tableContainer");
if (!tableContainer) {
  alert("لا يوجد جدول متاح للطباعة.");
  return;
}
const tableContent = tableContainer.innerHTML;
  const printWindow = window.open("", "", "width=800,height=600");
  printWindow.document.write(`
    <html>
      <head>
        <title>طباعة الجدول</title>
        <style>
          /* تنسيق الجدول */
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 8px;
            text-align: center;
          }
          /* يمكنك إضافة المزيد من التنسيقات حسب الحاجة */
        </style>
      </head>
      <body>
        ${tableContent}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

  // التحقق من صحة بيانات الطالب قبل الإضافة
  const validateStudent = (student) => {
    if (students.some(s => 
      s.name === student.name &&
      s.department === student.department &&
      s.grade === student.grade &&
      s.subject === student.subject
    )) {
      setSnackbar({ ...snackbar, message: 'هذا الطالب موجود مسبقًا!', severity: 'error' });
      return false;
    }
    return true;
  };

  // إضافة طالب جديد
  const addStudent = (e) => {
    e.preventDefault();
    const newStudentWithId = { id: Date.now() + Math.random(), ...newStudent };
    if (validateStudent(newStudentWithId)) {
      setStudents([...students, newStudentWithId]);
      setNewStudent({ name: '', studyType: 'صباحي', department: '', grade: '', subject: '', college: '' });
    }
  };

  // إضافة مادة جديدة
  const addNewCourse = (e) => {
    e.preventDefault();
    if (!newCourse.college || !newCourse.department || !newCourse.grade || !newCourse.subject) {
      setSnackbar({ open: true, message: 'الرجاء تعبئة جميع الحقول', severity: 'error' });
      return;
    }
    const existingCourse = courses.find(c =>
      c.college === newCourse.college &&
      c.department === newCourse.department &&
      c.grade === newCourse.grade
    );

    let updatedCourses;
    if (existingCourse) {
      if (!existingCourse.subjects.includes(newCourse.subject)) {
        updatedCourses = courses.map(c =>
          c.college === newCourse.college &&
          c.department === newCourse.department &&
          c.grade === newCourse.grade
            ? { ...c, subjects: [...c.subjects, newCourse.subject] }
            : c
        );
      } else {
        updatedCourses = [...courses];
      }
    } else {
      updatedCourses = [
        ...courses,
        {
          college: newCourse.college,
          department: newCourse.department,
          grade: newCourse.grade,
          subjects: [newCourse.subject]
        }
      ];
    }
    setCourses(updatedCourses);
    if (currentUser) {
      localStorage.setItem(`courses_${currentUser.id}`, JSON.stringify(updatedCourses));
    }
    setNewCourse({ college: '', department: '', grade: '', subject: '' });
  };

  // تحديث بيانات طالب
  const updateStudent = () => {
    if (!editStudent?.name) {
      alert('الرجاء إدخال اسم الطالب');
      return;
    }
    setStudents(students.map(s => 
      s.id === editStudent.id 
        ? { ...s, name: editStudent.name, studyType: editStudent.studyType }
        : s
    ));
    setOpenEdit(false);
    setSnackbar({
      open: true,
      message: 'تم تحديث بيانات الطالب بنجاح',
      severity: 'success'
    });
  };

  // حذف طالب
  const handleDelete = () => {
    setStudents(students.filter(s => s.id !== studentToDelete));
    setStudentToDelete(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arSA}>
        <Box sx={{ display: 'flex' }}>
          {/* القائمة الجانبية */}
          <Drawer
            anchor="right"
            open={openSideMenu}
            onClose={() => setOpenSideMenu(false)}
            PaperProps={{
              sx: {
                width: 350,
                maxWidth: '100%'
              }
            }}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* رأس القائمة */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {currentUser && (
                    <Chip 
                      label={`مرحباً ${currentUser.username}`} 
                      color="primary" 
                      avatar={<AccountCircle />} 
                    />
                  )}
                  <IconButton onClick={toggleDarkMode}>
                    {darkMode ? <Brightness7 /> : <Brightness4 />}
                  </IconButton>
                </Stack>
              </Box>

              {/* عناصر القائمة */}
              <List>
                {sideMenuItems.map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton 
                      onClick={item.onClick}
                      selected={selectedMenu === item.text.toLowerCase().replace(/ /g, '')}
                    >
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <Divider />

              {/* محتوى النماذج */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {selectedMenu === 'addStudent' && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      إضافة طالب جديد
                    </Typography>
                    <StudentForm
                      newStudent={newStudent}
                      setNewStudent={setNewStudent}
                      addStudent={(e) => {
                        e.preventDefault();
                        const student = { ...newStudent, id: Date.now().toString() };
                        setStudents(prev => [...prev, student]);
                        setNewStudent({
                          name: '',
                          studyType: 'صباحي',
                          college: '',
                          department: '',
                          grade: '',
                          subject: ''
                        });
                        setSnackbar({
                          open: true,
                          message: 'تم إضافة الطالب بنجاح',
                          severity: 'success'
                        });
                        setOpenSideMenu(false);
                      }}
                      COLLEGES={COLLEGES}
                      DEPARTMENTS_BY_COLLEGE={DEPARTMENTS_BY_COLLEGE}
                      GRADES={GRADES}
                      courses={courses}
                    />
                  </>
                )}

                {selectedMenu === 'courseManager' && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      إدارة المواد
                    </Typography>
                    <CourseManager
                      newCourse={newCourse}
                      setNewCourse={setNewCourse}
                      addNewCourse={(e) => {
                        e.preventDefault();
                        const existingCourseIndex = courses.findIndex(
                          c => c.college === newCourse.college &&
                          c.department === newCourse.department &&
                          c.grade === newCourse.grade
                        );

                        if (existingCourseIndex !== -1) {
                          const updatedCourses = [...courses];
                          if (!updatedCourses[existingCourseIndex].subjects.includes(newCourse.subject)) {
                            updatedCourses[existingCourseIndex].subjects.push(newCourse.subject);
                            setCourses(updatedCourses);
                          }
                        } else {
                          setCourses(prev => [...prev, { ...newCourse, subjects: [newCourse.subject] }]);
                        }
                        
                        setNewCourse({
                          college: '',
                          department: '',
                          grade: '',
                          subject: ''
                        });
                        setSnackbar({
                          open: true,
                          message: 'تم إضافة المادة بنجاح',
                          severity: 'success'
                        });
                        setOpenSideMenu(false);
                      }}
                      COLLEGES={COLLEGES}
                      DEPARTMENTS_BY_COLLEGE={DEPARTMENTS_BY_COLLEGE}
                      GRADES={GRADES}
                      courses={courses}
                    />
                  </>
                )}
              </Box>
            </Box>
          </Drawer>

          {/* المحتوى الرئيسي */}
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            {!currentUser ? (
              <AuthForm />
            ) : (
              <Container>
                {/* شريط الأزرار العلوي */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <IconButton onClick={() => setOpenSideMenu(true)}>
                    <MenuIcon />
                  </IconButton>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton onClick={toggleDarkMode}>
                      {darkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={logout}
                      startIcon={<ExitToApp />}
                    >
                      تسجيل الخروج
                    </Button>
                  </Stack>
                </Box>

                {/* عرض اسم المستخدم */}
                {currentUser && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip 
                      label={`مرحباً ${currentUser.username}`} 
                      color="primary" 
                      avatar={<AccountCircle />} 
                    />
                  </Box>
                )}
                
                {/* الفلاتر */}
                <Box sx={{ mb: 3,p:2,border: '1px solid #ddd', borderRadius: 2}}>
                  <Typography variant="h6" gutterBottom>عرض القائمة</Typography>
                  <Stack direction="row" spacing={2} alignItems="flex-end" flexWrap="wrap">
                    {/* فلتر الكلية */}
                    <TextField
                      select
                      label="الكلية"
                      value={selectedCollege}
                      onChange={(e) => {
                        setSelectedCollege(e.target.value);
                        setSelectedDepartment('');
                        setSelectedGrade('');
                        setSelectedSubject('');
                        setSelectedStudyType('الكل');
                      }}
                      sx={{ minWidth: 180 }}
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
                      value={selectedDepartment}
                      onChange={(e) => {
                        setSelectedDepartment(e.target.value);
                        setSelectedGrade('');
                        setSelectedSubject('');
                        setSelectedStudyType('الكل');
                      }}
                      disabled={!selectedCollege}
                      sx={{ minWidth: 180 }}
                    >
                      <MenuItem value="">اختر القسم</MenuItem>
                      {selectedCollege && DEPARTMENTS_BY_COLLEGE[selectedCollege]?.map(department => (
                        <MenuItem key={department} value={department}>{department}</MenuItem>
                      ))}
                    </TextField>

                    {/* فلتر المرحلة */}
                    <TextField
                      select
                      label="المرحلة"
                      value={selectedGrade}
                      onChange={(e) => {
                        setSelectedGrade(e.target.value);
                        setSelectedSubject('');
                        setSelectedStudyType('الكل');
                      }}
                      disabled={!selectedDepartment}
                      sx={{ minWidth: 180 }}
                    >
                      <MenuItem value="">اختر المرحلة</MenuItem>
                      {GRADES.map(grade => (
                        <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                      ))}
                    </TextField>

                    {/* فلتر المادة */}
                    <TextField
                      select
                      label="المادة"
                      value={selectedSubject}
                      onChange={(e) => {
                        setSelectedSubject(e.target.value);
                        setSelectedStudyType('الكل');
                      }}
                      disabled={!selectedGrade}
                      sx={{ minWidth: 180 }}
                    >
                      <MenuItem value="">اختر المادة</MenuItem>
                      {courses
                        .filter(course => 
                          course.college === selectedCollege && 
                          course.department === selectedDepartment && 
                          course.grade === selectedGrade
                        )
                        .flatMap(course => course.subjects)
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(subject => (
                          <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                        ))}
                    </TextField>
                  </Stack>
                </Box>

                {/* تحديد التاريخ */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <DatePicker
                    label="تاريخ التسجيل"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    inputFormat="dd/MM/yyyy"
                    textField={{
                      variant: 'outlined',
                      size: 'small',
                      fullWidth: true,
                    }}
                  />
                  <Chip label={`تاريخ اليوم: ${new Date().toLocaleDateString('ar-EG')}`} color="info" sx={{ fontWeight: 'bold' }} />
                </Box>

                {/* عرض الإحصائيات */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  {selectedCollege && selectedDepartment && selectedGrade && selectedSubject ? (
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Chip label={`إجمالي الطلاب: ${stats.total}`} color="info" />
                      <Chip label={`حاضرين: ${stats.present}`} color="success" />
                      <Chip label={`غائبين: ${stats.absent}`} color="error" />
                      <Chip label={`نسبة الحضور: ${stats.percentage}%`} />
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      الإحصائيات ستظهر بعد تحديد جميع خيارات الفلترة
                    </Typography>
                  )}
                </Box>

                {/* شريط الأزرار للعمليات الإضافية */}
                <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  {selectedDepartment && selectedGrade && selectedSubject && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                          const dateKey = getDateKey(selectedDate);
                          const filteredStudentIds = students
                            .filter(s =>
                              s.department === selectedDepartment &&
                              s.grade === selectedGrade &&
                              s.subject === selectedSubject &&
                              (selectedStudyType === 'الكل' || s.studyType === selectedStudyType)
                            )
                            .map(s => s.id);
                          
                          setAttendance(prev => ({
                            ...prev,
                            [dateKey]: {
                              ...prev[dateKey],
                              ...Object.fromEntries(filteredStudentIds.map(id => [id, true]))
                            }
                          }));
                        }}
                      >
                        تحديد الكل حاضرين
                      </Button>

                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                          const dateKey = getDateKey(selectedDate);
                          const filteredStudentIds = students
                            .filter(s =>
                              s.department === selectedDepartment &&
                              s.grade === selectedGrade &&
                              s.subject === selectedSubject &&
                              (selectedStudyType === 'الكل' || s.studyType === selectedStudyType)
                            )
                            .map(s => s.id);
                          
                          setAttendance(prev => ({
                            ...prev,
                            [dateKey]: {
                              ...prev[dateKey],
                              ...Object.fromEntries(filteredStudentIds.map(id => [id, false]))
                            }
                          }));
                        }}
                      >
                        إلغاء تحديد الكل
                      </Button>

                      <Button
                        variant="contained"
                        startIcon={<Print />}
                        onClick={handlePrintTable}
                      >
                        طباعة
                      </Button>

                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Save />}
                        onClick={exportFilteredExcel}
                      >
                        تصدير حسب الفلتر
                      </Button>

                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setOpenDeleteCourseDialog(true)}
                      >
                        حذف المادة المحددة
                      </Button>

                      <Button
                        variant="contained"
                        startIcon={<Upload />}
                        component="label"
                      >
                        استيراد من Excel
                        <input type="file" hidden onChange={handleImport} />
                      </Button>

                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setDeleteAllOpen(true)}
                        startIcon={<Delete />}
                      >
                        حذف طلاب المادة
                      </Button>
                    </>
                  )}
                </Stack>

                {/* فلتر نوع الدراسة وحقل البحث */}
                {selectedDepartment && selectedGrade && selectedSubject && (
                  <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        تصفية حسب نوع الدراسة:
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label="الكل"
                          onClick={() => setSelectedStudyType('الكل')}
                          color={selectedStudyType === 'الكل' ? 'primary' : 'default'}
                          variant={selectedStudyType === 'الكل' ? 'filled' : 'outlined'}
                        />
                        <Chip
                          label="صباحي"
                          onClick={() => setSelectedStudyType('صباحي')}
                          color={selectedStudyType === 'صباحي' ? 'primary' : 'default'}
                          variant={selectedStudyType === 'صباحي' ? 'filled' : 'outlined'}
                        />
                        <Chip
                          label="مسائي"
                          onClick={() => setSelectedStudyType('مسائي')}
                          color={selectedStudyType === 'مسائي' ? 'primary' : 'default'}
                          variant={selectedStudyType === 'مسائي' ? 'filled' : 'outlined'}
                        />
                      </Stack>
                    </Stack>
                    
                    <TextField
                      label="بحث عن طالب..."
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <Search />,
                        sx: { borderRadius: 2 }
                      }}
                      sx={{ width: 300 }}
                    />
                  </Box>
                )}
                {/* جدول عرض الطلاب */}
                <div id="tableContainer">
                  <StudentTable
                    students={filteredStudents}
                    totalLectures={totalLectures}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    setSortBy={setSortBy}
                    setSortOrder={setSortOrder}
                    getStudentAttendance={getStudentAttendance}
                    handleAttendance={handleAttendance}
                    setEditStudent={setEditStudent}
                    setOpenEdit={setOpenEdit}
                    setStudentToDelete={setStudentToDelete}
                    currentAttendance={currentAttendance}
                  />
                </div>
                {/* حوار تعديل الطالب */}
                <Dialog 
                  open={openEdit} 
                  onClose={() => setOpenEdit(false)}
                  aria-labelledby="edit-student-dialog-title"
                  keepMounted
                >
                  <DialogTitle id="edit-student-dialog-title">تعديل بيانات الطالب</DialogTitle>
                  <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2, minWidth: 300 }}>
                      <TextField
                        label="اسم الطالب"
                        value={editStudent?.name || ''}
                        onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
                        required
                        fullWidth
                        autoFocus
                        inputProps={{
                          'aria-label': 'اسم الطالب'
                        }}
                      />
                      <TextField
                        select
                        label="نوع الدراسة"
                        value={editStudent?.studyType || 'صباحي'}
                        onChange={(e) => setEditStudent({ ...editStudent, studyType: e.target.value })}
                        required
                        fullWidth
                        inputProps={{
                          'aria-label': 'نوع الدراسة'
                        }}
                      >
                        <MenuItem value="صباحي">صباحي</MenuItem>
                        <MenuItem value="مسائي">مسائي</MenuItem>
                      </TextField>
                    </Stack>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setOpenEdit(false)} aria-label="إلغاء">إلغاء</Button>
                    <Button
                      onClick={updateStudent}
                      color="primary"
                      variant="contained"
                      aria-label="حفظ التغييرات"
                    >
                      حفظ التغييرات
                    </Button>
                  </DialogActions>
                </Dialog>
                {/* حوار حذف الطالب */}
                <Dialog open={!!studentToDelete} onClose={() => setStudentToDelete(null)}>
                  <DialogTitle>تأكيد الحذف</DialogTitle>
                  <DialogContent>
                    <Typography>هل أنت متأكد من رغبتك في حذف هذا الطالب؟</Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setStudentToDelete(null)}>إلغاء</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                      حذف
                    </Button>
                  </DialogActions>
                </Dialog>
                {/* حوار حذف جميع الطلاب */}
                <Dialog open={deleteAllOpen} onClose={() => setDeleteAllOpen(false)}>
                  <DialogTitle>تأكيد الحذف</DialogTitle>
                  <DialogContent>
                    <Typography>
                      هل أنت متأكد من حذف {selectedStudyType === 'الكل' ? 'جميع' : `طلاب الدراسة ${selectedStudyType}`} في مادة {selectedSubject}؟
                      <br />
                      هذا الإجراء لا يمكن التراجع عنه!
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setDeleteAllOpen(false)}>إلغاء</Button>
                    <Button onClick={deleteStudentsBySubject} color="error" variant="contained">
                      تأكيد الحذف
                    </Button>
                  </DialogActions>
                </Dialog>
                <Dialog
                  open={openDeleteCourseDialog}
                  onClose={() => setOpenDeleteCourseDialog(false)}
                >
                  <DialogTitle>تحذير</DialogTitle>
                  <DialogContent>
                    <Typography>
                      هل أنت متأكد من رغبتك في حذف المادة المحددة مع حذف قائمة الطلاب الخاصة بها؟<br />
                      هذا الإجراء لا يمكن التراجع عنه!
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setOpenDeleteCourseDialog(false)}>إلغاء</Button>
                    <Button
                      onClick={() => {
                        deleteCourse(selectedCollege, selectedDepartment, selectedGrade, selectedSubject);
                        setSelectedSubject(""); // إعادة تعيين المادة المحددة
                        setOpenDeleteCourseDialog(false);
                        alert("تم حذف المادة وقائمة الطلاب الخاصة بها.");
                      }}
                      color="error"
                      variant="contained"
                    >
                      تأكيد الحذف
                    </Button>
                  </DialogActions>
                </Dialog>
                <Snackbar
                  open={snackbar.open}
                  autoHideDuration={3000}
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                  <Alert severity={snackbar.severity || 'error'}>{snackbar.message}</Alert>
                </Snackbar>
              </Container>
            )}
          </Box>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
