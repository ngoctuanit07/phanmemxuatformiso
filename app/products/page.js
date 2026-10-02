'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // New product form
  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    category_id: '',
    unit: 'Cái',
    price: '',
    description: '',
    status: 'active'
  });

  const fetchProducts = () => {
    setLoading(true);
    let url = `/api/products?status=${selectedStatus}&`;
    if (selectedCategory) url += `category_id=${selectedCategory}&`;
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.products || []);
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
    fetchProducts();
  }, [selectedCategory, selectedStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.code || !newProduct.name) {
      alert('Vui lòng nhập đầy đủ Mã code và Tên sản phẩm');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (data.success) {
        alert('Thêm sản phẩm mới thành công!');
        setShowAddModal(false);
        setNewProduct({
          code: '',
          name: '',
          category_id: '',
          unit: 'Cái',
          price: '',
          description: '',
          status: 'active'
        });
        fetchProducts();
      } else {
        alert(data.message || 'Lỗi khi thêm sản phẩm');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!currentProduct) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${currentProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProduct)
      });
      const data = await res.json();
      if (data.success) {
        alert('Cập nhật sản phẩm thành công!');
        setShowEditModal(false);
        fetchProducts();
      } else {
        alert(data.message || 'Lỗi cập nhật');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm [${product.code}] ${product.name}?`)) return;
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Đã xóa sản phẩm thành công');
        fetchProducts();
      } else {
        alert(data.message || 'Lỗi khi xóa sản phẩm');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
  };

  const autoGenerateCode = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    setNewProduct(prev => ({ ...prev, code: `SP-${rand}` }));
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <h3 className="fw-bold mb-1 text-primary">
            <i className="bi bi-box-seam-fill me-2"></i>Quản Lý Sản Phẩm & Hàng Hóa
          </h3>
          <p className="text-muted mb-0">
            Quản lý danh mục mã code, tên sản phẩm, đơn vị tính và giá cả để liên kết nạp vào biểu mẫu xuất form.
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <Link href="/product-categories" className="btn btn-outline-primary d-flex align-items-center gap-1">
            <i className="bi bi-tags"></i> Danh Mục Sản Phẩm
          </Link>
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-1 shadow-sm"
            onClick={() => {
              autoGenerateCode();
              setShowAddModal(true);
            }}
          >
            <i className="bi bi-plus-circle-fill"></i> Thêm Sản Phẩm Mới
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4">
          <div className="card shadow-sm border-0 border-start border-4 border-primary">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase">Tổng Sản Phẩm</small>
                <h4 className="fw-bold text-dark my-1">{products.length}</h4>
                <small className="text-primary"><i className="bi bi-boxes me-1"></i>Trong kho dữ liệu</small>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <i className="bi bi-box-seam fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="card shadow-sm border-0 border-start border-4 border-success">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase">Đang Hoạt Động</small>
                <h4 className="fw-bold text-success my-1">
                  {products.filter(p => p.status === 'active').length}
                </h4>
                <small className="text-muted"><i className="bi bi-check-circle me-1"></i>Sẵn sàng xuất form</small>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <i className="bi bi-check2-circle fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-4">
          <div className="card shadow-sm border-0 border-start border-4 border-info">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase">Nhóm Danh Mục</small>
                <h4 className="fw-bold text-info my-1">{categories.length}</h4>
                <small className="text-muted"><i className="bi bi-tags me-1"></i>Phân loại chuẩn</small>
              </div>
              <div className="p-3 bg-info bg-opacity-10 text-info rounded-circle">
                <i className="bi bi-tag fs-3"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body py-3">
          <form onSubmit={handleSearch} className="row g-3 align-items-center">
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm theo Mã code, Tên sản phẩm, Mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-3">
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">-- Tất cả danh mục --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-2">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang kinh doanh</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>

            <div className="col-12 col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-outline-primary flex-grow-1">
                Lọc
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => { setSearchTerm(''); setSelectedCategory(''); setSelectedStatus('all'); }}
              >
                Đặt lại
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Products Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="bi bi-boxes text-primary"></i>
            Danh Sách Sản Phẩm ({products.length} sản phẩm)
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Mã Code</th>
                  <th style={{ width: '33%' }}>Tên Sản Phẩm</th>
                  <th style={{ width: '17%' }}>Danh Mục</th>
                  <th style={{ width: '10%' }}>ĐVT</th>
                  <th style={{ width: '12%' }}>Đơn Giá (VNĐ)</th>
                  <th style={{ width: '8%' }}>Trạng Thái</th>
                  <th style={{ width: '5%' }} className="text-end">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                      Đang tải danh sách sản phẩm...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-box-seam fs-1 text-secondary d-block mb-2"></i>
                      Không tìm thấy sản phẩm nào. Hãy bấm &quot;Thêm Sản Phẩm Mới&quot; ở trên.
                    </td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace fs-7">
                          {p.code}
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{p.name}</div>
                        {p.description && (
                          <small className="text-muted d-block text-truncate" style={{ maxWidth: '380px' }}>
                            {p.description}
                          </small>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {p.category_name || 'Chung'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-dark">
                          {p.unit || 'Cái'}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold text-dark">
                          {Number(p.price || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {p.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <Link
                            href={`/orders?create_product_id=${p.id}&create_product_code=${encodeURIComponent(p.code)}&create_product_name=${encodeURIComponent(p.name)}&create_product_price=${p.price}&create_product_unit=${encodeURIComponent(p.unit || 'Cái')}`}
                            className="btn btn-outline-danger"
                            title="Tạo đơn hàng nhanh cho sản phẩm này"
                          >
                            <i className="bi bi-cart-plus"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setCurrentProduct(p);
                              setShowEditModal(true);
                            }}
                            title="Sửa thông tin sản phẩm"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteProduct(p)}
                            title="Xóa sản phẩm"
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <form onSubmit={handleCreateProduct}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-box-seam-fill"></i>
                    Thêm Sản Phẩm Mới
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-5">
                      <label className="form-label fw-semibold">Mã Code Sản Phẩm <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control font-monospace text-uppercase fw-bold text-primary"
                          placeholder="Ví dụ: SP-IT-001"
                          value={newProduct.code}
                          onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
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
                      <small className="text-muted">Mã định danh duy nhất cho sản phẩm.</small>
                    </div>

                    <div className="col-12 col-md-7">
                      <label className="form-label fw-semibold">Tên Sản Phẩm <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control fw-semibold"
                        placeholder="Ví dụ: Laptop Dell Latitude 7420..."
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Danh Mục Sản Phẩm</label>
                      <select
                        className="form-select"
                        value={newProduct.category_id}
                        onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">Đơn Vị Tính</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Cái, Bộ, Chiếc, Thùng..."
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">Đơn Giá Tham Khảo</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="0"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Mô Tả / Quy Cách Kỹ Thuật</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Nhập cấu hình, thông số, ghi chú bảo hành..."
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Trạng Thái</label>
                      <select
                        className="form-select"
                        value={newProduct.status}
                        onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                      >
                        <option value="active">Hoạt động (Active)</option>
                        <option value="inactive">Tạm ngưng (Inactive)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu Sản Phẩm Vào Hệ Thống'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && currentProduct && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <form onSubmit={handleUpdateProduct}>
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title fw-bold">Chỉnh Sửa Sản Phẩm: [{currentProduct.code}]</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-5">
                      <label className="form-label fw-semibold">Mã Code Sản Phẩm <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control font-monospace text-uppercase fw-bold text-primary"
                        value={currentProduct.code}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, code: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-7">
                      <label className="form-label fw-semibold">Tên Sản Phẩm <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control fw-semibold"
                        value={currentProduct.name}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Danh Mục Sản Phẩm</label>
                      <select
                        className="form-select"
                        value={currentProduct.category_id || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, category_id: e.target.value })}
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">Đơn Vị Tính</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentProduct.unit || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, unit: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">Đơn Giá Tham Khảo</label>
                      <input
                        type="number"
                        className="form-control"
                        value={currentProduct.price || 0}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Mô Tả / Quy Cách</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={currentProduct.description || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Trạng Thái</label>
                      <select
                        className="form-select"
                        value={currentProduct.status}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, status: e.target.value })}
                      >
                        <option value="active">Hoạt động (Active)</option>
                        <option value="inactive">Tạm ngưng (Inactive)</option>
                      </select>
                    </div>
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
