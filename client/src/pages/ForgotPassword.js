import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { AuthContext } from '../utils/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { forgotPassword } = useContext(AuthContext);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Пожалуйста, введите email');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await forgotPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Произошла ошибка. Пожалуйста, попробуйте позже.');
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={4} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Сброс пароля
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Инструкции по сбросу пароля отправлены на ваш email. Пожалуйста, проверьте свою почту.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Введите ваш email, и мы отправим вам инструкции по сбросу пароля.
            </Typography>

            <TextField
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              autoFocus
              disabled={isSubmitting || success}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting || success}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить инструкции'}
            </Button>

            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Вспомнили пароль?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Войти
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 