'use client';

import { useState, useEffect } from 'react';

export default function RolesPermissionPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [rolePerms, setRolePerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchRolesData = () => {
    setLoading(true);
    fetch('/api/roles')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRoles(data.roles || []);
          setPermissions(data.all_permissions || []);
          if (!selectedRoleId && data.roles && data.roles.length > 0) {
            setSelectedRoleId(data.roles[0].id);
            setRolePerms(data.roles[0].permissions || []);
          } else if (selectedRoleId) {
            const found = data.roles.find(r => r.id === selectedRoleId);
            if (found) setRolePerms(found.permissions || []);
          }
        }
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  const handleSelectRole = (role) => {
    setSelectedRoleId(role.id);
    setRolePerms(role.permissions || []);
    setMessage(null);
  };

  const handleTogglePermission = (permissionId) => {
    if (rolePerms.includes(permissionId)) {
      setRolePerms(rolePerms.filter(id => id !== permissionId));
    } else {
      setRolePerms([...rolePerms, permissionId]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_id: selectedRoleId,
          permission_ids: rolePerms
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✔ Đã lưu cấu hình phân quyền thành công vào cơ sở dữ liệu!');
        fetchRolesData();
      } else {
        alert(data.message || 'Lỗi khi lưu phân quyền');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, p) => {
    acc[p.module] = acc[p.module] || [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const currentRole = roles.find(r => r.id === selectedRoleId);

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <h3 className="fw-bold mb-1 text-primary">
            <i className="bi bi-shield-check me-2"></i>Ma Trận Phân Quyền Hệ Thống (RBAC)
          </h3>
          <p className="text-muted mb-0">
            Thiết lập chi tiết quyền hạn cho từng vai trò người dùng (Admin, Manager, Nhân viên).
          </p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Roles List */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3 fw-bold text-dark">
              <i className="bi bi-person-badge-fill text-primary me-2"></i>
              Danh Sách Vai Trò
            </div>
            <div className="list-group list-group-flush">
              {roles.map(r => (
                <button
                  key={r.id}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 ${selectedRoleId === r.id ? 'active' : ''}`}
                  onClick={() => handleSelectRole(r)}
                >
                  <div>
                    <div className="fw-bold">{r.name}</div>
                    <small className={`${selectedRoleId === r.id ? 'text-white-50' : 'text-muted'}`}>
                      Mã: <code>{r.code}</code>
                    </small>
                  </div>
                  <span className={`badge ${selectedRoleId === r.id ? 'bg-light text-primary' : 'bg-primary'}`}>
                    {r.permissions?.length || 0} quyền
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="col-12 col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <span className="fw-bold text-dark">Quyền Hạn Cho Vai Trò: </span>
                <span className="badge bg-primary fs-6 ms-1">{currentRole?.name}</span>
              </div>
              <button
                type="button"
                className="btn btn-success d-flex align-items-center gap-1 shadow-sm"
                onClick={handleSavePermissions}
                disabled={saving}
              >
                {saving ? (
                  <span className="spinner-border spinner-border-sm me-1"></span>
                ) : (
                  <i className="bi bi-floppy-fill me-1"></i>
                )}
                Lưu Thay Đổi
              </button>
            </div>

            <div className="card-body p-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : (
                Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                  <div key={moduleName} className="mb-4">
                    <h6 className="fw-bold text-primary text-uppercase border-bottom pb-2">
                      <i className="bi bi-folder-fill me-2"></i>Phân Hệ: {moduleName}
                    </h6>
                    <div className="row g-2 mt-1">
                      {perms.map(p => {
                        const isChecked = rolePerms.includes(p.id);
                        return (
                          <div key={p.id} className="col-12 col-sm-6">
                            <div className={`p-2 border rounded d-flex align-items-center gap-2 ${isChecked ? 'bg-primary bg-opacity-10 border-primary' : 'bg-light'}`}>
                              <input
                                className="form-check-input mt-0"
                                type="checkbox"
                                id={`perm_${p.id}`}
                                checked={isChecked}
                                onChange={() => handleTogglePermission(p.id)}
                              />
                              <label className="form-check-label small cursor-pointer flex-grow-1" htmlFor={`perm_${p.id}`}>
                                <div className="fw-bold text-dark">{p.name}</div>
                                <code className="text-muted" style={{ fontSize: '0.7rem' }}>{p.code}</code>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
