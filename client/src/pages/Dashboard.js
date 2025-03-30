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
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';

const PageTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 700,
  position: 'relative',
  display: 'inline-block',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '40%',
    height: '4px',
    bottom: '-8px',
    left: '0',
    borderRadius: '2px',
    backgroundColor: theme.palette.primary.main,
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
  
  const handleDeleteTable = async (id, e) => {
    e.stopPropagation();
    
    if (window.confirm('Вы уверены, что хотите удалить эту таблицу?')) {
      try {
        await axios.delete(`${BASE_URL}/api/tables/${id}`);
        setTables(tables.filter(table => table._id !== id));
        toast.success('Таблица успешно удалена');
      } catch (err) {
        console.error('Error deleting table:', err);
        toast.error('Ошибка при удалении таблицы');
      }
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
    <Container>
      <Box sx={{ my: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <PageTitle variant="h4" component="h1">
            Мои таблицы
          </PageTitle>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateTable}
            sx={{ 
              mt: { xs: 2, sm: 0 },
              borderRadius: '50px',
              fontWeight: 600,
              textTransform: 'none',
              py: 1.2,
              px: 3
            }}
          >
            Создать таблицу
          </Button>
        </Box>
        
        {error && (
          <Box sx={{ mb: 3 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        {tables.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8, 
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            borderRadius: 2
          }}>
            <TableChartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              У вас пока нет таблиц
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Создайте первую таблицу для сравнения объектов
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateTable}
              sx={{ mt: 2 }}
            >
              Создать таблицу
            </Button>
          </Box>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {tables.map((table) => (
                <Grid item xs={12} sm={6} md={4} key={table._id}>
                  <motion.div variants={itemVariants}>
                    <TableCard>
                      <CardActionArea onClick={() => handleViewTable(table._id)}>
                        <IconContainer>
                          <TableChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        </IconContainer>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                            {table.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            {table.description || 'Нет описания'}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="textSecondary">
                              Объектов: {table.objects?.length || 0}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Критериев: {table.criteria?.length || 0}
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                      
                      <Divider />
                      
                      <CardActions>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewTable(table._id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => handleEditTable(table._id, e)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => handleDeleteTable(table._id, e)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="caption" color="textSecondary">
                          {table.isPublic ? 'Публичная' : 'Приватная'}
                        </Typography>
                      </CardActions>
                    </TableCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard; 