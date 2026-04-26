import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Fastfood as ProductsIcon,
  Category as CategoriesIcon,
  People as CustomersIcon,
  LocalShipping as ExpeditorsIcon,
  PriceChange as PriceTypesIcon,
  AttachMoney as PricesIcon,
} from '@mui/icons-material';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { getCustomers } from '../api/customers';
import { getExpeditors } from '../api/expeditors';
import { getPriceTypes, getCurrentPrices } from '../api/prices';

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [products, categories, customers, expeditors, priceTypes, prices] =
          await Promise.allSettled([
            getProducts(),
            getCategories(),
            getCustomers(),
            getExpeditors(),
            getPriceTypes(),
            getCurrentPrices(),
          ]);

        const getValue = (result: PromiseSettledResult<{ data: unknown[] }>) =>
          result.status === 'fulfilled' ? result.value.data.length : 0;

        setStats([
          {
            label: 'Products',
            value: getValue(products as PromiseSettledResult<{ data: unknown[] }>),
            icon: <ProductsIcon sx={{ fontSize: 40 }} />,
            color: '#1976d2',
          },
          {
            label: 'Categories',
            value: getValue(categories as PromiseSettledResult<{ data: unknown[] }>),
            icon: <CategoriesIcon sx={{ fontSize: 40 }} />,
            color: '#388e3c',
          },
          {
            label: 'Customers',
            value: getValue(customers as PromiseSettledResult<{ data: unknown[] }>),
            icon: <CustomersIcon sx={{ fontSize: 40 }} />,
            color: '#f57c00',
          },
          {
            label: 'Expeditors',
            value: getValue(expeditors as PromiseSettledResult<{ data: unknown[] }>),
            icon: <ExpeditorsIcon sx={{ fontSize: 40 }} />,
            color: '#7b1fa2',
          },
          {
            label: 'Price Types',
            value: getValue(priceTypes as PromiseSettledResult<{ data: unknown[] }>),
            icon: <PriceTypesIcon sx={{ fontSize: 40 }} />,
            color: '#c62828',
          },
          {
            label: 'Active Prices',
            value: getValue(prices as PromiseSettledResult<{ data: unknown[] }>),
            icon: <PricesIcon sx={{ fontSize: 40 }} />,
            color: '#00838f',
          },
        ]);
      } catch {
        setError('Failed to load dashboard data. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.label}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box mt={4}>
        <Alert severity="info">
          Backend API base URL:{' '}
          <strong>
            {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}
          </strong>
          . Set the <code>VITE_API_BASE_URL</code> environment variable to change it.
        </Alert>
      </Box>
    </Box>
  );
};

export default Dashboard;
