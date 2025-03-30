import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Alert,
  TextField,
  InputAdornment,
  Divider,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../services/api';

const PublicTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPublicTables();
  }, []);

  const fetchPublicTables = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tables/public');
      setTables(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при загрузке публичных таблиц');
      console.error('Ошибка при загрузке публичных таблиц:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (table.description && table.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          Публичные таблицы
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск таблиц..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ mb: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {filteredTables.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" color="text.secondary">
              {searchQuery 
                ? 'По вашему запросу ничего не найдено' 
                : 'Пока нет публичных таблиц'}
            </Typography>
            {searchQuery && (
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => setSearchQuery('')}
              >
                Сбросить поиск
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredTables.map(table => (
              <Grid item xs={12} sm={6} md={4} key={table._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {table.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {table.description || 'Нет описания'}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={`${table.items.length} объектов`} 
                        size="small" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`${table.columns.length} критериев`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link} 
                      to={`/tables/${table._id}`} 
                      startIcon={<VisibilityIcon />}
                      fullWidth
                    >
                      Просмотреть
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default PublicTables; 