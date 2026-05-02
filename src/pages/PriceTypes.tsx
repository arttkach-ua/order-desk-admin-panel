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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { getPriceTypes, createPriceType } from '../api/prices';
import type { PriceTypeDto } from '../types';

const PriceTypes: React.FC = () => {
  const { t } = useTranslation();
  const [priceTypes, setPriceTypes] = useState<PriceTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const schema = z.object({
    name: z.string().min(1, t('priceTypes.validation.nameRequired')),
  });

  type FormValues = z.infer<typeof schema>;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPriceTypes();
      setPriceTypes(res.data);
    } catch {
      setError(t('priceTypes.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      await createPriceType(values as PriceTypeDto);
      setDialogOpen(false);
      reset();
      await load();
    } catch {
      setError('Failed to create price type.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('priceTypes.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          {t('priceTypes.addPriceType')}
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
                <TableCell>{t('priceTypes.table.id')}</TableCell>
                <TableCell>{t('priceTypes.table.name')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {priceTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">{t('priceTypes.noPriceTypes')}</TableCell>
                </TableRow>
              ) : (
                priceTypes.map((pt) => (
                  <TableRow key={pt.id} hover>
                    <TableCell>{pt.id}</TableCell>
                    <TableCell>{pt.name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('priceTypes.addPriceTypeTitle')}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ pt: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('priceTypes.form.name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  required
                />
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

export default PriceTypes;
