import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { AuthContext } from '../utils/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tables');
      setTables(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при загрузке таблиц');
      console.error('Ошибка при загрузке таблиц:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту таблицу?')) {
      try {
        await api.delete(`/tables/${id}`);
        setTables(tables.filter(table => table._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка при удалении таблицы');
        console.error('Ошибка при удалении таблицы:', err);
      }
    }
  };

  const handleTogglePublic = async (id, isPublic) => {
    try {
      await api.put(`/tables/${id}`, { isPublic: !isPublic });
      setTables(tables.map(table => 
        table._id === id ? { ...table, isPublic: !isPublic } : table
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при изменении статуса таблицы');
      console.error('Ошибка при изменении статуса таблицы:', err);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Личный кабинет
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/tables/create"
            startIcon={<AddIcon />}
          >
            Создать таблицу
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom>
          Добро пожаловать, {user?.name || 'Пользователь'}!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {tables.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" paragraph>
              У вас пока нет созданных таблиц.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/tables/create"
              startIcon={<AddIcon />}
            >
              Создать первую таблицу
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Дата создания</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table._id}>
                    <TableCell>{table.name}</TableCell>
                    <TableCell>{table.description || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={table.isPublic ? 'Публичная' : 'Частная'}
                        color={table.isPublic ? 'success' : 'default'}
                        onClick={() => handleTogglePublic(table._id, table.isPublic)}
                        clickable
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(table.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        component={Link}
                        to={`/tables/${table._id}`}
                        color="primary"
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        component={Link}
                        to={`/tables/edit/${table._id}`}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteTable(table._id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard; 