import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  IconButton,
  useTheme,
  Paper,
  Tab,
  Tabs
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import TableChartIcon from '@mui/icons-material/TableChart';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
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

const SearchContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

const TableCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '50px',
  fontWeight: 500,
  '&.MuiChip-outlinedPrimary': {
    borderColor: theme.palette.primary.light,
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  fontWeight: 600,
  textTransform: 'none',
  padding: theme.spacing(1, 2),
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center', 
  padding: theme.spacing(6),
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
  borderRadius: '12px',
}));

const PublicTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicTables();
  }, []);

  const fetchPublicTables = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/tables/public`);
      
      // Логирование ответа для отладки
      console.log('Ответ от сервера (публичные таблицы):', response);
      console.log('Структура данных response.data:', response.data);
      
      if (Array.isArray(response.data)) {
        console.log('Публичные таблицы - это массив');
        setTables(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        console.log('Публичные таблицы находятся в response.data.data');
        setTables(response.data.data);
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log('Публичные таблицы находятся в response.data.data в формате {success, data}');
        setTables(response.data.data);
      } else {
        console.error('Неожиданный формат данных публичных таблиц:', response.data);
        setTables([]);
      }
      
      setError('');
    } catch (err) {
      console.error('Ошибка при загрузке публичных таблиц:', err);
      console.error('Детали ошибки:', err.response ? err.response.data : err.message);
      setError('Не удалось загрузить публичные таблицы');
      toast.error('Ошибка при загрузке публичных таблиц');
      // Устанавливаем пустой массив при ошибке
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleViewTable = (id) => {
    navigate(`/table/${id}`);
  };

  // Для сортировки по табам
  let filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (table.description && table.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Сортировка в зависимости от выбранного таба
  if (tabValue === 1) { // Новые
    filteredTables = [...filteredTables].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt));
  } else if (tabValue === 2) { // Популярные
    filteredTables = [...filteredTables].sort((a, b) => 
      (b.objects ? b.objects.length : 0) - (a.objects ? a.objects.length : 0));
  }
  
  // Анимации
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

  // Функция для импорта демо-таблицы
  const importDemoTable = async (tableData) => {
    try {
      // Получаем токен аутентификации
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Необходима авторизация. Пожалуйста, войдите в систему');
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
      fetchPublicTables(); // Обновляем список таблиц
    } catch (err) {
      console.error('Ошибка при импорте таблицы:', err);
      toast.error('Ошибка при импорте таблицы');
    }
  };
  
  // Функция для импорта всех демо-таблиц
  const importAllDemoTables = async () => {
    try {
      setIsImporting(true);
      await importDemoTable(smartphonesTable);
      await importDemoTable(laptopsTable);
      await importDemoTable(headphonesTable);
      toast.success('Все демонстрационные таблицы импортированы!');
    } catch (err) {
      console.error('Ошибка при импорте демонстрационных таблиц:', err);
      toast.error('Ошибка при импорте демонстрационных таблиц');
    } finally {
      setIsImporting(false);
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageTitle variant="h4" component="h1">
            Публичные таблицы
          </PageTitle>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SearchContainer elevation={0}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Поиск таблиц..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: { borderRadius: '50px' }
              }}
            />
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Все" />
                <Tab label="Новые" />
                <Tab label="Популярные" />
              </Tabs>
              
              <Box>
                <IconButton color="primary" aria-label="фильтр">
                  <FilterListIcon />
                </IconButton>
                <IconButton color="primary" aria-label="сортировка">
                  <SortIcon />
                </IconButton>
              </Box>
            </Box>
          </SearchContainer>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Paper 
              sx={{ 
                p: 2, 
                mb: 3, 
                backgroundColor: theme.palette.error.light,
                color: theme.palette.error.contrastText
              }}
            >
              <Typography>{error}</Typography>
            </Paper>
          </motion.div>
        )}

        {filteredTables.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EmptyState>
              <TableChartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {searchQuery 
                  ? 'По вашему запросу ничего не найдено' 
                  : 'Пока нет публичных таблиц'}
              </Typography>
              {searchQuery && (
                <Button 
                  variant="contained" 
                  color="primary"
                  sx={{ mt: 2, borderRadius: '50px' }}
                  onClick={() => setSearchQuery('')}
                >
                  Сбросить поиск
                </Button>
              )}
            </EmptyState>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {filteredTables.map(table => (
                <Grid item xs={12} sm={6} md={4} key={table._id}>
                  <motion.div variants={itemVariants}>
                    <TableCard>
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                          {table.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px' }}>
                          {table.description || 'Нет описания'}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <StyledChip 
                            label={`${table.objects?.length || 0} объектов`} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                          <StyledChip 
                            label={`${table.criteria?.length || 0} критериев`} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 2 }}>
                        <ActionButton 
                          onClick={() => handleViewTable(table._id)} 
                          startIcon={<VisibilityIcon />}
                          variant="contained"
                          color="primary"
                          fullWidth
                        >
                          Просмотреть
                        </ActionButton>
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

export default PublicTables; 