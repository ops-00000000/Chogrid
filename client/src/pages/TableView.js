import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Divider,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from '../utils/AuthContext';
import api from '../services/api';
import TableDisplay from '../components/TableDisplay';

// Стили для модального окна
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '32px',
    borderRadius: '4px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    outline: 'none',
    zIndex: 1001
  }
};

const TableView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    cost: '',
    ratings: {}
  });
  const [dialogError, setDialogError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTable();
  }, [id]);

  useEffect(() => {
    // Блокируем прокрутку body когда открыто модальное окно
    if (openAddDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Очистка при размонтировании
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [openAddDialog]);

  const fetchTable = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tables/${id}`);
      const tableData = response.data.data;
      setTable(tableData);

      if (isAuthenticated && user && tableData.user) {
        setIsOwner(String(tableData.user) === String(user.id));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при загрузке таблицы');
      console.error('Ошибка при загрузке таблицы:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    const initialRatings = {};
    table.columns.forEach(column => {
      initialRatings[column.name] = 5;
    });

    setNewItem({
      name: '',
      cost: '',
      ratings: initialRatings
    });
    setOpenAddDialog(true);
    setDialogError(null);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'cost' ? (value === '' ? '' : Number(value)) : value
    });
  };

  const handleRatingChange = (columnName, value) => {
    setNewItem({
      ...newItem,
      ratings: {
        ...newItem.ratings,
        [columnName]: Number(value)
      }
    });
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      setDialogError('Название объекта обязательно');
      return;
    }

    if (newItem.cost === '') {
      setDialogError('Стоимость объекта обязательна');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(`/tables/${id}/items`, newItem);
      setTable(response.data.data);
      setOpenAddDialog(false);
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Ошибка при добавлении объекта');
      console.error('Ошибка при добавлении объекта:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот объект?')) {
      try {
        const response = await api.delete(`/tables/${id}/items/${itemId}`);
        setTable(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка при удалении объекта');
        console.error('Ошибка при удалении объекта:', err);
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!table) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            Таблица не найдена или у вас нет доступа к ней.
          </Alert>
          <Button
            component={Link}
            to="/public-tables"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Перейти к публичным таблицам
          </Button>
        </Box>
      </Container>
    );
  }

  console.log('Данные пользователя:', user);
  console.log('ID владельца таблицы:', table.user);
  console.log('isOwner:', isOwner);

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {table.name}
          </Typography>
          {isOwner && (
            <Box>
              <Button
                variant="outlined"
                component={Link}
                to={`/tables/edit/${id}`}
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
              >
                Редактировать
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenAddDialog}
                startIcon={<AddIcon />}
              >
                Добавить объект
              </Button>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableDisplay table={table} />
        
        {/* Собственная реализация модального окна */}
        {openAddDialog && (
          <div style={modalStyles.overlay} onClick={handleCloseAddDialog}>
            <div 
              style={modalStyles.content} 
              onClick={(e) => e.stopPropagation()}
            >
              <Typography variant="h6" gutterBottom>
                Добавление нового объекта
              </Typography>
              
              {dialogError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {dialogError}
                </Alert>
              )}

              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Название объекта"
                type="text"
                fullWidth
                value={newItem.name}
                onChange={handleItemChange}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="dense"
                name="cost"
                label="Стоимость"
                type="number"
                fullWidth
                value={newItem.cost}
                onChange={handleItemChange}
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle1" gutterBottom>
                Рейтинги по критериям:
              </Typography>

              {table.columns.map((column) => (
                <Box key={column.name} sx={{ mb: 2 }}>
                  <Typography variant="body2">{column.name}</Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={newItem.ratings[column.name]}
                    onChange={(e) => handleRatingChange(column.name, e.target.value)}
                    inputProps={{ min: 1, max: 10, step: 1 }}
                    sx={{ width: '100px' }}
                  />
                </Box>
              ))}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={handleCloseAddDialog} 
                  sx={{ mr: 1 }} 
                  disabled={submitting}
                >
                  Отмена
                </Button>
                <Button 
                  onClick={handleAddItem} 
                  variant="contained" 
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? 'Добавление...' : 'Добавить'}
                </Button>
              </Box>
            </div>
          </div>
        )}
      </Box>
    </Container>
  );
};

export default TableView; 