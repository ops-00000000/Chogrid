import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  CardActions,
  IconButton,
  CircularProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TableChartIcon from '@mui/icons-material/TableChart';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';
import { smartphonesTable, laptopsTable, headphonesTable } from '../demoData';

const PageTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 700,
  position: 'relative',
  display: 'inline-block',
  color: theme.palette.primary.dark,
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '40%',
    height: '4px',
    bottom: '-8px',
    left: '0',
    borderRadius: '2px',
    backgroundColor: theme.palette.primary.main,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }
}));

const TableCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  }
}));

const CardActionArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  cursor: 'pointer',
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
}));

const IconContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const Dashboard = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchTables();
  }, [isAuthenticated, navigate]);
  
  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/tables`);
      
      // Логирование ответа для отладки
      console.log('Ответ от сервера:', res);
      console.log('Структура данных res.data:', res.data);
      
      // Проверяем структуру ответа и обрабатываем разные форматы
      if (Array.isArray(res.data)) {
        console.log('Данные - это массив');
        setTables(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        console.log('Данные находятся в res.data.data');
        setTables(res.data.data);
      } else if (res.data && res.data.success && Array.isArray(res.data.data)) {
        console.log('Данные находятся в res.data.data в формате {success, data}');
        setTables(res.data.data);
      } else {
        console.error('Неожиданный формат данных:', res.data);
        // Всегда устанавливаем пустой массив, если данные не подходят под ожидаемый формат
        setTables([]);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching tables:', err);
      console.error('Детали ошибки:', err.response ? err.response.data : err.message);
      setError('Не удалось загрузить таблицы');
      toast.error('Ошибка при загрузке таблиц');
      // Устанавливаем пустой массив при ошибке
      setTables([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateTable = () => {
    navigate('/create-table');
  };
  
  const handleViewTable = (id) => {
    navigate(`/table/${id}`);
  };
  
  const handleEditTable = (id, e) => {
    e.stopPropagation();
    navigate(`/edit-table/${id}`);
  };
  
  const handleDeleteTable = async (tableId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту таблицу?')) {
      try {
        console.log('Начинаем удаление таблицы с ID:', tableId);
        
        // Получаем токен аутентификации
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Ошибка авторизации. Пожалуйста, войдите заново');
          navigate('/login');
          return;
        }
        
        // Настраиваем заголовки для запроса
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        
        // Удаляем таблицу
        await axios.delete(`${BASE_URL}/api/tables/${tableId}`, { headers });
        
        toast.success('Таблица успешно удалена!');
        // Обновляем список таблиц
        fetchTables();
        
      } catch (err) {
        console.error('Ошибка при удалении таблицы:', err);
        
        // Детальное логирование ошибки для отладки
        if (err.response) {
          console.error('Статус ошибки:', err.response.status);
          console.error('Данные ошибки:', err.response.data);
        }
        
        toast.error('Ошибка при удалении таблицы');
      }
    }
  };
  
  // Добавляем новую функцию для импорта демонстрационных таблиц
  const importDemoTable = async (tableData) => {
    try {
      // Получаем токен аутентификации
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Ошибка авторизации. Пожалуйста, войдите заново');
        navigate('/login');
        return;
      }
      
      // Настраиваем заголовки для запроса
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Создаем таблицу
      const response = await axios.post(`${BASE_URL}/api/tables`, tableData, { headers });
      
      console.log('Таблица успешно импортирована:', response.data);
      
      // Если есть объекты, добавляем их поочередно
      if (tableData.items && tableData.items.length > 0) {
        const tableId = response.data.data?._id || response.data._id;
        
        if (!tableId) {
          throw new Error('Не удалось получить ID созданной таблицы');
        }
        
        for (const item of tableData.items) {
          await axios.post(`${BASE_URL}/api/tables/${tableId}/items`, item, { headers });
        }
      }
      
      toast.success(`Таблица "${tableData.name}" успешно импортирована!`);
      fetchTables(); // Обновляем список таблиц
    } catch (err) {
      console.error('Ошибка при импорте таблицы:', err);
      toast.error('Ошибка при импорте таблицы');
    }
  };
  
  // Добавляем функцию для импорта всех демонстрационных таблиц
  const importAllDemoTables = async () => {
    try {
      await importDemoTable(smartphonesTable);
      await importDemoTable(laptopsTable);
      await importDemoTable(headphonesTable);
      toast.success('Все демонстрационные таблицы импортированы!');
    } catch (err) {
      console.error('Ошибка при импорте демонстрационных таблиц:', err);
      toast.error('Ошибка при импорте демонстрационных таблиц');
    }
  };
  
  // Варианты анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  if (loading) {
    return (
      <Container>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 200px)' 
        }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <PageTitle variant="h4" component="h1" align="center">
          Мои таблицы
        </PageTitle>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateTable}
          >
            Создать таблицу
          </Button>
          
          {/* Отображаем кнопку импорта только для админа или если ID пользователя равен 1 */}
          {user && (user.isAdmin || user._id === '1' || user.id === '1') && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DownloadIcon />}
              onClick={importAllDemoTables}
            >
              Импортировать примеры
            </Button>
          )}
        </Box>

        {error ? (
          <Typography color="error" align="center" variant="h6" sx={{ mt: 4 }}>
            {error}
          </Typography>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {tables.length === 0 ? (
                <Grid item xs={12}>
                  <Typography align="center" variant="body1" color="textSecondary" sx={{ mt: 4 }}>
                    {loading ? 'Загрузка...' : 'У вас пока нет таблиц. Создайте свою первую таблицу!'}
                  </Typography>
                </Grid>
              ) : (
                tables.map((table) => (
                  <Grid item xs={12} sm={6} md={4} key={table._id}>
                    <motion.div variants={itemVariants}>
                      <TableCard>
                        <CardActionArea onClick={() => handleViewTable(table._id)}>
                          <IconContainer>
                            <TableChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                          </IconContainer>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="h2" gutterBottom>
                              {table.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                              {table.description || 'Нет описания'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                              <Typography variant="caption" color="textSecondary">
                                Создана: {new Date(table.createdAt).toLocaleDateString()}
                              </Typography>
                              {table.isPublic && (
                                <Box sx={{ 
                                  px: 1, 
                                  py: 0.25, 
                                  bgcolor: 'primary.light', 
                                  color: 'white',
                                  borderRadius: 1,
                                  fontSize: '0.7rem' 
                                }}>
                                  Публичная
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                        </CardActionArea>
                        <Divider />
                        <CardActions>
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewTable(table._id)}
                            title="Просмотреть"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleEditTable(table._id, e)}
                            title="Редактировать"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteTable(table._id)}
                            title="Удалить"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </CardActions>
                      </TableCard>
                    </motion.div>
                  </Grid>
                ))
              )}
            </Grid>
          </motion.div>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard; 