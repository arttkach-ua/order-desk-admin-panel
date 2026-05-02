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
  IconButton,
  Tooltip,
  Collapse,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PeopleAlt as PeopleIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler, Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getExpeditors,
  createExpeditor,
  updateExpeditor,
  deleteExpeditor,
  getExpeditorCustomers,
} from '../api/expeditors';
import type { ExpeditorDto, CustomerDto } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
});

type FormValues = z.infer<typeof schema>;

const Expeditors: React.FC = () => {
  const [expeditors, setExpeditors] = useState<ExpeditorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ExpeditorDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExpeditorDto | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expeditorCustomers, setExpeditorCustomers] = useState<
    Record<number, CustomerDto[]>
  >({});

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(expeditorSchema) as Resolver<FormValues>,
    defaultValues: { name: '', phone: '' },
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getExpeditors();
      setExpeditors(res.data);
    } catch {
      setError(t('expeditors.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: '', phone: '' });
    setDialogOpen(true);
  };

  const openEdit = (exp: ExpeditorDto) => {
    setEditTarget(exp);
    reset({ name: exp.name, phone: exp.phone });
    setDialogOpen(true);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      setSubmitting(true);
      if (editTarget?.id) {
        await updateExpeditor(editTarget.id, values as ExpeditorDto);
      } else {
        await createExpeditor(values as ExpeditorDto);
      }
      setDialogOpen(false);
      reset();
      setEditTarget(null);
      await load();
    } catch {
      setError('Failed to save expeditor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteExpeditor(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch {
      setError('Failed to delete expeditor.');
    }
  };

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!expeditorCustomers[id]) {
      try {
        const res = await getExpeditorCustomers(id);
        setExpeditorCustomers((prev) => ({ ...prev, [id]: res.data }));
      } catch {
        setExpeditorCustomers((prev) => ({ ...prev, [id]: [] }));
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Expeditors</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Expeditor
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
                <TableCell>Phone</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Customers</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expeditors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No expeditors found</TableCell>
                </TableRow>
              ) : (
                expeditors.map((exp) => (
                  <React.Fragment key={exp.id}>
                    <TableRow hover>
                      <TableCell>{exp.id}</TableCell>
                      <TableCell>{exp.name}</TableCell>
                      <TableCell>{exp.phone}</TableCell>
                      <TableCell>
                        {exp.creationTime
                          ? new Date(exp.creationTime).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View assigned customers">
                          <IconButton
                            size="small"
                            onClick={() => toggleExpand(exp.id!)}
                            color={expandedId === exp.id ? 'primary' : 'default'}
                          >
                            <PeopleIcon fontSize="small" />
                            {expandedId === exp.id ? (
                              <CollapseIcon fontSize="small" />
                            ) : (
                              <ExpandIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(exp)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget(exp)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                        <Collapse in={expandedId === exp.id} unmountOnExit>
                          <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Assigned Customers:
                            </Typography>
                            {expeditorCustomers[exp.id!]?.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                No customers assigned
                              </Typography>
                            ) : (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {(expeditorCustomers[exp.id!] ?? []).map((c) => (
                                  <Chip
                                    key={c.id}
                                    label={`${c.name} (${c.phone})`}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? t('common.edit') : t('expeditors.addExpeditorTitle')}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t('expeditors.form.name')} error={!!errors.name} helperText={errors.name?.message} required />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t('expeditors.form.phone')} error={!!errors.phone} helperText={errors.phone?.message} required />
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

export default Expeditors;
