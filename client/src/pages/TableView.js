import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Container,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  alpha,
  Backdrop
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import CalculateIcon from '@mui/icons-material/Calculate';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';

// Стилизованные компоненты
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
}));

const TableTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  fontWeight: 700,
  color: theme.palette.primary.main,
  position: 'relative',
  display: 'inline-block',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '40%',
    height: '4px',
    bottom: '-8px',
    left: '0',
    borderRadius: '2px',
    backgroundColor: theme.palette.secondary.main,
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.primary.light, 0.03),
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.07),
    transition: 'background-color 0.2s ease',
  },
  transition: 'background-color 0.2s ease',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  whiteSpace: 'nowrap',
}));

const TableHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  padding: theme.spacing(1.5, 2),
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0, 0.5),
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const AddItemButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: '8px',
  padding: theme.spacing(1.2, 3),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-3px)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 500,
  backgroundColor: status === 'public' 
    ? alpha(theme.palette.success.main, 0.1)
    : alpha(theme.palette.warning.main, 0.1),
  color: status === 'public' 
    ? theme.palette.success.dark
    : theme.palette.warning.dark,
  '& .MuiChip-icon': {
    color: 'inherit',
  },
}));

const InfoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)',
  },
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxWidth: '90%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '12px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  padding: theme.spacing(4),
  outline: 'none',
  maxHeight: '90vh',
  overflow: 'auto',
}));

const ModalTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ModalCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  color: theme.palette.grey[500],
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 1),
  borderRadius: '8px',
  padding: theme.spacing(1.2),
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  },
}));

// Упрощенный компонент модального окна
const SimpleModal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  
  console.log('Рендерим SimpleModal, open:', open);
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px'
          }}
          onClick={onClose}
        >
          ✕
        </button>
        
        <h2 style={{ marginBottom: '20px' }}>{title}</h2>
        
        {children}
      </div>
    </div>
  );
};

const TableView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshAuth } = useContext(AuthContext);
  const theme = useTheme();

  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  
  // Состояние модального окна и формы
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  
  // Отслеживание состояния модального окна
  useEffect(() => {
    console.log('Текущее состояние modalOpen:', modalOpen);
  }, [modalOpen]);

  // Отслеживание состояния данных формы
  useEffect(() => {
    if (modalOpen) {
      console.log('Данные формы:', formData);
      console.log('Ошибки формы:', formErrors);
    }
  }, [formData, formErrors, modalOpen]);

  useEffect(() => {
    // Перед загрузкой таблицы обновляем данные аутентификации
    const initializeTable = async () => {
      try {
        setLoading(true);
        
        // Обновляем данные пользователя для гарантии актуальности токена
        if (localStorage.getItem('token')) {
          await refreshAuth();
        }
        
        // После обновления данных аутентификации загружаем таблицу
        await fetchTable();
      } catch (err) {
        console.error("Ошибка инициализации таблицы:", err);
        setError('Не удалось загрузить таблицу');
      } finally {
        setLoading(false);
      }
    };
    
    initializeTable();
  }, [id, refreshAuth]);

  const fetchTable = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/tables/${id}`);
      
      // Логирование ответа для отладки
      console.log('Ответ при загрузке таблицы:', res.data);
      
      // Детальное логирование ответа
      console.log('Полный ответ от сервера:', JSON.stringify(res.data, null, 2));
      
      // Правильно обрабатываем вложенную структуру данных
      let tableData;
      if (res.data && res.data.success === true && res.data.data) {
        console.log('Данные таблицы находятся в res.data.data');
        tableData = res.data.data;
      } else {
        console.log('Данные таблицы находятся непосредственно в res.data');
        tableData = res.data;
      }
      
      console.log('Извлеченные данные таблицы:', tableData);
      
      // Проверка структуры данных перед их использованием
      if (tableData) {
        setTableData(tableData);
        
        // Детальное логирование пользователя
        console.log('Текущий пользователь:', user);
        console.log('Детальная структура пользователя:', JSON.stringify(user, null, 2));
        
        // Проверяем, является ли текущий пользователь владельцем таблицы
        // Учитываем, что поле может называться id или _id
        if (user && (user._id || user.id)) {
          // Получаем ID владельца таблицы из данных, учитывая разные возможные структуры
          let tableOwnerId = '';
          
          if (tableData.user) {
            if (typeof tableData.user === 'object') {
              tableOwnerId = String(tableData.user._id || tableData.user.id || '');
              console.log('ID владельца таблицы (из объекта):', tableOwnerId);
            } else {
              tableOwnerId = String(tableData.user || '');
              console.log('ID владельца таблицы (строка):', tableOwnerId);
            }
          }
          
          // Получаем ID текущего пользователя
          const userId = String(user._id || user.id || '');
          
          console.log('ID пользователя:', userId);
          console.log('ID владельца таблицы:', tableOwnerId);
          
          // Проверяем, совпадают ли ID
          const isOwner = tableOwnerId && userId && tableOwnerId === userId;
          console.log('Является ли пользователь владельцем:', isOwner);
          
          setIsOwner(isOwner);
        } else {
          console.log('Нет данных о пользователе или пользователь не аутентифицирован');
          setIsOwner(false);
        }
        
        // Если таблица публичная, отображаем её независимо от владельца
        console.log('Таблица публичная:', tableData.isPublic);
      } else {
        console.error('Получены пустые данные таблицы');
        setError('Данные таблицы отсутствуют');
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching table:', err);
      console.error('Детали ошибки:', err.response ? err.response.data : err.message);
      setError('Не удалось загрузить таблицу');
      toast.error('Ошибка при загрузке таблицы');
    }
  };

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      toast.warning('Необходимо войти в систему для добавления объектов');
      navigate('/login');
      return;
    }
    
    // Создаем пустой объект с полями для каждого критерия
    const initialFormData = {};
    
    if (tableData && tableData.columns) {
      tableData.columns.forEach(column => {
        initialFormData[column._id] = '';
      });
    }
    
    setFormData({
      name: '',
      cost: '',
      ...initialFormData
    });
    setFormErrors({});
    console.log('Открываем модальное окно, setModalOpen(true)');
    setModalOpen(true);
    console.log('Состояние modalOpen после установки:', true);
  };

  const handleCloseModal = () => {
    console.log('Закрываем модальное окно, setModalOpen(false)');
    setModalOpen(false);
    console.log('Состояние modalOpen после установки:', false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Очищаем ошибки при изменении поля
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Название объекта обязательно';
    }
    
    if (!formData.cost && formData.cost !== 0) {
      errors.cost = 'Стоимость обязательна';
    } else if (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) < 0) {
      errors.cost = 'Стоимость должна быть положительным числом';
    }
    
    // Проверяем, что все поля критериев заполнены и содержат числовые значения
    if (tableData && tableData.columns) {
      tableData.columns.forEach(column => {
        const value = formData[column._id];
        if (!value && value !== 0 && value !== '0') {
          errors[column._id] = 'Поле обязательно';
        } else if (isNaN(parseFloat(value)) || parseFloat(value) < 0 || parseFloat(value) > 10) {
          errors[column._id] = 'Значение должно быть числом от 0 до 10';
        }
      });
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Проверяем аутентификацию
      if (!isAuthenticated) {
        toast.error('Необходимо войти в систему для добавления объектов');
        navigate('/login');
        return;
      }
      
      // Формируем данные для отправки
      const objectData = {
        name: formData.name,
        cost: parseFloat(formData.cost),
        ratings: {} // Используем ratings вместо values
      };
      
      // Добавляем значения критериев
      if (tableData && tableData.columns) {
        tableData.columns.forEach(column => {
          objectData.ratings[column.name] = parseFloat(formData[column._id]);
        });
      }
      
      console.log('Отправляем данные объекта:', objectData);
      
      // Отправляем запрос на сервер
      const response = await axios.post(`${BASE_URL}/api/tables/${id}/items`, objectData);
      
      console.log('Ответ при добавлении объекта:', response.data);
      
      // Обновляем данные таблицы
      await fetchTable();
      
      // Закрываем модальное окно
      handleCloseModal();
      
      // Показываем уведомление об успешном добавлении
      toast.success('Объект успешно добавлен!');
    } catch (err) {
      console.error('Error adding object:', err);
      console.error('Детали ошибки:', err.response ? err.response.data : err.message);
      
      if (err.response && err.response.status === 401) {
        toast.error('Ошибка авторизации. Пожалуйста, войдите заново');
        navigate('/login');
      } else {
        toast.error('Ошибка при добавлении объекта');
      }
    }
  };

  const handleEditObject = (objectId) => {
    navigate(`/edit-object/${id}/${objectId}`);
  };

  const handleDeleteObject = async (objectId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот объект?')) {
      try {
        await axios.delete(`${BASE_URL}/api/tables/${id}/items/${objectId}`);
        fetchTable();
        toast.success('Объект успешно удален!');
      } catch (err) {
        console.error('Error deleting object:', err);
        toast.error('Ошибка при удалении объекта');
      }
    }
  };

  // Заменяем функцию calculateUtility на использование готового значения utility
  const getUtility = (item) => {
    // Если у объекта есть готовое значение utility, используем его
    if (item && item.utility !== undefined) {
      return parseFloat(item.utility).toFixed(2);
    }
    
    // Иначе возвращаем 0
    return '0.00';
  };

  // Анимационные варианты
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 200px)'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 200px)',
        flexDirection: 'column'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Вернуться к списку таблиц
        </Button>
      </Box>
    );
  }

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 2 }}>
                <TableTitle variant="h4" component="h1">
                  {tableData?.name}
                </TableTitle>
                <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                  {tableData?.description}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <StatusChip 
                  label={tableData?.isPublic ? 'Публичная' : 'Приватная'} 
                  status={tableData?.isPublic ? 'public' : 'private'}
                  icon={tableData?.isPublic ? <PublicIcon /> : <LockIcon />}
                  size="small"
                />
                {tableData?.user && (
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                    Автор: {tableData.user.name}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, flexWrap: 'wrap' }}>
                {isOwner && (
                  <>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/edit-table/${id}`)}
                      sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                      Редактировать
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      startIcon={<ShareIcon />}
                      sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                      Поделиться
                    </Button>
                  </>
                )}
                <Button 
                  variant="outlined" 
                  color="info"
                  startIcon={<CalculateIcon />}
                  onClick={() => navigate(`/results/${id}`)}
                  sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                  Результаты
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </motion.div>

      <Divider sx={{ my: 3 }} />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Критерии сравнения
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {tableData?.columns?.length || 0}
                  </Typography>
                </CardContent>
              </InfoCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Объекты
                  </Typography>
                  <Typography variant="h4" color="secondary" sx={{ fontWeight: 'bold' }}>
                    {tableData?.items?.length || 0}
                  </Typography>
                </CardContent>
              </InfoCard>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Лучший результат
                  </Typography>
                  {tableData?.items && tableData.items.length > 0 ? (
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {Math.max(...tableData.items.map(item => item.utility || 0)).toFixed(2)}
                    </Typography>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Нет данных
                    </Typography>
                  )}
                </CardContent>
              </InfoCard>
            </Grid>
          </Grid>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Объекты сравнения
            </Typography>
            
            {isOwner && (
              <AddItemButton
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenModal}
              >
                Добавить объект
              </AddItemButton>
            )}
          </Box>
        </motion.div>

        <motion.div variants={itemVariants}>
          {tableData?.items && tableData.items.length > 0 ? (
            <StyledTableContainer component={Paper}>
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <TableHeadCell>Название</TableHeadCell>
                    {tableData.columns && tableData.columns.map(column => (
                      <TableHeadCell key={column._id}>
                        {column.name}
                      </TableHeadCell>
                    ))}
                    <TableHeadCell align="right">Полезность</TableHeadCell>
                    <TableHeadCell align="center">Действия</TableHeadCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  <AnimatePresence>
                    {tableData.items.map((item, index) => (
                      <motion.tr
                        key={item._id}
                        component={StyledTableRow}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <StyledTableCell component="th" scope="row">
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>
                        </StyledTableCell>
                        
                        {tableData.columns.map(column => (
                          <StyledTableCell key={column._id}>
                            {item.ratings && item.ratings[column.name] !== undefined
                              ? item.ratings[column.name]
                              : '-'}
                          </StyledTableCell>
                        ))}
                        
                        <StyledTableCell align="right">
                          <Chip 
                            label={getUtility(item)} 
                            color="primary" 
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </StyledTableCell>
                        
                        <StyledTableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Tooltip title="Просмотреть детали">
                              <ActionButton
                                size="small"
                                color="info"
                                onClick={() => navigate(`/object/${id}/${item._id}`)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </ActionButton>
                            </Tooltip>
                            
                            {isOwner && (
                              <>
                                <Tooltip title="Редактировать">
                                  <ActionButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditObject(item._id)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </ActionButton>
                                </Tooltip>
                                
                                <Tooltip title="Удалить">
                                  <ActionButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteObject(item._id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </ActionButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </StyledTableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </StyledTableContainer>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                backgroundColor: alpha(theme.palette.primary.light, 0.05),
                borderRadius: '12px',
                mt: 3,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              <AssessmentIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.3), mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Пока нет объектов для сравнения
              </Typography>
              <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ maxWidth: 400, mb: 3 }}>
                Добавьте объекты, которые хотите сравнить, и укажите их характеристики
              </Typography>
              
              {isOwner && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenModal}
                  sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                  Добавить первый объект
                </Button>
              )}
            </Box>
          )}
        </motion.div>
      </motion.div>

      {/* Упрощенный компонент модального окна */}
      <SimpleModal
        open={modalOpen}
        onClose={handleCloseModal}
        title="Добавление нового объекта"
      >
        <form onSubmit={handleSubmit}>
          <TextField
            label="Название объекта"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
          
          <TextField
            label="Стоимость"
            name="cost"
            type="number"
            value={formData.cost || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            error={!!formErrors.cost}
            helperText={formErrors.cost || 'Укажите стоимость объекта'}
            inputProps={{ min: 0 }}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Оценки критериев:
          </Typography>
          
          {tableData?.columns && tableData.columns.map(column => (
            <TextField
              key={column._id}
              label={column.name}
              name={column._id}
              type="number"
              value={formData[column._id] || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              inputProps={{ min: 0, max: 10, step: 0.1 }}
              error={!!formErrors[column._id]}
              helperText={formErrors[column._id] || 'Оценка от 0 до 10'}
            />
          ))}
          
          <SubmitButton 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
          >
            Добавить объект
          </SubmitButton>
        </form>
      </SimpleModal>
    </PageContainer>
  );
};

export default TableView; 