import React, { useEffect, useState } from 'react';
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
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  getPrices,
  getCurrentPrices,
  getPriceTypes,
  createPricesBatch,
} from '../api/prices';
import { getProducts } from '../api/products';
import type { PriceDto, PriceTypeDto, ProductDto } from '../types';

const Prices: React.FC = () => {
  const { t } = useTranslation();
  const [prices, setPrices] = useState<PriceDto[]>([]);
  const [priceTypes, setPriceTypes] = useState<PriceTypeDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'all' | 'current'>('current');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const batchSchema = z.object({
    priceTypeId: z.coerce.number().min(1, t('prices.validation.priceTypeRequired')),
    prices: z
      .array(
        z.object({
          productId: z.coerce.number().min(1, 'Product is required'),
          value: z.coerce.number().min(0, 'Value must be non-negative'),
        })
      )
      .min(1, 'Add at least one price item'),
  });

  type BatchFormValues = z.infer<typeof batchSchema>;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema) as any,
    defaultValues: { priceTypeId: 0, prices: [{ productId: 0, value: 0 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'prices' });

  const load = async () => {
    try {
      setLoading(true);
      const [priceRes, ptRes, prodRes] = await Promise.all([
        view === 'current' ? getCurrentPrices() : getPrices(),
        getPriceTypes(),
        getProducts(),
      ]);
      setPrices(priceRes.data);
      setPriceTypes(ptRes.data);
      setProducts(prodRes.data);
    } catch {
      setError('Failed to load prices. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [view]);

  const getProductName = (id: number) =>
    products.find((p) => p.id === id)?.name ?? `Product #${id}`;

  const onSubmit: SubmitHandler<BatchFormValues> = async (values) => {
    try {
      setSubmitting(true);
      await createPricesBatch(values);
      setDialogOpen(false);
      reset({ priceTypeId: 0, prices: [{ productId: 0, value: 0 }] });
      await load();
    } catch {
      setError('Failed to save prices. Check that all product IDs are valid.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
         <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('prices.title')}</Typography>
         <Stack direction="row" spacing={2} alignItems="center">
           <ToggleButtonGroup
             value={view}
             exclusive
             onChange={(_, v) => v && setView(v)}
             size="small"
           >
             <ToggleButton value="current">Current</ToggleButton>
             <ToggleButton value="all">All</ToggleButton>
           </ToggleButtonGroup>
           <Button
             variant="contained"
             startIcon={<AddIcon />}
             onClick={() => setDialogOpen(true)}
           >
             {t('prices.batchUpdate')}
           </Button>
         </Stack>
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
                 <TableCell>{t('prices.table.id')}</TableCell>
                 <TableCell>{t('prices.table.product')}</TableCell>
                 <TableCell>{t('prices.table.priceType')}</TableCell>
                 <TableCell>{t('prices.table.price')}</TableCell>
                 <TableCell>{t('prices.table.validFrom')}</TableCell>
                 <TableCell>{t('prices.table.validTo')}</TableCell>
                 <TableCell>{t('prices.table.status')}</TableCell>
               </TableRow>
             </TableHead>
            <TableBody>
               {prices.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={7} align="center">{t('prices.noPrices')}</TableCell>
                 </TableRow>
              ) : (
                prices.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{getProductName(p.productId)}</TableCell>
                    <TableCell>{p.priceType}</TableCell>
                    <TableCell>${Number(p.price).toFixed(2)}</TableCell>
                    <TableCell>
                      {p.validFrom ? new Date(p.validFrom).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      {p.validTo ? new Date(p.validTo).toLocaleDateString() : '—'}
                    </TableCell>
                     <TableCell>
                       <Chip
                         label={p.isCurrent ? t('prices.status.active') : t('prices.status.expired')}
                         color={p.isCurrent ? 'success' : 'default'}
                         size="small"
                       />
                     </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

       <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
         <DialogTitle>{t('prices.batchUpdateTitle')}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Controller
              name="priceTypeId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Price Type"
                  error={!!errors.priceTypeId}
                  helperText={errors.priceTypeId?.message}
                  required
                >
                  <MenuItem value={0} disabled>Select price type</MenuItem>
                  {priceTypes.map((pt) => (
                    <MenuItem key={pt.id} value={pt.id}>{pt.name}</MenuItem>
                  ))}
                </TextField>
              )}
            />
             <Divider />
             <Typography variant="subtitle1">{t('common.add')}</Typography>
             {fields.map((field, index) => (
               <Stack key={field.id} direction="row" spacing={1} alignItems="flex-start">
                 <Controller
                   name={`prices.${index}.productId`}
                   control={control}
                   render={({ field: f }) => (
                     <TextField
                       {...f}
                       select
                       label={t('prices.form.product')}
                       size="small"
                       sx={{ flex: 2 }}
                       error={!!errors.prices?.[index]?.productId}
                       helperText={errors.prices?.[index]?.productId?.message}
                     >
                       <MenuItem value={0} disabled>{t('prices.form.selectProduct')}</MenuItem>
                      {products.map((p) => (
                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                 <Controller
                   name={`prices.${index}.value`}
                   control={control}
                   render={({ field: f }) => (
                     <TextField
                       label={t('prices.form.price')}
                       type="number"
                       size="small"
                       sx={{ flex: 1 }}
                       value={f.value}
                       onChange={f.onChange}
                       onBlur={f.onBlur}
                       name={f.name}
                       inputRef={f.ref}
                       inputProps={{ min: 0, step: 0.01 }}
                       error={!!errors.prices?.[index]?.value}
                       helperText={errors.prices?.[index]?.value?.message}
                     />
                   )}
                 />
                <Tooltip title="Remove">
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}
            <Button
              variant="outlined"
              size="small"
              onClick={() => append({ productId: 0, value: 0 })}
            >
              + {t('common.add')}
            </Button>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDialogOpen(false);
                reset({ priceTypeId: 0, prices: [{ productId: 0, value: 0 }] });
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? t('common.saving') : t('common.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Prices;
