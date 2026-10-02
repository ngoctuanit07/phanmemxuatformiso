'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const [newCategory, setNewCategory] = useState({
    code: '',
    name: '',
    description: '',
    status: 'active'
  });

  const fetchCategories = () => {
    setLoading(true);
    let url = `/api/product-categories?`;
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCategories();
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.code || !newCategory.name) {
      alert('Vui lòng nhập đầy đủ Mã danh mục và Tên danh mục');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/product-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      const data = await res.json();
      if (data.success) {
        alert('Tạo danh mục mới thành công!');
        setShowAddModal(false);
        setNewCategory({ code: '', name: '', description: '', status: 'active' });
        fetchCategories();
      } else {
        alert(data.message || 'Lỗi khi tạo danh mục');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!currentCategory) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/product-categories/${currentCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentCategory)
      });
      const data = await res.json();
      if (data.success) {
        alert('Cập nhật danh mục thành công!');
        setShowEditModal(false);
        fetchCategories();
      } else {
        alert(data.message || 'Lỗi cập nhật');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục [${cat.code}] ${cat.name}?`)) return;
    try {
      const res = await fetch(`/api/product-categories/${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Đã xóa danh mục thành công');
        fetchCategories();
      } else {
        alert(data.message || 'Lỗi khi xóa danh mục');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
  };

  const autoGenerateCode = () => {
    const rand = Math.floor(10 + Math.random() * 90);
    setNewCategory(prev => ({ ...prev, code: `CAT-${rand}` }));
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <h3 className="fw-bold mb-1 text-primary">
            <i className="bi bi-tags-fill me-2"></i>Danh Mục Sản Phẩm
          </h3>
          <p className="text-muted mb-0">
            Phân loại hàng hóa, nhóm sản phẩm và vật tư trong hệ thống xuất biểu mẫu.
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <Link href="/products" className="btn btn-outline-secondary d-flex align-items-center gap-1">
            <i className="bi bi-box-seam"></i> Xem Danh Sách Sản Phẩm
          </Link>
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-1 shadow-sm"
            onClick={() => {
              autoGenerateCode();
              setShowAddModal(true);
            }}
          >
            <i className="bi bi-plus-circle-fill"></i> Thêm Danh Mục Mới
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body py-3">
          <form onSubmit={handleSearch} className="row g-3 align-items-center">
            <div className="col-12 col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm theo Mã danh mục, Tên danh mục, Mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-4 d-flex gap-2">
              <button type="submit" className="btn btn-outline-primary flex-grow-1">
                Tìm kiếm
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => { setSearchTerm(''); fetchCategories(); }}
              >
                Đặt lại
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Categories Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="bi bi-tag text-primary"></i>
            Danh Sách Danh Mục ({categories.length} danh mục)
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Mã Danh Mục</th>
                  <th style={{ width: '30%' }}>Tên Danh Mục</th>
                  <th style={{ width: '30%' }}>Mô Tả Nhóm</th>
                  <th style={{ width: '12%' }}>Số Sản Phẩm</th>
                  <th style={{ width: '8%' }}>Trạng Thái</th>
                  <th style={{ width: '5%' }} className="text-end">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Đang tải danh mục...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      Chưa có danh mục nào. Hãy bấm &quot;Thêm Danh Mục Mới&quot; ở trên.
                    </td>
                  </tr>
                ) : (
                  categories.map(c => (
                    <tr key={c.id}>
                      <td>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace fs-7">
                          {c.code}
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{c.name}</div>
                      </td>
                      <td>
                        <small className="text-muted">{c.description || 'Không có mô tả'}</small>
                      </td>
                      <td>
                        <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                          <i className="bi bi-box-seam me-1"></i>{c.products_count || 0} sản phẩm
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${c.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {c.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setCurrentCategory(c);
                              setShowEditModal(true);
                            }}
                            title="Sửa danh mục"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteCategory(c)}
                            title="Xóa danh mục"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
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

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <form onSubmit={handleCreateCategory}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-tags-fill"></i>
                    Thêm Danh Mục Mới
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mã Danh Mục <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control font-monospace text-uppercase fw-bold text-primary"
                        placeholder="Ví dụ: CAT-IT"
                        value={newCategory.code}
                        onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={autoGenerateCode}
                        title="Tự động sinh mã"
                      >
                        <i className="bi bi-magic"></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tên Danh Mục <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control fw-semibold"
                      placeholder="Ví dụ: Thiết Bị CNTT & Văn Phòng"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mô Tả Nhóm Hàng Hóa</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Ghi chú về các loại mặt hàng thuộc nhóm này..."
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu Danh Mục'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && currentCategory && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <form onSubmit={handleUpdateCategory}>
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">Chỉnh Sửa Danh Mục: [{currentCategory.code}]</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mã Danh Mục <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control font-monospace text-uppercase fw-bold text-primary"
                      value={currentCategory.code}
                      onChange={(e) => setCurrentCategory({ ...currentCategory, code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tên Danh Mục <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control fw-semibold"
                      value={currentCategory.name}
                      onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mô Tả</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={currentCategory.description || ''}
                      onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Trạng Thái</label>
                    <select
                      className="form-select"
                      value={currentCategory.status}
                      onChange={(e) => setCurrentCategory({ ...currentCategory, status: e.target.value })}
                    >
                      <option value="active">Hoạt động (Active)</option>
                      <option value="inactive">Tạm ngưng (Inactive)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
