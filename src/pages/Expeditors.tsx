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
  IconButton,
  Tooltip,
  TablePagination,
  TableSortLabel,
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
import { useTranslation } from 'react-i18next';
import {
  getExpeditors,
  createExpeditor,
  updateExpeditor,
  deleteExpeditor,
} from '../api/expeditors';
import type { ExpeditorDto } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';

type FormValues = {
  name: string;
  phone: string;
};

const Expeditors: React.FC = () => {
  const { t } = useTranslation();
  const [expeditors, setExpeditors] = useState<ExpeditorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ExpeditorDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExpeditorDto | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Sorting state
  const [orderBy, setOrderBy] = useState<'id' | 'name'>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const schema = z.object({
    name: z.string().min(1, t('expeditors.validation.nameRequired')),
    phone: z.string().min(1, t('expeditors.validation.phoneRequired')),
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: '', phone: '' },
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sortParam = `${orderBy},${order}`;
      const res = await getExpeditors({ page, size: rowsPerPage, sort: sortParam });
      setExpeditors(res.data.content);
      setTotalCount(res.data.totalElements);
    } catch (err) {
      setError(t('expeditors.errorLoading'));
      console.error('Failed to load expeditors:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, orderBy, order, t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRequestSort = (property: 'id' | 'name') => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0); // Reset to first page when sorting changes
  };

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


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t('expeditors.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          {t('expeditors.addExpeditor')}
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
                 <TableCell>
                   <TableSortLabel
                     active={orderBy === 'id'}
                     direction={orderBy === 'id' ? order : 'asc'}
                     onClick={() => handleRequestSort('id')}
                   >
                     {t('expeditors.table.id')}
                   </TableSortLabel>
                 </TableCell>
                 <TableCell>
                   <TableSortLabel
                     active={orderBy === 'name'}
                     direction={orderBy === 'name' ? order : 'asc'}
                     onClick={() => handleRequestSort('name')}
                   >
                     {t('expeditors.table.name')}
                   </TableSortLabel>
                 </TableCell>
                  <TableCell>{t('expeditors.table.phone')}</TableCell>
                  <TableCell>{t('expeditors.table.creationTime')}</TableCell>
                  <TableCell align="center">{t('expeditors.table.actions')}</TableCell>
               </TableRow>
             </TableHead>
            <TableBody>
                {expeditors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">{t('expeditors.noExpeditors')}</TableCell>
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
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[50]}
            disabled={loading}
          />
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
