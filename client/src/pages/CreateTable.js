import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateTable = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState({
    name: '',
    description: '',
    isPublic: false,
    columns: []
  });
  const [newColumn, setNewColumn] = useState({ name: '', weight: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    const totalWeight = columns.reduce((sum, column) => sum + column.weight, 0);
    return Math.abs(totalWeight - 100) < 0.01;
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

    const totalWeight = tableData.columns.reduce((sum, col) => sum + col.weight, 0) + newColumn.weight;
    if (totalWeight > 100) {
      setError('Сумма весов не может превышать 100%. Текущая сумма: ' + totalWeight + '%');
      return;
    }

    setTableData({
      ...tableData,
      columns: [...tableData.columns, { ...newColumn }]
    });
    const remainingWeight = 100 - (tableData.columns.length + 1) * newColumn.weight;
    const defaultWeight = Math.min(Math.max(1, remainingWeight), 20);
    setNewColumn({ name: '', weight: defaultWeight });
    setError(null);
  };

  const removeColumn = (index) => {
    const updatedColumns = [...tableData.columns];
    updatedColumns.splice(index, 1);
    setTableData({ ...tableData, columns: updatedColumns });
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
      setError('Сумма весов должна равняться 100%. Текущая сумма: ' + 
        tableData.columns.reduce((sum, col) => sum + col.weight, 0).toFixed(1) + '%');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/tables', tableData);
      
      console.log('Ответ при создании таблицы:', response.data);
      
      const tableId = response.data.data?._id || response.data._id;
      
      if (!tableId) {
        throw new Error('Не удалось получить ID созданной таблицы');
      }
      
      navigate(`/table/${tableId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании таблицы');
      console.error('Ошибка при создании таблицы:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Создание новой таблицы
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
                inputProps={{ min: 1, max: 100, step: 1 }}
                sx={{ width: '120px', mr: 2 }}
                helperText={`Сумма: ${tableData.columns.reduce((sum, col) => sum + col.weight, 0) + newColumn.weight}%`}
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

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Создание...' : 'Создать таблицу'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateTable; 