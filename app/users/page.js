'use client';

import { useState, useEffect } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // User Module Permission modal state
  const [permUserData, setPermUserData] = useState(null);
  const [selectedPermIds, setSelectedPermIds] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    department: '',
    role_id: 3,
    status: 'active'
  });

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users || []);
          setRoles(data.roles || []);
        }
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by search term and role
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRoleFilter ? String(u.role_id) === String(selectedRoleFilter) : true;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        alert('Tạo người dùng mới thành công!');
        setShowAddModal(false);
        setNewUser({
          username: '',
          password: '',
          full_name: '',
          email: '',
          phone: '',
          department: '',
          role_id: 3,
          status: 'active'
        });
        fetchUsers();
      } else {
        alert(data.message || 'Lỗi tạo người dùng');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentUser)
      });
      const data = await res.json();
      if (data.success) {
        alert('Cập nhật người dùng thành công!');
        setShowEditModal(false);
        fetchUsers();
      } else {
        alert(data.message || 'Lỗi cập nhật');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản @${user.username} (${user.full_name})?`)) return;
    try {
      const res = await fetch(`/api/users?id=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Đã xóa người dùng thành công');
        fetchUsers();
      } else {
        alert(data.message || 'Lỗi xóa người dùng');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
  };

  // Open Permission Modal for a specific user
  const handleOpenPermModal = async (user) => {
    setCurrentUser(user);
    setShowPermModal(true);
    setLoadingPerms(true);
    try {
      const res = await fetch(`/api/users/${user.id}/permissions`);
      const data = await res.json();
      if (data.success) {
        setPermUserData(data);
        setSelectedPermIds(data.user_permission_ids || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPerms(false);
    }
  };

  const handleToggleUserPermission = (permId) => {
    if (selectedPermIds.includes(permId)) {
      setSelectedPermIds(selectedPermIds.filter(id => id !== permId));
    } else {
      setSelectedPermIds([...selectedPermIds, permId]);
    }
  };

  const handleSaveUserPermissions = async () => {
    if (!currentUser) return;
    setSavingPerms(true);
    try {
      const res = await fetch(`/api/users/${currentUser.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission_ids: selectedPermIds })
      });
      const data = await res.json();
      if (data.success) {
        alert('Đã cập nhật phân quyền module cho người dùng thành công!');
        setShowPermModal(false);
      } else {
        alert(data.message || 'Lỗi khi lưu phân quyền');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setSavingPerms(false);
    }
  };

  // Group permissions by module
  const groupedPerms = permUserData?.all_permissions
    ? permUserData.all_permissions.reduce((acc, p) => {
        acc[p.module] = acc[p.module] || [];
        acc[p.module].push(p);
        return acc;
      }, {})
    : {};

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <h3 className="fw-bold mb-1 text-primary">
            <i className="bi bi-people me-2"></i>Quản Lý Người Dùng & Phân Quyền Module
          </h3>
          <p className="text-muted mb-0">
            Quản trị danh sách nhân sự, vai trò hệ thống và phân quyền truy cập chi tiết vào từng module chức năng.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-1 shadow-sm"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-person-plus-fill"></i> Thêm Người Dùng Mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body py-3">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm theo tên đăng nhập, họ tên, email, phòng ban..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
              >
                <option value="">-- Lọc theo tất cả vai trò --</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-2 text-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => { setSearchTerm(''); setSelectedRoleFilter(''); }}
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="bi bi-shield-lock text-primary"></i>
            Danh Sách Người Dùng ({filteredUsers.length} tài khoản)
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Tài Khoản & Email</th>
                  <th style={{ width: '20%' }}>Họ Và Tên</th>
                  <th style={{ width: '18%' }}>Phòng Ban</th>
                  <th style={{ width: '15%' }}>Vai Trò Hệ Thống</th>
                  <th style={{ width: '10%' }}>Trạng Thái</th>
                  <th style={{ width: '15%' }} className="text-end">Phân Quyền & Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Đang tải danh sách người dùng...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      Không tìm thấy người dùng phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="fw-bold text-dark">@{u.username}</div>
                        <small className="text-muted">{u.email || 'Chưa có email'}</small>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{u.full_name}</div>
                        <small className="text-muted">{u.phone || ''}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {u.department || 'Chung'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.role_code === 'ADMIN' ? 'bg-danger' : u.role_code === 'MANAGER' ? 'bg-primary' : 'bg-info text-dark'}`}>
                          {u.role_name}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {u.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => handleOpenPermModal(u)}
                            title="Phân quyền module riêng cho người dùng này"
                          >
                            <i className="bi bi-shield-check me-1"></i> Quyền Module
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setCurrentUser(u);
                              setShowEditModal(true);
                            }}
                            title="Sửa thông tin"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          {u.username !== 'admin' && (
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteUser(u)}
                              title="Xóa người dùng"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Module Permissions Modal for Specific User */}
      {showPermModal && currentUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white">
                <div>
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-shield-check"></i>
                    Phân Quyền Module Cho: {currentUser.full_name} (@{currentUser.username})
                  </h5>
                  <small className="text-white-50">
                    Vai trò hiện tại: <strong>{currentUser.role_name} ({currentUser.role_code})</strong>
                  </small>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPermModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                {loadingPerms ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <div className="text-muted mt-2">Đang tải danh mục quyền hạn module...</div>
                  </div>
                ) : (
                  <div>
                    <div className="alert alert-info py-2 small mb-4 d-flex align-items-center gap-2">
                      <i className="bi bi-info-circle-fill fs-5"></i>
                      <div>
                        Quyền hạn có huy hiệu <span className="badge bg-secondary">Từ vai trò</span> là quyền mà người dùng đã tự động có được theo vai trò hiện tại. Bạn có thể cấp thêm quyền trực tiếp bằng cách tích chọn bên dưới.
                      </div>
                    </div>

                    {Object.entries(groupedPerms).map(([moduleName, perms]) => (
                      <div key={moduleName} className="mb-4">
                        <h6 className="fw-bold text-primary text-uppercase border-bottom pb-2 d-flex align-items-center gap-2">
                          <i className="bi bi-folder2-open"></i>
                          Phân Hệ / Module: {moduleName}
                        </h6>

                        <div className="row g-2 mt-1">
                          {perms.map(p => {
                            const isInherited = permUserData?.role_permission_ids?.includes(p.id);
                            const isDirect = selectedPermIds.includes(p.id);
                            const hasAccess = isInherited || isDirect || currentUser.role_code === 'ADMIN';

                            return (
                              <div key={p.id} className="col-12 col-md-6">
                                <div className={`p-2 border rounded d-flex align-items-center gap-2 ${hasAccess ? 'bg-primary bg-opacity-10 border-primary' : 'bg-light'}`}>
                                  <input
                                    className="form-check-input mt-0"
                                    type="checkbox"
                                    id={`user_perm_${p.id}`}
                                    checked={hasAccess}
                                    disabled={isInherited || currentUser.role_code === 'ADMIN'}
                                    onChange={() => handleToggleUserPermission(p.id)}
                                  />
                                  <label className="form-check-label small cursor-pointer flex-grow-1" htmlFor={`user_perm_${p.id}`}>
                                    <div className="fw-bold text-dark d-flex justify-content-between align-items-center">
                                      <span>{p.name}</span>
                                      {isInherited ? (
                                        <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>Từ vai trò</span>
                                      ) : isDirect ? (
                                        <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>Cấp riêng</span>
                                      ) : null}
                                    </div>
                                    <code className="text-muted" style={{ fontSize: '0.7rem' }}>{p.code}</code>
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPermModal(false)}>
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn btn-success fw-bold d-flex align-items-center gap-1 shadow-sm"
                  onClick={handleSaveUserPermissions}
                  disabled={savingPerms || loadingPerms}
                >
                  {savingPerms ? (
                    <span className="spinner-border spinner-border-sm me-1"></span>
                  ) : (
                    <i className="bi bi-floppy-fill me-1"></i>
                  )}
                  Lưu Phân Quyền Module
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <form onSubmit={handleCreateUser}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-person-plus-fill"></i>
                    Thêm Người Dùng Mới
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tên đăng nhập <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ví dụ: nguyenvana"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mật khẩu ban đầu <span className="text-danger">*</span></label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Nhập mật khẩu..."
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Họ và tên đầy đủ <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ví dụ: Nguyễn Văn A"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="email@congty.vn"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Số điện thoại</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="0912..."
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Phòng ban / Bộ phận</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ví dụ: Phòng Kế Toán & Vận Hành"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Vai trò ban đầu</label>
                    <select
                      className="form-select"
                      value={newUser.role_id}
                      onChange={(e) => setNewUser({ ...newUser, role_id: parseInt(e.target.value, 10) })}
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary fw-bold">Tạo Tài Khoản</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && currentUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <form onSubmit={handleUpdateUser}>
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">Cập Nhật Người Dùng: @{currentUser.username}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentUser.full_name}
                      onChange={(e) => setCurrentUser({ ...currentUser, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={currentUser.email || ''}
                        onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Số điện thoại</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentUser.phone || ''}
                        onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Phòng ban</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentUser.department || ''}
                      onChange={(e) => setCurrentUser({ ...currentUser, department: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Vai trò phân quyền</label>
                    <select
                      className="form-select"
                      value={currentUser.role_id}
                      onChange={(e) => setCurrentUser({ ...currentUser, role_id: parseInt(e.target.value, 10) })}
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Trạng thái</label>
                    <select
                      className="form-select"
                      value={currentUser.status}
                      onChange={(e) => setCurrentUser({ ...currentUser, status: e.target.value })}
                    >
                      <option value="active">Hoạt động (Active)</option>
                      <option value="inactive">Tạm khóa (Inactive)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Đổi mật khẩu mới (để trống nếu không đổi)</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Mật khẩu mới..."
                      value={currentUser.password || ''}
                      onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary fw-bold">Lưu Thay Đổi</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
