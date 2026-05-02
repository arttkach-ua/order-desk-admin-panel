import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Orders: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        {t('orders.title')}
      </Typography>
      <Alert severity="info">{t('orders.placeholder')}</Alert>
    </Box>
  );
};

export default Orders;

