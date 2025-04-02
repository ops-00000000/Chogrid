import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  FormControlLabel, 
  Switch, 
  Divider, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  Alert, 
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const EditTable = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [tableData, setTableData] = useState({
    name: '',
    description: '',
    isPublic: false,
    columns: []
  });
  const [newColumn, setNewColumn] = useState({ name: '', weight: 1 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTable();
  }, [id]);

  const fetchTable = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tables/${id}`);
      
      console.log('Ответ при загрузке таблицы:', response.data);
      
      const tableData = response.data.data || response.data;
      
      if (!tableData) {
        throw new Error('Пустые данные таблицы');
      }
      
      setTable(tableData);
      setTableData({
        name: tableData.name,
        description: tableData.description || '',
        isPublic: tableData.isPublic,
        columns: tableData.columns || []
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при загрузке таблицы');
      console.error('Ошибка при загрузке таблицы:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setTableData({
      ...tableData,
      [name]: name === 'isPublic' ? checked : value
    });
  };

  const handleColumnChange = (e) => {
    const { name, value } = e.target;
    setNewColumn({
      ...newColumn,
      [name]: name === 'weight' ? Number(value) : value
    });
  };

  const validateWeights = (columns) => {
    return columns.every(column => column.weight > 0);
  };

  const addColumn = () => {
    if (!newColumn.name.trim()) {
      setError('Название колонки не может быть пустым');
      return;
    }

    if (tableData.columns.some(col => col.name === newColumn.name)) {
      setError('Колонка с таким названием уже существует');
      return;
    }

    if (newColumn.weight <= 0) {
      setError('Вес должен быть положительным числом');
      return;
    }

    setTableData({
      ...tableData,
      columns: [...tableData.columns, { ...newColumn }]
    });
    
    setNewColumn({ name: '', weight: 10 });
    setError(null);
  };

  const removeColumn = (index) => {
    if (window.confirm('Удаление колонки приведет к потере связанных с ней данных. Продолжить?')) {
      const updatedColumns = [...tableData.columns];
      updatedColumns.splice(index, 1);
      setTableData({ ...tableData, columns: updatedColumns });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tableData.name.trim()) {
      setError('Название таблицы обязательно');
      return;
    }

    if (tableData.columns.length === 0) {
      setError('Добавьте хотя бы одну колонку');
      return;
    }

    if (!validateWeights(tableData.columns)) {
      setError('Все веса должны быть положительными числами');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.put(`/tables/${id}`, tableData);
      
      console.log('Ответ при обновлении таблицы:', response.data);
      
      navigate(`/table/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении таблицы');
      console.error('Ошибка при обновлении таблицы:', err);
    } finally {
      setSubmitting(false);
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

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Редактирование таблицы
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Название таблицы"
              name="name"
              value={tableData.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              label="Описание"
              name="description"
              value={tableData.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={tableData.isPublic}
                  onChange={handleChange}
                  name="isPublic"
                  color="primary"
                />
              }
              label="Публичная таблица"
              sx={{ my: 2 }}
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Пользовательские колонки
            </Typography>

            <Box sx={{ display: 'flex', mb: 2 }}>
              <TextField
                label="Название колонки"
                name="name"
                value={newColumn.name}
                onChange={handleColumnChange}
                sx={{ flexGrow: 1, mr: 2 }}
              />
              <TextField
                label="Вес (%)"
                name="weight"
                type="number"
                value={newColumn.weight}
                onChange={handleColumnChange}
                inputProps={{ min: 1, step: 1 }}
                sx={{ width: '120px', mr: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={addColumn}
                startIcon={<AddIcon />}
              >
                Добавить
              </Button>
            </Box>

            {tableData.columns.length > 0 ? (
              <List>
                {tableData.columns.map((column, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={column.name}
                      secondary={`Вес: ${column.weight}%`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => removeColumn(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                Добавьте колонки, которые будут использоваться для оценки объектов
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => navigate(`/table/${id}`)}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Сохранить изменения'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditTable; 