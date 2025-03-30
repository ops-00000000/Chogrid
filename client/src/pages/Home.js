import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import TableChartIcon from '@mui/icons-material/TableChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';

const FeatureItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const Home = () => {
  return (
    <Container>
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Chogrid - Помощник в принятии решений
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" paragraph>
          Интерактивные таблицы, которые помогут вам сделать правильный выбор при покупках
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/register"
            sx={{ mx: 1 }}
          >
            Начать бесплатно
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/public-tables"
            sx={{ mx: 1 }}
          >
            Смотреть публичные таблицы
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ my: 4 }}>
        <Grid item xs={12} md={4}>
          <FeatureItem elevation={3}>
            <TableChartIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="h3" gutterBottom>
              Создавайте таблицы
            </Typography>
            <Typography variant="body1">
              Добавляйте произвольные критерии оценки товаров и задавайте им веса важности
            </Typography>
          </FeatureItem>
        </Grid>
        <Grid item xs={12} md={4}>
          <FeatureItem elevation={3}>
            <CheckCircleIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="h3" gutterBottom>
              Автоматический расчет
            </Typography>
            <Typography variant="body1">
              Система автоматически рассчитает полезность каждого товара на основе оценок и весов
            </Typography>
          </FeatureItem>
        </Grid>
        <Grid item xs={12} md={4}>
          <FeatureItem elevation={3}>
            <PersonIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="h3" gutterBottom>
              Публикуйте и делитесь
            </Typography>
            <Typography variant="body1">
              Сделайте таблицу публичной, чтобы поделиться своими исследованиями с другими пользователями
            </Typography>
          </FeatureItem>
        </Grid>
      </Grid>

      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Как это работает?
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: 800, mx: 'auto' }}>
          Создайте таблицу, добавьте критерии оценки и задайте им веса важности. Добавляйте товары и оценивайте их по каждому критерию. 
          Chogrid автоматически рассчитает полезность каждого товара, помогая вам сделать оптимальный выбор.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          component={Link} 
          to="/login"
          sx={{ mt: 2 }}
        >
          Войти и начать
        </Button>
      </Box>
    </Container>
  );
};

export default Home; 