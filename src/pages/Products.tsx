import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler, Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getProducts, createProduct } from '../api/products';
import { getCategories } from '../api/categories';
import type { ProductDto, ProductCategoryDto } from '../types';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  categoryId: z.coerce.number().min(1, 'Category is required'),
  imageUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  price: z.coerce.number().min(0, 'Price must be non-negative').optional(),
});

type FormValues = z.infer<typeof schema>;

const Products: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<ProductCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const productSchema = z.object({
    name: z.string().min(1, t('products.validation.nameRequired')),
    description: z.string().optional(),
    categoryId: z.coerce.number().min(1, t('products.validation.categoryRequired')),
    imageUrl: z.string().url(t('products.validation.validUrl')).or(z.literal('')).optional(),
    price: z.coerce.number().min(0, t('products.validation.priceNonNegative')).optional(),
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(productSchema) as Resolver<FormValues>,
    defaultValues: { name: '', description: '', categoryId: 0, imageUrl: '', price: 0 },
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch {
      setError(t('products.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      setSubmitting(true);
      await createProduct(values as ProductDto);
      setDialogOpen(false);
      reset();
      await load();
    } catch {
      setError(t('products.errorCreating'));
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? id;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('products.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          {t('products.addProduct')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('products.table.id')}</TableCell>
                <TableCell>{t('products.table.name')}</TableCell>
                <TableCell>{t('products.table.description')}</TableCell>
                <TableCell>{t('products.table.category')}</TableCell>
                <TableCell>{t('products.table.price')}</TableCell>
                <TableCell>{t('products.table.imageUrl')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">{t('products.noProducts')}</TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.description}</TableCell>
                    <TableCell>{getCategoryName(p.categoryId)}</TableCell>
                    <TableCell>{p.price != null ? `$${p.price}` : '—'}</TableCell>
                    <TableCell>
                      {p.imageUrl ? (
                        <a href={p.imageUrl} target="_blank" rel="noreferrer">
                          {t('common.view')}
                        </a>
                      ) : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('products.addProductTitle')}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t('products.form.name')} error={!!errors.name} helperText={errors.name?.message} required />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t('products.form.description')} multiline rows={2} />
              )}
            />
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t('products.form.category')}
                  error={!!errors.categoryId}
                  helperText={errors.categoryId?.message}
                  required
                >
                  <MenuItem value={0} disabled>{t('products.form.selectCategory')}</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('products.form.price')}
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  error={!!errors.price}
                  helperText={errors.price?.message}
                />
              )}
            />
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t('products.form.imageUrl')} error={!!errors.imageUrl} helperText={errors.imageUrl?.message} />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setDialogOpen(false); reset(); }}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? t('common.saving') : t('common.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Products;
