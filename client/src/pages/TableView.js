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
  Backdrop,
  Modal,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress
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
import BarChartIcon from '@mui/icons-material/BarChart';
import InsightsIcon from '@mui/icons-material/Insights';
import PieChartIcon from '@mui/icons-material/PieChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';

const PageContainer = styled(Container)(({ theme }) => ({
  maxWidth: '100%',
  paddingLeft: 0,
  paddingRight: 0,
  marginBottom: 0,
  paddingBottom: 0,
  minHeight: '100vh'
}));

// Стиль для заголовка страницы
const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  margin: 0,
  borderRadius: 0,
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  width: '100%',
  '& .MuiTypography-root': {
    color: theme.palette.primary.contrastText,
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    '& .MuiIconButton-root': {
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.contrastText, 0.1),
      }
    }
  },
  '& .MuiButton-root': {
    color: theme.palette.primary.contrastText,
    borderColor: theme.palette.primary.contrastText,
    marginLeft: theme.spacing(1),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.contrastText, 0.1),
      borderColor: theme.palette.primary.contrastText,
    }
  }
}));

// Стиль для контейнера таблицы
const TableBox = styled(Paper)(({ theme }) => ({
  margin: 0,
  padding: 0,
  borderRadius: 0,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  width: '100vw',
  maxWidth: '100vw',
  position: 'relative',
  left: '50%',
  transform: 'translateX(-50%)',
  overflowX: 'auto',
  '& .MuiTableContainer-root': {
    maxHeight: 'calc(100vh - 120px)',
    width: '100%',
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.background.default,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.primary.main,
      borderRadius: '4px',
    },
  }
}));

// Стиль для ячейки таблицы с заголовком
const HeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: alpha(theme.palette.primary.main, 0.05)
}));

// Стиль для ячейки таблицы с данными
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  cursor: props => props.editable === 'true' ? 'pointer' : 'default',
  '&:hover': {
    backgroundColor: props => props.editable === 'true' ? alpha(theme.palette.primary.main, 0.05) : 'inherit'
  }
}));

// Стиль для ячейки с примечаниями
const NotesCell = styled(StyledTableCell)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.palette.text.secondary,
  backgroundColor: alpha(theme.palette.info.light, 0.05),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(theme.palette.info.light, 0.1)
  }
}));

// Добавляем константу для хранения примечаний в localStorage
const NOTES_STORAGE_KEY = 'table_notes';

// Стиль для модального окна аналитики
const AnalyticsModal = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '1200px',
  maxHeight: '90vh',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  padding: theme.spacing(3),
  borderRadius: '8px',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.main,
    borderRadius: '4px',
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '400px',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
}));

const AnalyticsHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

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
  
  // Добавляю новые состояния для редактирования
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  // Добавляю состояние для отображения описания колонки при наведении
  const [columnTooltip, setColumnTooltip] = useState(null);
  
  // Добавляем новое состояние для примечаний
  const [notes, setNotes] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Обновляем состояние для хранения примечаний к характеристикам
  const [columnNotes, setColumnNotes] = useState({});
  
  // Добавляем состояние для модального окна аналитики
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Добавляем состояние для формы добавления колонки
  const [showAddColumnForm, setShowAddColumnForm] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnWeight, setNewColumnWeight] = useState(10);
  
  // Добавляем состояния для автоматической генерации
  const [generatingTable, setGeneratingTable] = useState(false);
  const [generationDialog, setGenerationDialog] = useState(false);
  const [generationCategory, setGenerationCategory] = useState('');
  const [generationQuery, setGenerationQuery] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  
  // Tavily API ключ
  const TAVILY_API_KEY = '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';
  
  // Grok API ключ
  const GROK_API_KEY = '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';

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
        
        // Подробно исследуем элементы, чтобы понять, где хранятся примечания
        if (tableData.items && tableData.items.length > 0) {
          console.log('==== ИССЛЕДОВАНИЕ СТРУКТУРЫ ДАННЫХ ЭЛЕМЕНТОВ ====');
          
          tableData.items.forEach((item, index) => {
            console.log(`Элемент ${index + 1} (${item.name || 'без имени'}):`);
            console.log('- ID:', item._id);
            console.log('- Поля верхнего уровня:', Object.keys(item));
            
            // Проверяем наличие полей с префиксом note_
            const noteFields = Object.keys(item).filter(key => key.startsWith('note_'));
            if (noteFields.length > 0) {
              console.log('- Найдены поля примечаний верхнего уровня:', noteFields);
              noteFields.forEach(field => {
                console.log(`  - ${field}: ${item[field]}`);
              });
            }
            
            // Проверяем ratings
            if (item.ratings) {
              console.log('- Объект ratings содержит поля:', Object.keys(item.ratings));
              
              // Ищем примечания в ratings
              const noteRatings = Object.keys(item.ratings).filter(key => key.startsWith('note_'));
              if (noteRatings.length > 0) {
                console.log('- Найдены примечания в ratings:', noteRatings);
                noteRatings.forEach(field => {
                  console.log(`  - ${field}: ${item.ratings[field]}`);
                });
              }
            }
            
            // Проверяем columnNotes
            if (item.columnNotes) {
              console.log('- Объект columnNotes содержит поля:', Object.keys(item.columnNotes));
            }
            
            // Проверяем notes
            if (item.notes) {
              console.log('- Объект notes содержит поля:', Object.keys(item.notes));
            }
            
            console.log('------------------------------');
          });
          
          console.log('==== КОНЕЦ ИССЛЕДОВАНИЯ ====');
        }
        
        // Загружаем примечания, если они есть в данных
        if (tableData.items) {
          const notesMap = {};
          
          // Обрабатываем примечания для каждого элемента
          tableData.items.forEach(item => {
            if (item.columnNotes) {
              // Перебираем примечания к характеристикам
              Object.keys(item.columnNotes).forEach(key => {
                notesMap[`${item._id}-${key}`] = item.columnNotes[key];
              });
            }
            
            // Также проверяем ratings на наличие полей с префиксом note_
            if (item.ratings) {
              Object.keys(item.ratings).forEach(key => {
                if (key.startsWith('note_')) {
                  const columnId = key.substring(5); // Убираем префикс note_
                  const noteKey = `${item._id}-${columnId}`;
                  notesMap[noteKey] = item.ratings[key];
                }
              });
            }
          });
          
          // Устанавливаем загруженные примечания
          if (Object.keys(notesMap).length > 0) {
            console.log('Загружены примечания к характеристикам:', notesMap);
            setColumnNotes(notesMap);
          }
        }
        
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
      description: '',
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
    
    // Убираем обязательную валидацию стоимости
    if (formData.cost && (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) < 0)) {
      errors.cost = 'Стоимость должна быть положительным числом';
    }
    
    // Убираем обязательную валидацию критериев
    if (tableData && tableData.columns) {
      tableData.columns.forEach(column => {
        const value = formData[column._id];
        if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0 || parseFloat(value) > 10)) {
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
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        description: formData.description || '',
        ratings: {}
      };
      
      // Добавляем значения критериев только если они есть
      if (tableData && tableData.columns) {
        tableData.columns.forEach(column => {
          if (formData[column._id]) {
            objectData.ratings[column.name] = parseFloat(formData[column._id]);
          }
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
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Ошибка авторизации. Пожалуйста, войдите заново');
          navigate('/login');
          return;
        }

        await axios.delete(`${BASE_URL}/api/tables/${id}/items/${objectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Обновляем данные таблицы
        await fetchTable();
        toast.success('Объект успешно удален!');
      } catch (err) {
        console.error('Error deleting object:', err);
        if (err.response && err.response.status === 401) {
          toast.error('Ошибка авторизации. Пожалуйста, войдите заново');
          navigate('/login');
        } else {
          toast.error('Ошибка при удалении объекта');
        }
      }
    }
  };

  // Вычисление полезности объекта
  const getUtility = (item) => {
    if (!item.ratings || !tableData.columns) return 0;
    
    let totalUtility = 0;
    
    // Рассчитываем сумму весов для нормализации
    const totalColumnsWeight = tableData.columns.reduce((sum, col) => sum + col.weight, 0);
    
    tableData.columns.forEach(column => {
      const weight = column.weight || 1;
      const rating = item.ratings[column.name];
      
      if (rating !== undefined) {
        // Нормализуем вес (сумма весов = 1) и умножаем на оценку
        const normalizedWeight = totalColumnsWeight > 0 ? weight / totalColumnsWeight : 0;
        totalUtility += rating * normalizedWeight;
      }
    });
    
    // Полезность теперь в диапазоне от 0 до 10
    return totalUtility.toFixed(2);
  };

  // Вычисление соотношения полезности к стоимости
  const getUtilityToCostRatio = (item) => {
    const utility = parseFloat(getUtility(item));
    const cost = item.cost || 1; // Избегаем деления на ноль
    
    if (cost === 0) return "∞"; // Если стоимость равна 0, возвращаем бесконечность
    
    // Увеличиваем соотношение в 1000 раз для более наглядного отображения
    // Например, если полезность = 8, а стоимость = 10000, то соотношение = 0.0008
    // Умножаем на 1000, получаем 0.8, более наглядное значение
    const ratio = (utility / cost) * 1000;
    
    // Форматируем вывод в зависимости от величины числа
    if (ratio < 0.01) {
      return ratio.toExponential(2); // Используем научную нотацию для очень малых чисел
    } else if (ratio < 1) {
      return ratio.toFixed(3); // Три знака после запятой для малых чисел
    } else {
      return ratio.toFixed(1); // Один знак после запятой для больших чисел
    }
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

  // Функция для обработки начала редактирования ячейки
  const handleCellClick = (itemId, field, currentValue) => {
    // Если пользователь не владелец, не разрешаем редактирование
    if (!isOwner) return;
    
    // Устанавливаем editingCell в формате {itemId, field}
    setEditingCell({itemId, field});
    // Устанавливаем значение для редактирования
    setEditValue(currentValue !== undefined ? currentValue.toString() : '');
  };

  // Функция для обработки изменения значения при редактировании
  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  // Функция для получения примечания, сначала из ratings объекта, затем из локального хранилища
  const getColumnNote = (item, columnName) => {
    if (!item || !item._id) return '';
    
    // Проверяем все возможные места хранения примечаний
    
    // 1. Сначала пробуем получить из ratings объекта
    if (item.ratings && item.ratings[`note_${columnName}`] !== null && item.ratings[`note_${columnName}`] !== undefined) {
      return item.ratings[`note_${columnName}`];
    }
    
    // 2. Проверяем columnNotes
    if (item.columnNotes && item.columnNotes[columnName] !== null && item.columnNotes[columnName] !== undefined) {
      return item.columnNotes[columnName];
    }
    
    // 3. Проверяем notes
    if (item.notes && item.notes[columnName] !== null && item.notes[columnName] !== undefined) {
      return item.notes[columnName];
    }
    
    // 4. Проверяем прямое поле с note_ префиксом
    if (item[`note_${columnName}`] !== null && item[`note_${columnName}`] !== undefined) {
      return item[`note_${columnName}`];
    }
    
    // 5. Пробуем получить из локального хранилища
    try {
      const notesStr = localStorage.getItem(NOTES_STORAGE_KEY);
      if (notesStr) {
        const notes = JSON.parse(notesStr);
        const noteKey = `${item._id}-${columnName}`;
        if (notes[noteKey]) {
          return notes[noteKey];
        }
      }
    } catch (e) {
      console.error('Ошибка при чтении примечаний из localStorage:', e);
    }
    
    return '';
  };

  // Функция для сохранения примечания в localStorage
  const saveNoteToLocalStorage = (itemId, columnName, noteValue) => {
    try {
      if (!itemId || !columnName) return;
      
      console.log(`Сохраняем примечание для ${itemId}-${columnName}:`, noteValue);
      
      // Создаем уникальный ключ для этого примечания
      const noteKey = `${itemId}-${columnName}`;
      
      // Сохраняем значение в localStorage
      localStorage.setItem(noteKey, noteValue);
      
      // Обновляем наш объект с примечаниями
      setNotes(prev => ({
        ...prev,
        [noteKey]: noteValue
      }));
      
      console.log(`Примечание сохранено с ключом ${noteKey}`);
    } catch (err) {
      console.error('Ошибка при сохранении примечания в localStorage:', err);
    }
  };

  // Функция загрузки примечаний из localStorage
  const loadNotesFromLocalStorage = () => {
    try {
      const notesStr = localStorage.getItem(NOTES_STORAGE_KEY);
      if (notesStr) {
        return JSON.parse(notesStr);
      }
    } catch (e) {
      console.error('Ошибка при загрузке примечаний из localStorage:', e);
    }
    return {};
  };

  // Упрощаю функцию handleSaveEdit для примечаний, делая ее идентичной обработке характеристик
  const handleSaveEdit = async (e) => {
    if (e.key === 'Enter' && editingCell) {
      if (e.preventDefault && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      
      try {
        const {itemId, field} = editingCell;
        console.log('Сохраняем правку для поля:', field);
        
        // Получаем элемент из таблицы
        const item = tableData.items.find(i => i._id === itemId);
        if (!item) {
          toast.error('Элемент не найден');
          return;
        }
        
        let updateData = {};
        
        if (field === 'name' || field === 'cost' || field === 'description') {
          // Поля верхнего уровня
          updateData[field] = field === 'cost' ? parseFloat(editValue) : editValue;
        } else if (field.startsWith('note_')) {
          // Примечания - обрабатываем их ТОЧНО ТАК ЖЕ, как характеристики, только внутри ratings
          // Сначала сохраняем в localStorage для локальной копии
          const columnName = field.replace('note_', '');
          saveNoteToLocalStorage(itemId, columnName, editValue);
          
          // Сразу обновляем локальное состояние интерфейса
          setColumnNotes(prev => ({
            ...prev,
            [`${itemId}-${columnName}`]: editValue
          }));
          
          // Обновляем ratings ТОЧНО ТАК ЖЕ, как для обычных характеристик
          updateData = {
            ratings: { ...(item.ratings || {}) }
          };
          // Добавляем примечание с префиксом note_ в ratings
          updateData.ratings[field] = editValue;
          
          console.log('Обновляем ratings с примечанием:', updateData);
        } else {
          // Обычные характеристики
          let updatedValue = parseFloat(editValue);
          if (isNaN(updatedValue)) {
            toast.error('Введите корректное число');
            return;
          }
          
          // Обновляем ratings
          updateData = {
            ratings: { ...item.ratings }
          };
          updateData.ratings[field] = updatedValue;
        }
        
        // Отправляем запрос на обновление - ОДИНАКОВЫЙ для всех типов полей
        const response = await axios.put(
          `${BASE_URL}/api/tables/${id}/items/${itemId}`,
          updateData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        console.log('Успешный ответ сервера:', response.data);
        
        // Обновляем данные таблицы
        await fetchTable();
        
        // Показываем сообщение об успехе
        if (field.startsWith('note_')) {
          toast.success('Примечание сохранено');
        } else {
          toast.success('Значение обновлено');
        }
        
        // Сбрасываем состояние редактирования
        setEditingCell(null);
      } catch (err) {
        console.error('Ошибка обновления:', err);
        console.error('Детали ошибки:', err.response?.data);
        toast.error('Ошибка при обновлении значения');
        setEditingCell(null);
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Обновляем функцию handleEditColumnNote
  const handleEditColumnNote = (itemId, columnId, columnName) => {
    console.log('handleEditColumnNote вызван с параметрами:', { itemId, columnId, columnName });
    
    if (!isOwner) return;
    
    // Используем префикс "note_" для поля
    const noteField = `note_${columnName}`;
    
    console.log('Начинаем редактирование примечания для поля:', noteField);
    
    // Установка состояния редактирования
    setEditingCell({
      itemId,
      field: noteField
    });
    
    // Получаем элемент из таблицы
    const item = tableData.items.find(i => i._id === itemId);
    
    // Получаем текущее значение примечания через getColumnNote
    const currentNote = getColumnNote(item, columnName);
    
    console.log('Текущее примечание:', currentNote);
    
    // Устанавливаем текущее значение для редактирования
    setEditValue(currentNote);
  };

  // Обработчик клика вне области редактирования для сохранения значения
  const handleClickOutside = (e) => {
    if (editingCell && !e.target.closest('.editing-cell')) {
      // Передаем объект с ключом, но без preventDefault
      handleSaveEdit({ key: 'Enter' });
    }
  };

  // Добавляем эффект для обработки клика вне поля редактирования
  useEffect(() => {
    if (editingCell) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingCell]);

  // Функция для отображения всплывающей подсказки с описанием колонки
  const handleColumnMouseEnter = (itemColumnId) => {
    setColumnTooltip(itemColumnId);
  };

  const handleColumnMouseLeave = () => {
    setColumnTooltip(null);
  };

  // Функция для редактирования описания колонки
  const handleEditColumnDescription = async (columnId, currentDescription = '') => {
    if (!isOwner) return;
    
    // Запрашиваем новое описание у пользователя через диалог
    const newDescription = prompt('Введите описание колонки:', currentDescription);
    
    // Если пользователь отменил ввод или ничего не изменил, выходим
    if (newDescription === null || newDescription === currentDescription) return;
    
    try {
      // Находим индекс колонки в массиве
      const columnIndex = tableData.columns.findIndex(col => col._id === columnId);
      if (columnIndex === -1) return;
      
      // Создаем копию массива колонок
      const updatedColumns = [...tableData.columns];
      
      // Обновляем описание в копии
      updatedColumns[columnIndex] = {
        ...updatedColumns[columnIndex],
        description: newDescription
      };
      
      // Отправляем запрос на обновление таблицы
      await axios.put(`${BASE_URL}/api/tables/${id}`, {
        columns: updatedColumns
      });
      
      // Обновляем данные таблицы
      await fetchTable();
      
      toast.success('Описание колонки обновлено');
    } catch (err) {
      console.error('Error updating column description:', err);
      toast.error('Ошибка при обновлении описания колонки');
    }
  };

  // Функция для обновления примечания к элементу
  const handleUpdateNote = (itemId, newNote) => {
    if (!isOwner) return;
    
    setNotes(prev => ({
      ...prev,
      [itemId]: newNote
    }));
    
    // В реальном приложении здесь должен быть API запрос для сохранения примечания
    toast.success('Примечание сохранено');
  };

  // Функция для обработки редактирования примечания
  const handleEditNote = (itemId) => {
    if (!isOwner) return;
    
    const currentNote = notes[itemId] || '';
    const newNote = prompt('Введите примечание:', currentNote);
    
    if (newNote === null) return; // Пользователь отменил ввод
    
    handleUpdateNote(itemId, newNote);
  };

  // Функция для переключения полноэкранного режима
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Обновляем функцию для удаления таблицы
  const handleDeleteTable = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту таблицу?')) {
      console.log('Начинаем процесс удаления таблицы:', id);
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('Токен авторизации не найден');
          toast.error('Пожалуйста, войдите в систему снова');
          navigate('/login');
          return;
        }
        
        console.log('Токен авторизации получен');
        
        // Настраиваем заголовки для запроса
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        
        // Массив различных подходов к удалению таблицы
        const deletionMethods = [
          // Метод 1: DELETE с базовым путем
          async () => {
            console.log('Попытка 1: DELETE /api/tables/:id');
            await axios.delete(`${BASE_URL}/api/tables/${id}`, { headers });
          },
          
          // Метод 2: DELETE с /remove
          async () => {
            console.log('Попытка 2: DELETE /api/tables/:id/remove');
            await axios.delete(`${BASE_URL}/api/tables/${id}/remove`, { headers });
          },
          
          // Метод 3: PUT с /destroy
          async () => {
            console.log('Попытка 3: PUT /api/tables/:id/destroy');
            await axios.put(`${BASE_URL}/api/tables/${id}/destroy`, {}, { headers });
          },
          
          // Метод 4: POST с /forceDelete
          async () => {
            console.log('Попытка 4: POST /api/tables/:id/forceDelete');
            await axios.post(`${BASE_URL}/api/tables/${id}/forceDelete`, {}, { headers });
          },
          
          // Метод 5: POST с /delete
          async () => {
            console.log('Попытка 5: POST /api/tables/:id/delete');
            await axios.post(`${BASE_URL}/api/tables/${id}/delete`, {}, { headers });
          }
        ];
        
        // Перебираем все методы до первого успешного
        let success = false;
        let lastError = null;
        
        for (const method of deletionMethods) {
          try {
            await method();
            console.log('Таблица успешно удалена!');
            success = true;
            break; // Выходим из цикла после успешного удаления
          } catch (err) {
            console.error('Ошибка при попытке удаления:', err.message);
            lastError = err;
            // Продолжаем перебор методов
          }
        }
        
        if (success) {
          toast.success('Таблица успешно удалена!');
          // Перенаправляем пользователя на страницу со списком таблиц
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          // Если все методы не сработали, выводим последнюю ошибку
          console.error('Все методы удаления не сработали. Последняя ошибка:', lastError);
          toast.error('Не удалось удалить таблицу. Попробуйте другой метод');
        }
      } catch (error) {
        console.error('Общая ошибка при удалении таблицы:', error);
        
        // Детальное логирование ошибки для отладки
        if (error.response) {
          console.error('Статус ошибки:', error.response.status);
          console.error('Данные ошибки:', error.response.data);
        }
        
        toast.error('Ошибка при удалении таблицы');
      }
    }
  };

  // Добавляем стиль для полной высоты контента
  const html = document.documentElement;
  const body = document.body;
  if (html && body) {
    html.style.height = '100%';
    html.style.margin = '0';
    html.style.padding = '0';
    body.style.height = '100%';
    body.style.margin = '0';
    body.style.padding = '0';
    body.style.overflow = 'hidden';
    
    const root = document.getElementById('root');
    if (root) {
      root.style.height = '100%';
      root.style.margin = '0';
      root.style.padding = '0';
      root.style.overflow = 'auto';
    }
  }

  // Загружаем примечания при монтировании компонента
  useEffect(() => {
    // Загружаем примечания из localStorage при первом рендере
    const localNotes = loadNotesFromLocalStorage();
    
    if (Object.keys(localNotes).length > 0) {
      console.log('Загружены примечания из localStorage:', localNotes);
      setColumnNotes(prev => ({ ...prev, ...localNotes }));
    }
  }, []);

  // Функция для открытия модального окна аналитики
  const handleOpenAnalytics = () => {
    setAnalyticsOpen(true);
  };

  // Функция для закрытия модального окна аналитики
  const handleCloseAnalytics = () => {
    setAnalyticsOpen(false);
  };

  // Функция для изменения вкладки в аналитике
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Функция для получения данных для гистограммы сравнения объектов
  const getComparisonChartData = () => {
    if (!tableData || !tableData.items || tableData.items.length === 0) return [];
    
    return tableData.items.map(item => {
      const data = {
        name: item.name,
        utility: getUtility(item) || 0,
        cost: item.cost || 0
      };
      
      // Добавляем все характеристики в данные
      tableData.columns.forEach(column => {
        data[column.name] = item.ratings?.[column.name] || 0;
      });
      
      return data;
    });
  };

  // Функция для получения данных для радарной диаграммы
  const getRadarChartData = () => {
    if (!tableData || !tableData.items || tableData.items.length === 0) return [];
    
    const items = tableData.items;
    const columns = tableData.columns;
    
    // Подготовка данных для радарной диаграммы
    return columns.map(column => {
      const data = { 
        characteristic: column.name,
      };
      
      items.forEach(item => {
        data[item.name] = item.ratings?.[column.name] || 0;
      });
      
      return data;
    });
  };

  // Функция для получения данных для круговой диаграммы
  const getPieChartData = () => {
    if (!tableData || !tableData.columns || tableData.columns.length === 0) return [];
    
    return tableData.columns.map(column => ({
      name: column.name,
      value: column.weight || 0
    }));
  };

  // Функция для получения данных для диаграммы соотношения полезности к стоимости
  const getUtilityToCostData = () => {
    if (!tableData || !tableData.items || tableData.items.length === 0) return [];
    
    return tableData.items.map(item => ({
      name: item.name,
      value: item.cost > 0 ? getUtility(item) / item.cost : 0
    })).sort((a, b) => b.value - a.value);
  };

  // Цвета для графиков
  const COLORS = [
    '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', 
    '#d0ed57', '#ffc658', '#ff8042', '#ff6361', '#bc5090'
  ];

  // Функция для добавления новой колонки
  const handleAddColumn = async () => {
    if (!newColumnName.trim()) {
      toast.error('Введите название характеристики');
      return;
    }
    
    try {
      // Клонируем текущие колонки таблицы
      const updatedColumns = [...(tableData.columns || [])];
      
      // Добавляем новую колонку
      updatedColumns.push({
        name: newColumnName,
        weight: parseInt(newColumnWeight, 10) || 10
      });
      
      // Отправляем запрос на обновление таблицы
      await axios.put(`${BASE_URL}/api/tables/${id}`, {
        columns: updatedColumns
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Обновляем данные таблицы
      await fetchTable();
      
      // Сбрасываем форму и закрываем её
      setNewColumnName('');
      setNewColumnWeight(10);
      setShowAddColumnForm(false);
      
      toast.success('Характеристика успешно добавлена');
    } catch (err) {
      console.error('Ошибка при добавлении характеристики:', err);
      toast.error('Не удалось добавить характеристику');
    }
  };

  // Функция для открытия диалога генерации таблицы
  const handleOpenGenerationDialog = () => {
    if (!isAuthenticated) {
      toast.warning('Необходимо войти в систему для генерации таблицы');
      navigate('/login');
      return;
    }
    setGenerationDialog(true);
  };

  // Функция для закрытия диалога генерации таблицы
  const handleCloseGenerationDialog = () => {
    setGenerationDialog(false);
  };

  // Функция для запроса данных из Tavily API
  const fetchFromTavily = async (query) => {
    try {
      const response = await axios.post('https://api.tavily.com/search', {
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: "advanced",
        include_domains: [],
        exclude_domains: [],
        max_results: 10
      });
      
      console.log('Результаты поиска Tavily:', response.data);
      return response.data.results;
    } catch (error) {
      console.error('Ошибка при запросе к Tavily API:', error);
      throw new Error('Не удалось получить данные из Tavily API');
    }
  };

  // Функция для генерации характеристик с помощью LLM
  const generateCharacteristics = async (category) => {
    try {
      // Запрос на получение релевантных характеристик для категории
      const searchQuery = `Важные характеристики и критерии сравнения для выбора ${category}`;
      const searchResults = await fetchFromTavily(searchQuery);
      
      // Подготовка контекста для LLM
      let context = "На основе следующей информации, определите 5-7 ключевых характеристик для сравнения " + 
                    `${category}, включая их вес важности (1-100):\n\n`;
      
      searchResults.forEach((result, index) => {
        context += `[Источник ${index + 1}]: ${result.content}\n\n`;
      });
      
      // Отправка запроса к Grok API
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "Ты эксперт в области оценки и сравнения продуктов. Твоя задача - определить ключевые характеристики для сравнения продуктов указанной категории и присвоить им веса важности. Формат ответа должен быть: 1. Название характеристики: вес (число от 1 до 100)"
          },
          {
            role: "user",
            content: context
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Ответ от Grok API (характеристики):', response.data);
      
      // Парсинг ответа LLM
      const responseText = response.data.choices[0].message.content;
      
      // Простой парсер для извлечения характеристик и весов
      const lines = responseText.split('\n');
      const characteristics = [];
      
      for (const line of lines) {
        const match = line.match(/\d+\.\s*(.+?):\s*(\d+)/);
        if (match) {
          characteristics.push({
            name: match[1].trim(),
            weight: parseInt(match[2], 10)
          });
        }
      }
      
      return characteristics.length > 0 ? characteristics : [
        { name: "Качество дисплея", weight: 80 },
        { name: "Производительность", weight: 85 },
        { name: "Время автономной работы", weight: 75 },
        { name: "Качество камеры", weight: 70 },
        { name: "Дизайн и эргономика", weight: 60 }
      ];
    } catch (error) {
      console.error('Ошибка при генерации характеристик:', error);
      // Возвращаем запасной набор характеристик
      return [
        { name: "Качество дисплея", weight: 80 },
        { name: "Производительность", weight: 85 },
        { name: "Время автономной работы", weight: 75 },
        { name: "Качество камеры", weight: 70 },
        { name: "Дизайн и эргономика", weight: 60 }
      ];
    }
  };

  // Вспомогательная функция для нормализации названий колонок
  const normalizeColumnName = (name) => {
    if (!name) return '';
    
    // Удаляем звездочки, _ и другие спецсимволы, оставляем только буквы, цифры и пробелы
    const normalized = name.replace(/\*\*|\*|_|\d+\.|^\d+\s+/g, '').trim().toLowerCase();
    
    // Словарь соответствия английских и русских терминов
    const translations = {
      // Процессор и производительность
      'processor': 'процессор',
      'performance': 'производительность',
      'cpu': 'процессор',
      
      // Память
      'ram': 'память',
      'memory': 'память',
      'storage': 'хранение',
      'накопитель': 'хранение',
      
      // Дисплей
      'display': 'дисплей',
      'screen': 'экран',
      'монитор': 'экран',
      
      // Батарея
      'battery': 'батарея',
      'battery life': 'время работы',
      'аккумулятор': 'батарея',
      
      // Вес и портативность
      'weight': 'вес',
      'portability': 'портативность',
      
      // Цена
      'price': 'цена',
      'cost': 'стоимость',
      
      // Дизайн
      'design': 'дизайн',
      
      // Обновления
      'updates': 'обновления',
      'upgrade': 'обновление',
      
      // Общие
      'quality': 'качество',
      'capabilities': 'возможности',
      'size': 'размер',
      'resolution': 'разрешение'
    };
    
    return normalized;
  };

  // Вспомогательная функция для поиска соответствующего рейтинга по имени колонки
  const findRatingForColumn = (ratings, columnName) => {
    if (!ratings) return undefined;
    
    // Сначала пробуем найти точное совпадение
    if (ratings[columnName] !== undefined) {
      return { rating: ratings[columnName], key: columnName };
    }
    
    // Нормализуем имя колонки
    const normalizedColumnName = normalizeColumnName(columnName);
    
    // Словарь соответствия английских и русских терминов
    const translations = {
      // Процессор и производительность
      'processor': 'процессор',
      'performance': 'производительность',
      'cpu': 'процессор',
      
      // Память
      'ram': 'память',
      'memory': 'память',
      'storage': 'хранение',
      'накопитель': 'хранение',
      
      // Дисплей
      'display': 'дисплей',
      'screen': 'экран',
      'монитор': 'экран',
      
      // Батарея
      'battery': 'батарея',
      'battery life': 'время работы',
      'аккумулятор': 'батарея',
      
      // Вес и портативность
      'weight': 'вес',
      'portability': 'портативность',
      
      // Цена
      'price': 'цена',
      'cost': 'стоимость',
      
      // Дизайн
      'design': 'дизайн',
      
      // Обновления
      'updates': 'обновления',
      'upgrade': 'обновление',
      
      // Общие
      'quality': 'качество',
      'capabilities': 'возможности',
      'size': 'размер',
      'resolution': 'разрешение'
    };
    
    // Ищем по ключам рейтингов
    const keys = Object.keys(ratings);
    for (const key of keys) {
      const normalizedKey = normalizeColumnName(key);
      
      // Проверяем точное совпадение с нормализованными именами
      if (normalizedKey === normalizedColumnName) {
        return { rating: ratings[key], key };
      }
      
      // Проверяем термины через словарь переводов
      // Если ключ в рейтингах - английский термин, а колонка - русский аналог
      if (translations[normalizedKey] === normalizedColumnName) {
        return { rating: ratings[key], key };
      }
      
      // Если ключ в рейтингах - русский термин, а колонка - английский аналог
      if (normalizedKey === translations[normalizedColumnName]) {
        return { rating: ratings[key], key };
      }
      
      // Проверяем, содержит ли ключ или название колонки друг друга
      if (normalizedKey.includes(normalizedColumnName) || 
          normalizedColumnName.includes(normalizedKey)) {
        return { rating: ratings[key], key };
      }
      
      // Дополнительная проверка для сложных терминов
      const columnParts = normalizedColumnName.split(/\s+/);
      const keyParts = normalizedKey.split(/\s+/);
      
      // Если хотя бы одно слово совпадает
      for (const part of columnParts) {
        if (part.length < 3) continue; // Пропускаем короткие слова
        if (keyParts.some(keyPart => keyPart.includes(part) || part.includes(keyPart))) {
          return { rating: ratings[key], key };
        }
      }
    }
    
    // Ничего не нашли
    return undefined;
  };

  // Создание запроса для генерации объектов с обоснованиями
  const generateItems = async (category, characteristics) => {
    try {
      setGenerationProgress(60);
      setGenerationStep('Генерация объектов...');
      
      // Формируем контекст для запроса к API
      const columnNames = characteristics.map(col => cleanColumnName(col.name));
      
      // Создаем инструкции для Grok API
      const context = `
Мне нужно сгенерировать информацию для сравнительной таблицы товаров в категории "${category}".
Таблица уже содержит следующие характеристики для оценки: ${columnNames.join(', ')}.

Пожалуйста, предоставь информацию о 3-5 популярных моделях в этой категории. Для каждой модели укажи:
1. Название модели
2. Примерную стоимость в рублях
3. Краткое описание (1-2 предложения)
4. ВАЖНО: Числовую оценку по шкале от 1 до 10 для КАЖДОЙ из перечисленных характеристик
5. ВАЖНО: Добавь к каждой оценке краткое обоснование (1-2 предложения), почему эта модель получила такую оценку

Верни только структурированный JSON с массивом объектов в следующем формате:
[
  {
    "name": "Название модели",
    "cost": число,
    "description": "Краткое описание",
    "ratings": {
      "\${характеристика1}": число от 1 до 10,
      "\${характеристика2}": число от 1 до 10,
      ... только для указанных характеристик
    },
    "notes": {
      "\${характеристика1}": "Обоснование оценки характеристики",
      "\${характеристика2}": "Обоснование оценки характеристики",
      ... для каждой характеристики
    }
  },
  ... и так для каждой модели
]

ВАЖНО: Используй только те характеристики, которые я перечислил выше. Не добавляй никаких других характеристик.
`;

      // Дополнительные инструкции от пользователя
      const combinedContext = generationQuery 
        ? `${context}\n\nДополнительные указания: ${generationQuery}` 
        : context;

      console.log('Результаты поиска Tavily:', await fetchFromTavily(`${category} характеристики сравнение`));
        
      // Выполняем запрос к Grok API
      try {
        const grokResponse = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama3-70b-8192',
            messages: [
              {
                role: 'system',
                content: `Ты - эксперт по анализу технических характеристик и созданию сравнительных таблиц. 
Твоя задача - предоставить объективные данные для сравнения товаров в формате JSON. 
Используй только числовые значения для рейтингов и добавь к каждому рейтингу подробное обоснование. 

ОЧЕНЬ ВАЖНО: Используй только те характеристики, которые указаны в запросе. Не добавляй никаких других характеристик.
Не используй звездочки или другие форматирующие символы в названиях характеристик.
Названия характеристик должны точно соответствовать названиям из запроса.`
              },
              {
                role: 'user',
                content: combinedContext
              }
            ],
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${GROK_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Ответ от Grok API (объекты):', grokResponse.data);
        
        // Обрабатываем ответ
        const responseText = grokResponse.data.choices?.[0]?.message?.content || '';
        console.log('Текст ответа LLM:', responseText);
        
        // Улучшенный алгоритм извлечения JSON из текста
        let jsonData = [];
        
        // Попытка 1: Прямое извлечение JSON из ответа
        try {
          // Ищем начало и конец JSON массива
          let jsonStart = responseText.indexOf('[');
          let jsonEnd = responseText.lastIndexOf(']');
          
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            const jsonString = responseText.substring(jsonStart, jsonEnd + 1);
            console.log('Извлеченная JSON строка:', jsonString);
            jsonData = JSON.parse(jsonString);
            console.log('Успешно извлечен JSON:', jsonData);
          } else {
            throw new Error('JSON массив не найден в ответе');
          }
        } catch (jsonParseError) {
          console.error('Ошибка при прямом парсинге JSON:', jsonParseError);
          
          // Попытка 2: Поиск JSON с обработкой кавычек
          try {
            // Ищем текст, который может быть JSON
            const jsonPattern = /\[\s*{[\s\S]*}\s*\]/g;
            const matches = responseText.match(jsonPattern);
            
            if (matches && matches.length > 0) {
              const potentialJson = matches[0]
                .replace(/(\w+):/g, '"$1":') // Заменяем 'key:' на '"key":'
                .replace(/:\s*'([^']*)'/g, ': "$1"') // Заменяем одинарные кавычки на двойные
                .replace(/:\s*"([^"]*)"/g, ': "$1"'); // Оставляем двойные кавычки
              
              console.log('Потенциальный JSON после обработки:', potentialJson);
              jsonData = JSON.parse(potentialJson);
              console.log('Успешно извлечен JSON после обработки:', jsonData);
            } else {
              throw new Error('JSON паттерн не найден в ответе');
            }
          } catch (patternError) {
            console.error('Ошибка при обработке паттерна JSON:', patternError);
            
            // Попытка 3: Используем регулярные выражения для извлечения структурированной информации
            try {
              const modelBlocks = responseText.split(/\*\*Model:|Model:|Model name:|Модель:|Название:|Name:/i)
                .filter(block => block.trim().length > 0);
              
              console.log('Извлеченные блоки моделей:', modelBlocks);
              
              if (modelBlocks.length > 0) {
                jsonData = modelBlocks.map(block => {
                  // Извлекаем название модели
                  const nameMatch = block.match(/^\s*([^*\n]+?)(?:\*\*|\n|$)/);
                  const name = nameMatch ? nameMatch[1].trim() : `${category} модель`;
                  
                  // Извлекаем цену
                  const priceMatch = block.match(/Price:|Цена:|Cost:|Стоимость:.*?(\d[\d\s,.]+)(?:руб|\$|₽|рублей|RUB)/i);
                  const priceString = priceMatch ? priceMatch[1].replace(/\s+/g, '').replace(',', '.') : '';
                  const cost = Number(priceString) || Math.floor(Math.random() * 50000) + 30000;
                  
                  // Извлекаем описание
                  const descMatch = block.match(/Description:|Описание:.*?\n(.*?)(?:\n\n|\n[A-Z])/i);
                  const description = descMatch 
                    ? descMatch[1].trim() 
                    : `Современная модель ${category} с отличными характеристиками`;
                  
                  // Создаем объект с рейтингами и примечаниями
                  const ratings = {};
                  const notes = {};
                  
                  // Для каждой характеристики ищем оценку и примечание
                  for (const column of characteristics) {
                    const columnName = cleanColumnName(column.name);
                    // Ищем оценку в формате "Characteristic: 8/10" или "Characteristic - 8"
                    const ratingPattern = new RegExp(`${columnName}[^\\d]+(\\d+(?:\\.\\d+)?)(?:\\/10|-|:)`, 'i');
                    const ratingMatch = block.match(ratingPattern);
                    
                    // Ищем примечание после оценки
                    const notePattern = new RegExp(`${columnName}[^\\d]+\\d+(?:\\.\\d+)?(?:\\/10|-|:)\\s*(?:-\\s*|:\\s*|)([^\\n]+)`, 'i');
                    const noteMatch = block.match(notePattern);
                    
                    // Если нашли оценку, добавляем ее; иначе ставим случайную оценку
                    if (ratingMatch) {
                      ratings[columnName] = Number(ratingMatch[1]);
                    } else {
                      // Если не удалось найти оценку, используем случайное значение
                      ratings[columnName] = Math.floor(Math.random() * 3) + 7; // Случайное число от 7 до 9
                    }
                    
                    // Если нашли примечание, добавляем его
                    if (noteMatch) {
                      notes[columnName] = noteMatch[1].trim();
                    } else {
                      // Стандартное примечание
                      notes[columnName] = `Стандартное качество ${columnName.toLowerCase()} для этой ценовой категории`;
                    }
                  }
                  
                  return { name, cost, description, ratings, notes };
                });
                
                console.log('Данные, извлеченные из текстовых блоков:', jsonData);
              }
            } catch (blockError) {
              console.error('Ошибка при обработке текстовых блоков:', blockError);
            }
          }
        }
        
        // Проверяем, удалось ли извлечь данные
        if (jsonData && jsonData.length > 0) {
          // Валидируем и нормализуем данные
          return jsonData.map(item => {
            // Убеждаемся, что у нас есть все необходимые свойства
            const validItem = {
              name: item.name || `${category} модель`,
              cost: Number(item.cost) || Math.floor(Math.random() * 50000) + 30000,
              description: item.description || 'Современная модель с хорошими характеристиками',
              ratings: {},
              notes: item.notes || {}
            };
            
            // Обрабатываем рейтинги
            const itemRatings = {};
            
            // Проверяем рейтинги только для наших характеристик
            for (const column of characteristics) {
              const columnName = cleanColumnName(column.name);
              
              // Ищем рейтинг для этой характеристики
              let rating = 7.0; // По умолчанию
              
              if (item.ratings) {
                // Пробуем найти прямое соответствие
                if (item.ratings[columnName] !== undefined) {
                  rating = Number(item.ratings[columnName]) || 7.0;
                }
                // Пробуем найти с помощью улучшенного алгоритма
                else {
                  const found = findRatingForColumn(item.ratings, columnName);
                  if (found) {
                    rating = Number(found.rating) || 7.0;
                  }
                }
              }
              
              // Сохраняем рейтинг для этой характеристики
              validItem.ratings[columnName] = rating;
            }
            
            return validItem;
          });
        } else {
          console.warn('Не удалось извлечь данные из ответа LLM, использую тестовые данные');
          throw new Error('Данные не найдены в ответе LLM');
        }
      } catch (grokError) {
        console.error('Ошибка при запросе к Grok API или обработке ответа:', grokError);
        
        // Возвращаем тестовые данные в случае ошибки
        return [
          {
            name: `${category} Модель A`,
            cost: 75000,
            description: "Флагманская модель со всеми новейшими технологиями",
            ratings: characteristicsToRatings(characteristics, 8, 9),
            notes: characteristicsToNotes(characteristics, "Превосходное")
          },
          {
            name: `${category} Модель B`,
            cost: 59000,
            description: "Оптимальное соотношение цена/качество",
            ratings: characteristicsToRatings(characteristics, 7, 8),
            notes: characteristicsToNotes(characteristics, "Хорошее")
          },
          {
            name: `${category} Модель C`,
            cost: 88000,
            description: "Премиальная модель с лучшими характеристиками",
            ratings: characteristicsToRatings(characteristics, 9, 10),
            notes: characteristicsToNotes(characteristics, "Отличное")
          }
        ];
      }
    } catch (error) {
      console.error('Ошибка при генерации объектов:', error);
      return [];
    }
  };
  
  // Вспомогательная функция для генерации рейтингов
  const characteristicsToRatings = (characteristics, min, max) => {
    const ratings = {};
    
    characteristics.forEach(col => {
      // Генерируем случайную оценку в диапазоне [min, max]
      ratings[col.name] = +(Math.random() * (max - min) + min).toFixed(1);
    });
    
    return ratings;
  };
  
  // Вспомогательная функция для генерации примечаний
  const characteristicsToNotes = (characteristics, quality) => {
    const notes = {};
    
    characteristics.forEach(col => {
      notes[col.name] = `${quality} качество ${col.name.toLowerCase()} для данной модели.`;
    });
    
    return notes;
  };

  // Функция очистки имени колонки от служебных символов при создании/обновлении
  const cleanColumnName = (name) => {
    return name.replace(/\*\*|\*/g, '').trim();
  };

  // Основная функция генерации таблицы
  const generateTable = async () => {
    if (!generationCategory) {
      toast.error('Укажите категорию для генерации');
      return;
    }
    
    try {
      setGeneratingTable(true);
      setGenerationProgress(10);
      setGenerationStep('Проверка авторизации...');
      
      // Проверяем авторизацию
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Необходимо авторизоваться для генерации таблицы');
        setGeneratingTable(false);
        return;
      }
      
      console.log('Используем токен авторизации:', token.substring(0, 15) + '...');
      
      // ВАЖНОЕ ИЗМЕНЕНИЕ: Не создаем новые характеристики при автогенерации,
      // а используем существующие из таблицы
      setGenerationProgress(30);
      setGenerationStep('Получение структуры таблицы...');
      
      // Убеждаемся, что у нас есть структура таблицы
      try {
        await fetchTable();
        console.log('Текущая структура таблицы:', tableData);
      } catch (fetchErr) {
        console.error('Ошибка при получении таблицы:', fetchErr);
        toast.error('Не удалось получить структуру таблицы');
        setGeneratingTable(false);
        return;
      }
      
      // Проверяем, что у таблицы есть колонки
      if (!tableData || !tableData.columns || tableData.columns.length === 0) {
        console.error('Таблица не содержит характеристик:', tableData);
        toast.error('Таблица не содержит характеристик. Сначала добавьте характеристики.');
        setGeneratingTable(false);
        return;
      }
      
      setGenerationProgress(50);
      setGenerationStep('Поиск информации об объектах...');
      
      // Шаг 4: Генерируем объекты с существующими характеристиками
      const items = await generateItems(generationCategory, tableData.columns);
      console.log('Сгенерированные объекты:', items);
      
      if (items.length === 0) {
        toast.error('Не удалось сгенерировать объекты для таблицы');
        setGeneratingTable(false);
        return;
      }
      
      setGenerationProgress(70);
      setGenerationStep('Добавление объектов в таблицу...');
      
      // Шаг 5: Добавляем объекты в таблицу
      let successCount = 0;
      for (const item of items) {
        try {
          console.log('Попытка добавления объекта:', item);
          
          // Получаем имена колонок из таблицы и очищаем их от символов
          const columnNames = tableData?.columns?.map(col => col.name) || [];
          const cleanColumnNames = columnNames.map(cleanColumnName);
          
          console.log('Доступные колонки в таблице:', columnNames);
          console.log('Очищенные имена колонок:', cleanColumnNames);
          
          // Выводим для отладки все доступные рейтинги
          if (item.ratings) {
            console.log('Доступные рейтинги в объекте:', Object.keys(item.ratings));
          }
          
          // Создаем объект для рейтингов, содержащий ТОЛЬКО числовые оценки
          const ratings = {};
          
          // Добавляем рейтинги для каждой колонки
          for (let i = 0; i < columnNames.length; i++) {
            const columnName = columnNames[i]; // Оригинальное имя с символами
            const cleanName = cleanColumnNames[i]; // Очищенное имя
            
            // Проверяем варианты соответствия
            let foundRating = null;
            
            // 1. Пробуем найти по оригинальному имени
            if (item.ratings[columnName] !== undefined) {
              foundRating = { rating: item.ratings[columnName], key: columnName };
            } 
            // 2. Пробуем найти по очищенному имени
            else if (item.ratings[cleanName] !== undefined) {
              foundRating = { rating: item.ratings[cleanName], key: cleanName };
            }
            // 3. Используем улучшенную функцию сопоставления
            else {
              foundRating = findRatingForColumn(item.ratings, cleanName);
            }
            
            if (foundRating) {
              ratings[columnName] = Number(foundRating.rating) || 0;
              console.log(`Установлен рейтинг ${ratings[columnName]} для колонки "${columnName}" (из "${foundRating.key}")`);
            } else {
              // Если рейтинга нет, добавляем стандартный
              ratings[columnName] = 7.0;
              console.log(`Установлен стандартный рейтинг 7.0 для колонки "${columnName}" (не найдено соответствия)`);
            }
          }
          
          // Проверяем структуру объекта и корректируем при необходимости
          const preparedItem = {
            name: item.name || `${generationCategory} модель`,
            cost: Number(item.cost) || 0, // Преобразуем в число
            description: item.description || '',
            ratings: ratings // Содержит только числовые оценки
          };
          
          console.log('Подготовленный объект для добавления:', preparedItem);
          
          const addResponse = await axios.post(
            `${BASE_URL}/api/tables/${id}/items`, 
            preparedItem, 
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          console.log('Ответ при добавлении объекта:', addResponse.data);
          
          // Если объект был успешно добавлен, сохраняем примечания в localStorage
          if (addResponse.data && addResponse.data.success) {
            const itemId = addResponse.data.data._id;
            
            // Обрабатываем примечания из объекта notes
            if (item.notes) {
              console.log('Сохраняем примечания для объекта:', Object.keys(item.notes));
              
              for (let i = 0; i < columnNames.length; i++) {
                const columnName = columnNames[i];
                const cleanName = cleanColumnNames[i];
                
                // Ищем примечание с учетом разных вариантов названия колонки
                let noteText = null;
                
                // 1. Сначала проверяем точное совпадение
                if (item.notes[columnName]) {
                  noteText = item.notes[columnName];
                }
                // 2. Проверяем по очищенному имени
                else if (item.notes[cleanName]) {
                  noteText = item.notes[cleanName];
                } 
                // 3. Ищем среди всех примечаний подходящее
                else {
                  for (const noteKey of Object.keys(item.notes)) {
                    const normalizedNoteKey = normalizeColumnName(noteKey);
                    const normalizedColumnName = normalizeColumnName(cleanName);
                    
                    if (normalizedNoteKey === normalizedColumnName || 
                        normalizedNoteKey.includes(normalizedColumnName) || 
                        normalizedColumnName.includes(normalizedNoteKey)) {
                      noteText = item.notes[noteKey];
                      console.log(`Найдено соответствие для примечания: "${columnName}" -> "${noteKey}"`);
                      break;
                    }
                  }
                }
                
                // Если нашли примечание, сохраняем его
                if (noteText) {
                  try {
                    // Сохраняем примечание в localStorage
                    console.log(`Сохраняем примечание для ${itemId}-${columnName}:`, noteText);
                    localStorage.setItem(`${itemId}-${columnName}`, noteText);
                    
                    // Обновляем объект примечаний в состоянии
                    setNotes(prev => ({
                      ...prev,
                      [`${itemId}-${columnName}`]: noteText
                    }));
                  } catch (noteError) {
                    console.error('Ошибка при сохранении примечания:', noteError);
                  }
                }
              }
            }
            
            // Для обратной совместимости также проверяем примечания в ratings
            if (item.ratings) {
              for (const columnName of columnNames) {
                const noteKey = `note_${columnName}`;
                if (item.ratings[noteKey]) {
                  try {
                    // Сохраняем примечание в localStorage
                    const noteValue = item.ratings[noteKey];
                    console.log(`Сохраняем примечание из ratings для ${itemId}-${columnName}:`, noteValue);
                    localStorage.setItem(`${itemId}-${columnName}`, noteValue);
                    
                    // Обновляем объект примечаний в состоянии
                    setNotes(prev => ({
                      ...prev,
                      [`${itemId}-${columnName}`]: noteValue
                    }));
                  } catch (noteError) {
                    console.error('Ошибка при сохранении примечания из ratings:', noteError);
                  }
                }
              }
            }
          }
          
          successCount++;
        } catch (addErr) {
          console.error('Ошибка при добавлении объекта:', addErr);
          if (addErr.response) {
            console.error('Статус ошибки:', addErr.response.status);
            console.error('Данные ошибки:', addErr.response.data);
          }
          // Продолжаем с другими объектами, несмотря на ошибку
        }
      }
      
      if (successCount === 0) {
        toast.error('Не удалось добавить ни одного объекта в таблицу');
      } else {
        toast.success(`Успешно добавлено ${successCount} объектов в таблицу`);
      }
      
      setGenerationProgress(90);
      setGenerationStep('Завершение генерации...');
      
      // Шаг 6: Обновляем данные таблицы
      await fetchTable();
      
      setGenerationProgress(100);
      setGenerationStep('Готово!');
      
      toast.success('Таблица успешно сгенерирована!');
      
      setTimeout(() => {
        setGeneratingTable(false);
        setGenerationDialog(false);
        setGenerationProgress(0);
        setGenerationStep('');
      }, 1500);
      
    } catch (error) {
      console.error('Ошибка при генерации таблицы:', error);
      if (error.response) {
        console.error('Статус ошибки:', error.response.status);
        console.error('Данные ошибки:', error.response.data);
      }
      toast.error('Не удалось сгенерировать таблицу');
      setGeneratingTable(false);
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
      <TableBox>
        <PageHeader>
          <Typography variant="h5" component="h1">
            {tableData?.name || 'Загрузка...'}
            {isOwner && (
              <Tooltip title="Редактировать таблицу">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/edit-table/${id}`)}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isOwner && (
              <>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowAddColumnForm(true)}
                  startIcon={<AddIcon />}
                >
                  Добавить характеристику
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleOpenGenerationDialog}
                  startIcon={<AutoFixHighIcon />}
                  color="secondary"
                >
                  Автогенерация
                </Button>
              </>
            )}
            <Button 
              variant="contained" 
              onClick={handleOpenModal}
              startIcon={<AddIcon />}
            >
              Добавить объект
            </Button>
            <Button 
              variant="contained" 
              onClick={handleOpenAnalytics}
              startIcon={<AssessmentIcon />}
              color="secondary"
            >
              Аналитика
            </Button>
          </Box>
        </PageHeader>
        
        <TableContainer sx={{ width: '100%', maxHeight: 'calc(100vh - 120px)', padding: theme.spacing(2) }}>
          <Table size="small" stickyHeader sx={{ width: '100%', tableLayout: 'auto' }}>
            <TableHead>
              <TableRow>
                <HeadCell>Название</HeadCell>
                <HeadCell align="right">Полезность</HeadCell>
                <HeadCell align="right">Стоимость</HeadCell>
                <HeadCell align="right" sx={{ 
                  backgroundColor: alpha(theme.palette.success.light, 0.1) 
                }}>
                  Полезность/Стоимость
                </HeadCell>
                
                {/* Колонки характеристик и примечаний */}
                {tableData.columns?.map((col, idx) => (
                  <React.Fragment key={idx}>
                    <HeadCell>{col.name}</HeadCell>
                    <HeadCell sx={{ 
                      fontStyle: 'italic', 
                      backgroundColor: alpha(theme.palette.warning.light, 0.05),
                      minWidth: '150px'
                    }}>
                      Примечание
                    </HeadCell>
                  </React.Fragment>
                ))}
                
                {isOwner && <HeadCell>Действия</HeadCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.items?.map((item) => (
                <TableRow key={item._id}>
                  <StyledTableCell 
                    editable={isOwner ? 'true' : 'false'}
                    onClick={() => handleCellClick(item._id, 'name', item.name)}
                  >
                    {editingCell && editingCell.itemId === item._id && editingCell.field === 'name' ? (
                      <TextField
                        className="editing-cell"
                        value={editValue}
                        onChange={handleEditChange}
                        onKeyDown={handleSaveEdit}
                        autoFocus
                        size="small"
                        fullWidth
                        variant="standard"
                      />
                    ) : (
                      item.name
                    )}
                  </StyledTableCell>
                  
                  <StyledTableCell align="right">
                    <Chip 
                      label={getUtility(item)} 
                      color="primary" 
                      variant="outlined" 
                      size="small"
                    />
                  </StyledTableCell>
                  
                  <StyledTableCell 
                    editable={isOwner ? 'true' : 'false'}
                    onClick={() => handleCellClick(item._id, 'cost', item.cost)}
                    align="right"
                  >
                    {editingCell && editingCell.itemId === item._id && editingCell.field === 'cost' ? (
                      <TextField
                        className="editing-cell"
                        value={editValue}
                        onChange={handleEditChange}
                        onKeyDown={handleSaveEdit}
                        autoFocus
                        size="small"
                        type="number"
                        variant="standard"
                      />
                    ) : (
                      `${item.cost?.toFixed(2) || 0} ₽`
                    )}
                  </StyledTableCell>
                  
                  <StyledTableCell align="right" sx={{
                    backgroundColor: alpha(theme.palette.success.light, 0.05)
                  }}>
                    <Tooltip 
                      title={
                        <React.Fragment>
                          <Typography variant="body2">
                            Соотношение полезности к стоимости × 1000
                          </Typography>
                          <Typography variant="caption">
                            Исходное значение: {(parseFloat(getUtility(item)) / (item.cost || 1)).toFixed(6)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Чем выше значение, тем лучше соотношение цена/качество
                          </Typography>
                        </React.Fragment>
                      } 
                      arrow
                    >
                      <Chip 
                        label={getUtilityToCostRatio(item)}
                        color="success" 
                        variant="outlined" 
                        size="small"
                      />
                    </Tooltip>
                  </StyledTableCell>
                  
                  {tableData.columns && tableData.columns.map(column => (
                    <React.Fragment key={column._id || column.name}>
                      {/* Ячейка со значением характеристики */}
                      <StyledTableCell 
                        editable={isOwner ? 'true' : 'false'}
                        onClick={() => handleCellClick(item._id, column.name, item.ratings && item.ratings[column.name])}
                      >
                        {editingCell && editingCell.itemId === item._id && editingCell.field === column.name ? (
                          <TextField
                            className="editing-cell"
                            value={editValue}
                            onChange={handleEditChange}
                            onKeyDown={handleSaveEdit}
                            autoFocus
                            size="small"
                            type="number"
                            variant="standard"
                          />
                        ) : (
                          (item.ratings && item.ratings[column.name] !== undefined) ? 
                            item.ratings[column.name] : 
                            '-'
                        )}
                      </StyledTableCell>
                      
                      {/* Ячейка с примечанием к характеристике */}
                      <NotesCell 
                        editable={isOwner ? 'true' : 'false'}
                        onClick={() => handleEditColumnNote(item._id, column._id || column.name, column.name)}
                        sx={{ minWidth: '150px' }}
                      >
                        {editingCell && 
                          editingCell.itemId === item._id && 
                          editingCell.field === `note_${column.name}` ? (
                          <TextField
                            className="editing-cell"
                            value={editValue}
                            onChange={handleEditChange}
                            onKeyDown={handleSaveEdit}
                            autoFocus
                            size="small"
                            fullWidth
                            variant="standard"
                            multiline
                            placeholder="Примечание..."
                          />
                        ) : (
                          getColumnNote(item, column.name) || (isOwner ? 'Добавить...' : '-')
                        )}
                      </NotesCell>
                    </React.Fragment>
                  ))}
                  
                  {isOwner && (
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteObject(item._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TableBox>
      
      {/* Модальное окно для добавления новой колонки */}
      <Dialog
        open={showAddColumnForm}
        onClose={() => setShowAddColumnForm(false)}
        maxWidth="sm"
        fullWidth
        disablePortal
        disableEnforceFocus
        keepMounted
        sx={{ zIndex: 1300 }}
      >
        <DialogTitle>
          Добавление новой характеристики
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название характеристики"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Вес (важность)"
            type="number"
            value={newColumnWeight}
            onChange={(e) => setNewColumnWeight(e.target.value)}
            margin="normal"
            inputProps={{ min: 0, max: 100 }}
            helperText="Чем больше вес, тем больше влияние на общую полезность (от 0 до 100)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddColumnForm(false)}>
            Отмена
          </Button>
          <Button variant="contained" color="primary" onClick={handleAddColumn}>
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Модальное окно для аналитики - используем Dialog вместо Backdrop */}
      <Dialog
        open={analyticsOpen}
        onClose={handleCloseAnalytics}
        maxWidth="xl"
        fullWidth
        disablePortal
        disableEnforceFocus
        keepMounted
        sx={{ zIndex: 1300 }}
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            width: '90%',
            maxWidth: '1200px',
            m: 'auto',
            p: 3,
            overflowY: 'auto',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Typography variant="h5" component="h2">
            Аналитика: {tableData?.name}
          </Typography>
          <IconButton onClick={handleCloseAnalytics}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<BarChartIcon />} label="Сравнение объектов" />
          <Tab icon={<InsightsIcon />} label="Радар характеристик" />
          <Tab icon={<PieChartIcon />} label="Вес критериев" />
          <Tab icon={<TrendingUpIcon />} label="Эффективность (польза/стоимость)" />
        </Tabs>
        
        {/* Вкладка 1: Гистограмма сравнения объектов */}
        {activeTab === 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Сравнение объектов по общей полезности и характеристикам
            </Typography>
            <Box sx={{ height: 550, mb: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getComparisonChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value, name) => [`${value}`, name]}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '10px'
                    }}
                  />
                  <Legend 
                    verticalAпlign="top" 
                    wrapperStyle={{ 
                      paddingBottom: 20,
                      fontSize: 12
                    }}
                  />
                  <Bar dataKey="utility" fill="#8884d8" name="Общая полезность" strokeWidth={2} stroke="#6c60c9" />
                  <Bar dataKey="cost" fill="#82ca9d" name="Стоимость" opacity={0.7} />
                  {tableData?.columns.map((column, index) => (
                    <Bar 
                      key={column.name} 
                      dataKey={column.name} 
                      fill={COLORS[index % COLORS.length]} 
                      name={column.name}
                      opacity={0.8}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}
        
        {/* Вкладка 2: Радарная диаграмма */}
        {activeTab === 1 && (
          <>
            <Typography variant="h6" gutterBottom>
              Сравнение объектов по отдельным характеристикам (радар)
            </Typography>
            <Box sx={{ height: 400, mb: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart 
                  cx="50%" 
                  cy="50%" 
                  outerRadius="80%" 
                  data={getRadarChartData()}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="characteristic" />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  {tableData?.items.map((item, index) => (
                    <Radar 
                      key={item._id} 
                      name={item.name} 
                      dataKey={item.name} 
                      stroke={COLORS[index % COLORS.length]} 
                      fill={COLORS[index % COLORS.length]} 
                      fillOpacity={0.2} 
                    />
                  ))}
                  <Legend />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}
        
        {/* Вкладка 3: Круговая диаграмма весов критериев */}
        {activeTab === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Распределение весов критериев оценки
            </Typography>
            <Box sx={{ height: 400, mb: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => entry.name}
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value}%`, 'Вес']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}
        
        {/* Вкладка 4: Диаграмма соотношения полезности к стоимости */}
        {activeTab === 3 && (
          <>
            <Typography variant="h6" gutterBottom>
              Эффективность объектов (соотношение полезности к стоимости)
            </Typography>
            <Box sx={{ height: 400, mb: 4 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getUtilityToCostData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <RechartsTooltip 
                    formatter={(value) => [`${value.toFixed(4)}`, 'Эффективность']} 
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill="#8884d8" 
                    name="Польза / Стоимость" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              * Чем выше значение, тем более эффективен объект по соотношению полезности к стоимости
            </Typography>
          </>
        )}
      </Dialog>
      
      {/* Радикально измененный интерфейс автогенерации вместо Dialog */}
      {generationDialog && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1400,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleCloseGenerationDialog}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
              p: 4,
              width: '100%',
              maxWidth: 500,
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={handleCloseGenerationDialog}
              disabled={generatingTable}
            >
              <CloseIcon />
            </IconButton>
            
            <Typography variant="h6" component="h2" gutterBottom>
              Автоматическая генерация таблицы
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Система автоматически сгенерирует таблицу, используя данные из открытых источников. 
              Выберите категорию товаров или услуг для сравнения:
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Категория:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {[
                  "смартфоны", "ноутбуки", "телевизоры", "наушники", 
                  "планшеты", "умные часы", "фотоаппараты", "электросамокаты"
                ].map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    clickable
                    onClick={() => setGenerationCategory(category)}
                    color={generationCategory === category ? "primary" : "default"}
                    variant={generationCategory === category ? "filled" : "outlined"}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
            
            <TextField
              margin="normal"
              label="Дополнительный запрос (необязательно)"
              fullWidth
              value={generationQuery}
              onChange={(e) => setGenerationQuery(e.target.value)}
              disabled={generatingTable}
              placeholder="Например: высокого класса, до 100000 рублей и т.д."
            />
            
            {generatingTable && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  {generationStep}
                </Typography>
                <LinearProgress variant="determinate" value={generationProgress} sx={{ my: 1 }} />
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button 
                onClick={handleCloseGenerationDialog} 
                disabled={generatingTable}
                sx={{ mr: 1 }}
              >
                Отмена
              </Button>
              <Button 
                onClick={generateTable} 
                variant="contained" 
                color="primary" 
                disabled={!generationCategory || generatingTable}
                startIcon={generatingTable ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
              >
                {generatingTable ? 'Генерация...' : 'Сгенерировать'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </PageContainer>
  );
};

export default TableView; 