import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
  Fade,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  useAddColumn,
  useRemoveColumn,
  useAddRow,
  useRemoveRow,
} from '../../../../core/hooks/admin/useAdminForms';
import { useAdminControlTypes, useAdminDataTypes, useAdminLookupTypes } from '../../../../core/hooks/admin/useAdminLookups';
import { BRAND_ACCENT, BRAND_NAVY } from '../../../../core/constants/theme';
import { ControlKeys } from '../../../../core/enums/control-keys.enum';
import type { AdminFormField, FieldColumn, FieldRow } from '../../../../core/types/admin/adminForms';
import { isLookupRequired, resolveControlType } from './controlFieldRequirements';

interface ManageTableStructureDialogProps {
  formId: number;
  field: AdminFormField;
  onClose: () => void;
}

const textFieldSx = { borderRadius: '12px', fontWeight: 600 };

const ManageTableStructureDialog: React.FC<ManageTableStructureDialogProps> = ({
  formId,
  field,
  onClose,
}) => {
  const theme = useTheme();
  const { data: rawControlTypes } = useAdminControlTypes();
  const { data: rawDataTypes } = useAdminDataTypes();
  const { data: rawLookupTypes } = useAdminLookupTypes();
  const controlTypes = Array.isArray(rawControlTypes) ? rawControlTypes : [];
  const dataTypes = Array.isArray(rawDataTypes) ? rawDataTypes : [];
  const lookupTypes = Array.isArray(rawLookupTypes) ? rawLookupTypes : [];

  const addColumn = useAddColumn();
  const removeColumn = useRemoveColumn();
  const addRow = useAddRow();
  const removeRow = useRemoveRow();

  const controlType = resolveControlType(field.controlTypeId, controlTypes);
  const isRawTable = controlType?.controlKey === ControlKeys.RawTable;

  const [columnKey, setColumnKey] = useState('');
  const [columnLabelEn, setColumnLabelEn] = useState('');
  const [columnLabelAr, setColumnLabelAr] = useState('');
  const [columnDataTypeId, setColumnDataTypeId] = useState<number | ''>('');
  const [columnControlTypeId, setColumnControlTypeId] = useState<number | ''>('');
  const [columnLookupTypeId, setColumnLookupTypeId] = useState<number | ''>('');
  const [columnErrors, setColumnErrors] = useState<Record<string, string>>({});

  const [rowKey, setRowKey] = useState('');
  const [rowLabelEn, setRowLabelEn] = useState('');
  const [rowLabelAr, setRowLabelAr] = useState('');
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const columns = field.formFieldColumns;
  const rows = field.formFieldRows;

  const handleAddColumn = (): void => {
    const errs: Record<string, string> = {};
    if (columnKey.trim().length === 0) errs.columnKey = 'Required';
    if (columnLabelEn.trim().length === 0) errs.columnLabelEn = 'Required';
    if (columnLabelAr.trim().length === 0) errs.columnLabelAr = 'Required';
    if (columnDataTypeId === '') errs.columnDataTypeId = 'Required';
    if (columnControlTypeId === '') errs.columnControlTypeId = 'Required';
    if (isLookupRequired(columnControlTypeId, controlTypes) && columnLookupTypeId === '') {
      errs.columnLookupTypeId = 'Required for list-based column controls';
    }
    setColumnErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const nextOrder = columns.length > 0
      ? Math.max(...columns.map((column) => column.displayOrder)) + 1
      : 1;

    addColumn.mutate(
      {
        formId,
        fieldId: field.fieldId,
        data: {
          columnKey: columnKey.trim().toUpperCase(),
          labelEn: columnLabelEn.trim(),
          labelAr: columnLabelAr.trim(),
          displayOrder: nextOrder,
          dataTypeId: Number(columnDataTypeId),
          controlTypeId: Number(columnControlTypeId),
          ...(columnLookupTypeId !== '' ? { lookupTypeId: Number(columnLookupTypeId) } : {}),
        },
      },
      {
        onSuccess: () => {
          setColumnKey('');
          setColumnLabelEn('');
          setColumnLabelAr('');
          setColumnLookupTypeId('');
          setColumnErrors({});
        },
      },
    );
  };

  const handleAddRow = (): void => {
    const errs: Record<string, string> = {};
    if (rowKey.trim().length === 0) errs.rowKey = 'Required';
    if (rowLabelEn.trim().length === 0) errs.rowLabelEn = 'Required';
    if (rowLabelAr.trim().length === 0) errs.rowLabelAr = 'Required';
    setRowErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const nextOrder = rows.length > 0
      ? Math.max(...rows.map((row) => row.displayOrder)) + 1
      : 1;

    addRow.mutate(
      {
        formId,
        fieldId: field.fieldId,
        data: {
          rowKey: rowKey.trim().toUpperCase(),
          labelEn: rowLabelEn.trim(),
          labelAr: rowLabelAr.trim(),
          displayOrder: nextOrder,
          isRequired: false,
          isReadOnly: false,
          isVisible: true,
        },
      },
      {
        onSuccess: () => {
          setRowKey('');
          setRowLabelEn('');
          setRowLabelAr('');
          setRowErrors({});
        },
      },
    );
  };

  const columnNeedsLookup = isLookupRequired(columnControlTypeId, controlTypes);

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Typography variant="h6" fontWeight={800}>
          {isRawTable ? 'Configure Grid Structure' : 'Configure Table Columns'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, maxHeight: '70vh' }}>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Field: {field.labelEn} ({field.fieldKey})
          </Typography>

          <Box>
            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'block' }}>
              Columns ({columns.length})
            </Typography>

            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {columns.length > 0 ? (
                columns.map((column: FieldColumn) => (
                  <Paper
                    key={column.columnId}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{column.labelEn}</Typography>
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">{column.columnKey}</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => removeColumn.mutate({ formId, fieldId: field.fieldId, columnId: column.columnId })}
                      sx={{ color: 'error.light' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))
              ) : (
                <Typography variant="caption" color="text.disabled" fontStyle="italic">
                  No columns yet.
                </Typography>
              )}
            </Stack>

            <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(BRAND_NAVY, 0.03), border: '1px dashed', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Column Key" value={columnKey} onChange={(e) => { setColumnKey(e.target.value); setColumnErrors((p) => ({ ...p, columnKey: '' })); }} error={Boolean(columnErrors.columnKey)} helperText={columnErrors.columnKey} fullWidth size="small" required InputProps={{ sx: textFieldSx }} />
                  <TextField label="Label (EN)" value={columnLabelEn} onChange={(e) => { setColumnLabelEn(e.target.value); setColumnErrors((p) => ({ ...p, columnLabelEn: '' })); }} error={Boolean(columnErrors.columnLabelEn)} helperText={columnErrors.columnLabelEn} fullWidth size="small" required InputProps={{ sx: textFieldSx }} />
                  <TextField label="Label (AR)" value={columnLabelAr} onChange={(e) => { setColumnLabelAr(e.target.value); setColumnErrors((p) => ({ ...p, columnLabelAr: '' })); }} error={Boolean(columnErrors.columnLabelAr)} helperText={columnErrors.columnLabelAr} fullWidth size="small" required inputProps={{ dir: 'rtl' }} InputProps={{ sx: textFieldSx }} />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <FormControl size="small" fullWidth required error={Boolean(columnErrors.columnDataTypeId)}>
                    <InputLabel>Data Type</InputLabel>
                    <Select value={columnDataTypeId} label="Data Type" onChange={(e) => { setColumnDataTypeId(e.target.value as number | ''); setColumnErrors((p) => ({ ...p, columnDataTypeId: '' })); }} sx={{ borderRadius: '12px' }}>
                      {dataTypes.map((dt) => <MenuItem key={dt.dataTypeId} value={dt.dataTypeId}>{dt.typeName}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth required error={Boolean(columnErrors.columnControlTypeId)}>
                    <InputLabel>Control Type</InputLabel>
                    <Select value={columnControlTypeId} label="Control Type" onChange={(e) => { setColumnControlTypeId(e.target.value as number | ''); setColumnErrors((p) => ({ ...p, columnControlTypeId: '', columnLookupTypeId: '' })); setColumnLookupTypeId(''); }} sx={{ borderRadius: '12px' }}>
                      {controlTypes.filter((ct) => ct.controlKey !== ControlKeys.Table && ct.controlKey !== ControlKeys.RawTable && ct.controlKey !== ControlKeys.CalculatedField).map((ct) => (
                        <MenuItem key={ct.controlTypeId} value={ct.controlTypeId}>{ct.controlName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {columnNeedsLookup && (
                    <FormControl size="small" fullWidth required error={Boolean(columnErrors.columnLookupTypeId)}>
                      <InputLabel>Lookup Type</InputLabel>
                      <Select value={columnLookupTypeId} label="Lookup Type" onChange={(e) => { setColumnLookupTypeId(e.target.value as number | ''); setColumnErrors((p) => ({ ...p, columnLookupTypeId: '' })); }} sx={{ borderRadius: '12px' }}>
                        {lookupTypes.map((lt) => <MenuItem key={lt.lookupTypeId} value={lt.lookupTypeId}>{lt.nameEn}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )}
                </Stack>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddColumn} disabled={addColumn.isPending} sx={{ alignSelf: 'flex-start', borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}>
                  Add Column
                </Button>
              </Stack>
            </Paper>
          </Box>

          {isRawTable && (
            <Box>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'block' }}>
                Rows ({rows.length})
              </Typography>

              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {rows.length > 0 ? (
                  rows.map((row: FieldRow) => (
                    <Paper key={row.rowId} elevation={0} sx={{ p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: alpha(theme.palette.divider, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{row.labelEn}</Typography>
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">{row.rowKey}</Typography>
                      </Box>
                      <IconButton size="small" onClick={() => removeRow.mutate({ formId, fieldId: field.fieldId, rowId: row.rowId })} sx={{ color: 'error.light' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="caption" color="text.disabled" fontStyle="italic">No rows yet.</Typography>
                )}
              </Stack>

              <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(BRAND_NAVY, 0.03), border: '1px dashed', borderColor: 'divider' }}>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="Row Key" value={rowKey} onChange={(e) => { setRowKey(e.target.value); setRowErrors((p) => ({ ...p, rowKey: '' })); }} error={Boolean(rowErrors.rowKey)} helperText={rowErrors.rowKey} fullWidth size="small" required InputProps={{ sx: textFieldSx }} />
                    <TextField label="Label (EN)" value={rowLabelEn} onChange={(e) => { setRowLabelEn(e.target.value); setRowErrors((p) => ({ ...p, rowLabelEn: '' })); }} error={Boolean(rowErrors.rowLabelEn)} helperText={rowErrors.rowLabelEn} fullWidth size="small" required InputProps={{ sx: textFieldSx }} />
                    <TextField label="Label (AR)" value={rowLabelAr} onChange={(e) => { setRowLabelAr(e.target.value); setRowErrors((p) => ({ ...p, rowLabelAr: '' })); }} error={Boolean(rowErrors.rowLabelAr)} helperText={rowErrors.rowLabelAr} fullWidth size="small" required inputProps={{ dir: 'rtl' }} InputProps={{ sx: textFieldSx }} />
                  </Stack>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddRow} disabled={addRow.isPending} sx={{ alignSelf: 'flex-start', borderRadius: '10px', fontWeight: 700, textTransform: 'none', color: BRAND_ACCENT, borderColor: alpha(BRAND_ACCENT, 0.4) }}>
                    Add Row
                  </Button>
                </Stack>
              </Paper>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="contained" color="inherit" sx={{ borderRadius: '12px', bgcolor: 'action.hover', fontWeight: 700, textTransform: 'none' }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageTableStructureDialog;
