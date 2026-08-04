import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Avatar,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  ManageAccounts as ManageIcon,
  PersonAdd as AssignRoleIcon,
  Delete as RemoveIcon,
  Business as DirectorateIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import AdminLayout from '../../shared/AdminLayout';
import {
  useAdminUsers,
  useAdminAllRoles,
  useAdminUserRoles,
  useAssignRoleToUser,
  useRemoveRoleFromUser,
  useAssignDirectorateToUser,
} from '../../../../core/hooks/admin/useAdminUsers';
import { useAdminDirectorates } from '../../../../core/hooks/admin/useAdminDirectorates';
import { BRAND_NAVY, BRAND_ACCENT } from '../../../../core/constants/theme';
import type { AdminUser, UserRoleAssignment } from '../../../../core/types/admin/adminUsers';
import type { SelectChangeEvent } from '@mui/material';

// ─── Manage User Dialog ───────────────────────────────────────────────────────

interface ManageUserDialogProps {
  user: AdminUser;
  onClose: () => void;
}

const ManageUserDialog: React.FC<ManageUserDialogProps> = ({ user, onClose }) => {
  const theme = useTheme();
  const { data: rawAllRoles } = useAdminAllRoles();
  const allRoles = Array.isArray(rawAllRoles) ? rawAllRoles : [];

  const { data: rawDialogDirectorates } = useAdminDirectorates();
  const directorates = Array.isArray(rawDialogDirectorates) ? rawDialogDirectorates : [];

  const { data: rawUserRoles, isLoading: rolesLoading } = useAdminUserRoles(user.userId);
  const userRoleList: UserRoleAssignment[] = Array.isArray(rawUserRoles) ? rawUserRoles : [];

  const assignRole = useAssignRoleToUser();
  const removeRole = useRemoveRoleFromUser();
  const assignDirectorate = useAssignDirectorateToUser();

  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
  const [selectedDirectorateId, setSelectedDirectorateId] = useState<number | ''>(
    user.directorateId ?? '',
  );

  const handleAssignRole = (): void => {
    if (selectedRoleId === '') return;
    assignRole.mutate({ userId: user.userId, data: { roleId: Number(selectedRoleId) } });
    setSelectedRoleId('');
  };

  const handleRemoveRole = (assignment: UserRoleAssignment): void => {
    removeRole.mutate({ userId: user.userId, roleId: assignment.roleId });
  };

  const handleAssignDirectorate = (): void => {
    assignDirectorate.mutate({
      userId: user.userId,
      data: { directorateId: selectedDirectorateId === '' ? null : Number(selectedDirectorateId) },
    });
  };

  const handleDirectorateChange = (e: SelectChangeEvent<number | string>): void => {
    const val = e.target.value;
    setSelectedDirectorateId(val === '' ? '' : Number(val));
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: { borderRadius: '24px', p: 1 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Stack direction="row" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: BRAND_ACCENT, width: 48, height: 48, fontWeight: 800 }}>
            {user.fullNameEn.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
              Manage User
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {user.email}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Stack spacing={4} sx={{ py: 1 }}>
          {/* ── Roles section ── */}
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="text.primary" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignRoleIcon fontSize="small" sx={{ color: BRAND_ACCENT }} />
              User Roles
            </Typography>

            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'action.hover', mb: 2 }}>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {rolesLoading ? (
                  <CircularProgress size={16} />
                ) : userRoleList.length === 0 ? (
                  <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    No roles assigned yet.
                  </Typography>
                ) : (
                  userRoleList.map((assignment) => (
                    <Chip
                      key={assignment.userRoleId}
                      label={assignment.role.roleName}
                      size="small"
                      onDelete={() => handleRemoveRole(assignment)}
                      sx={{
                        bgcolor: '#fff',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: 'divider',
                        '& .MuiChip-label': { px: 1.5 }
                      }}
                    />
                  ))
                )}
              </Stack>
            </Box>

            <Stack direction="row" gap={1.5}>
              <FormControl size="small" fullWidth>
                <InputLabel>Add a new role</InputLabel>
                <Select
                  value={selectedRoleId}
                  label="Add a new role"
                  onChange={(e) => setSelectedRoleId(e.target.value as number | '')}
                  sx={{ borderRadius: '12px' }}
                >
                  {allRoles.map((role) => (
                    <MenuItem key={role.roleId} value={role.roleId} sx={{ fontWeight: 600 }}>
                      {role.roleName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                disableElevation
                disabled={selectedRoleId === '' || assignRole.isPending}
                onClick={handleAssignRole}
                sx={{ borderRadius: '12px', px: 3, fontWeight: 700 }}
              >
                Add
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* ── Directorate section ── */}
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="text.primary" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectorateIcon fontSize="small" sx={{ color: BRAND_NAVY }} />
              Primary Directorate
            </Typography>

            <Stack direction="row" gap={1.5}>
              <FormControl size="small" fullWidth>
                <InputLabel>Select Directorate</InputLabel>
                <Select
                  value={selectedDirectorateId}
                  label="Select Directorate"
                  onChange={handleDirectorateChange}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">
                    <em>None (unassign)</em>
                  </MenuItem>
                  {directorates.map((d) => (
                    <MenuItem key={d.directorateId} value={d.directorateId} sx={{ fontWeight: 600 }}>
                      {d.nameEn}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                disabled={assignDirectorate.isPending}
                onClick={handleAssignDirectorate}
                sx={{ borderRadius: '12px', px: 3, fontWeight: 700, borderColor: BRAND_NAVY, color: BRAND_NAVY }}
              >
                {assignDirectorate.isPending ? '...' : 'Save'}
              </Button>
            </Stack>

            {user.directorate !== null && (
              <Box sx={{ mt: 2, p: 1.5, borderRadius: '12px', bgcolor: alpha(BRAND_NAVY, 0.05), border: '1px solid', borderColor: alpha(BRAND_NAVY, 0.1) }}>
                <Typography variant="caption" fontWeight={700} color={BRAND_NAVY}>
                  CURRENTLY ASSIGNED TO:
                </Typography>
                <Typography variant="body2" fontWeight={800} color="text.primary">
                  {user.directorate?.nameEn ?? ''}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          fullWidth
          variant="contained"
          color="inherit"
          sx={{
            borderRadius: '12px',
            bgcolor: 'action.hover',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: 'action.selected' }
          }}
        >
          Finished
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── UserManagement page ──────────────────────────────────────────────────────

const UserManagement: React.FC = () => {
  const theme = useTheme();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [managingUser, setManagingUser] = useState<AdminUser | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useAdminUsers({
    page: page + 1,
    pageSize,
    search: search.length > 0 ? search : undefined,
    isActive: isActiveFilter,
  });

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const handlePageChange = (_: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <AdminLayout title="Users">
      <Box sx={{ maxWidth: 1200 }}>
        {/* Header + filters */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '24px',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            bgcolor: '#fff',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            gap={3}
          >
            <Box>
              <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ letterSpacing: -0.5, mb: 0.5 }}>
                User Management
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <Chip
                  label={data !== undefined ? `${data.total} users` : '...'}
                  size="small"
                  sx={{ bgcolor: alpha(BRAND_NAVY, 0.1), color: BRAND_NAVY, fontWeight: 800, borderRadius: '6px' }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  System-wide user accounts
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" gap={2} flexWrap="wrap" sx={{ width: { xs: '100%', md: 'auto' } }}>
              <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: { xs: 1, md: 'none' } }}>
                <TextField
                  size="small"
                  placeholder="Find user..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="disabled" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '12px', bgcolor: 'action.hover', border: 'none', '& fieldset': { border: 'none' } }
                  }}
                  sx={{ width: { xs: '100%', md: 280 } }}
                />
              </Box>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={isActiveFilter === undefined ? '' : String(isActiveFilter)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIsActiveFilter(val === '' ? undefined : val === 'true');
                    setPage(0);
                  }}
                  displayEmpty
                  startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                  sx={{ borderRadius: '12px', bgcolor: 'action.hover', '& fieldset': { border: 'none' } }}
                >
                  <MenuItem value="" sx={{ fontWeight: 600 }}>All Status</MenuItem>
                  <MenuItem value="true" sx={{ fontWeight: 600 }}>Active Only</MenuItem>
                  <MenuItem value="false" sx={{ fontWeight: 600 }}>Inactive</MenuItem>
                </Select>
              </FormControl>

              <IconButton
                onClick={() => void refetch()}
                disabled={isFetching}
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: '12px',
                  width: 40,
                  height: 40,
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                {isFetching ? <CircularProgress size={20} thickness={6} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </Stack>
          </Stack>
        </Paper>

        {/* Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            bgcolor: '#fff',
            overflow: 'hidden',
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
              <CircularProgress thickness={5} />
            </Box>
          ) : isError ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mx: 'auto', mb: 2 }}>!</Avatar>
              <Typography fontWeight={700}>Unable to load users</Typography>
              <Button onClick={() => void refetch()} variant="text" sx={{ mt: 1 }}>Retry</Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.divider, 0.02) }}>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', py: 2.5 }}>User Info</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', py: 2.5 }}>Directorate</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', py: 2.5 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', py: 2.5 }}>Last Login</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', py: 2.5 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!Array.isArray(data?.items) || data.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                          <Typography color="text.secondary" fontWeight={600}>No users matching your criteria.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.items.map((user) => (
                        <TableRow
                          key={user.userId}
                          hover
                          sx={{
                            '&:hover': { bgcolor: alpha(BRAND_ACCENT, 0.02) },
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          <TableCell sx={{ py: 2.5 }}>
                            <Stack direction="row" alignItems="center" gap={2}>
                              <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(BRAND_NAVY, 0.1), color: BRAND_NAVY, fontWeight: 800, fontSize: 15 }}>
                                {user.fullNameEn.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={800} color="text.primary">
                                  {user.fullNameEn}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  {user.email}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <DirectorateIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                              <Typography variant="body2" fontWeight={600} color="text.primary">
                                {user.directorate?.nameEn ?? <Typography component="span" variant="caption" sx={{ fontStyle: 'italic', opacity: 0.5 }}>Unassigned</Typography>}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              sx={{
                                height: 24,
                                fontWeight: 800,
                                fontSize: 11,
                                borderRadius: '6px',
                                bgcolor: user.isActive ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                color: user.isActive ? 'success.main' : 'error.main',
                                border: 'none'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Manage User">
                              <IconButton
                                size="small"
                                onClick={() => setManagingUser(user)}
                                sx={{
                                  bgcolor: alpha(BRAND_ACCENT, 0.1),
                                  color: BRAND_ACCENT,
                                  '&:hover': { bgcolor: BRAND_ACCENT, color: '#fff' }
                                }}
                              >
                                <ManageIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={data?.total ?? 0}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={pageSize}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[10, 20, 50]}
                sx={{
                  borderTop: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.05),
                  '.MuiTablePagination-toolbar': { minHeight: 64 }
                }}
              />
            </>
          )}
        </Paper>
      </Box>

      {/* Manage user dialog */}
      {managingUser !== null && (
        <ManageUserDialog
          user={managingUser}
          onClose={() => setManagingUser(null)}
        />
      )}
    </AdminLayout>
  );
};

export default UserManagement;
