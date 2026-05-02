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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler, Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../api/customers';
import { getExpeditors } from '../api/expeditors';
import type { CustomerDto, ExpeditorDto } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(1, 'Phone is required'),
  expeditorId: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof schema>;

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [expeditors, setExpeditors] = useState<ExpeditorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomerDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerDto | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(customerSchema) as Resolver<FormValues>,
    defaultValues: { name: '', email: '', phone: '', expeditorId: undefined },
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [custRes, expRes] = await Promise.all([getCustomers(), getExpeditors()]);
      setCustomers(custRes.data);
      setExpeditors(expRes.data);
    } catch {
      setError(t('customers.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: '', email: '', phone: '', expeditorId: undefined });
    setDialogOpen(true);
  };

  const openEdit = (customer: CustomerDto) => {
    setEditTarget(customer);
    reset({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      expeditorId: customer.expeditorId,
    });
    setDialogOpen(true);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      setSubmitting(true);
      if (editTarget?.id) {
        await updateCustomer(editTarget.id, values as CustomerDto);
      } else {
        await createCustomer(values as CustomerDto);
      }
      setDialogOpen(false);
      reset();
      setEditTarget(null);
      await load();
    } catch {
      setError('Failed to save customer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteCustomer(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch {
      setError('Failed to delete customer.');
    }
  };

  const getExpeditorName = (id?: number) =>
    id ? expeditors.find((e) => e.id === id)?.name ?? id : '—';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Customers</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Customer
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
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Expeditor</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No customers found</TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.id}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>{getExpeditorName(c.expeditorId)}</TableCell>
                    <TableCell>
                      {c.creationTime
                        ? new Date(c.creationTime).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(c)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(c)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? t('common.edit') : t('customers.addCustomerTitle')}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t('customers.form.name')} error={!!errors.name} helperText={errors.name?.message} required />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t('customers.form.email')} type="email" error={!!errors.email} helperText={errors.email?.message} required />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t('customers.form.phone')} error={!!errors.phone} helperText={errors.phone?.message} required />
              )}
            />
            <Controller
              name="expeditorId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label={t('customers.form.expeditor')}>
                  <MenuItem value="">{t('customers.form.noExpeditor')}</MenuItem>
                  {expeditors.map((e) => (
                    <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setDialogOpen(false); reset(); setEditTarget(null); }}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? t('common.saving') : t('common.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('common.delete')}
        message={`${t('common.delete')} "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default Customers;
