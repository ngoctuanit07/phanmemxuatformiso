'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function OrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal Create Order State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Form Fields for Create Order
  const [formProductName, setFormProductName] = useState('');
  const [formQuantity, setFormQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNote, setFormNote] = useState('');

  // Autocomplete Products State
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const quantityInputRef = useRef(null);

  // Modal View / Edit Details
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);

  // Fetch Orders
  const fetchOrders = () => {
    setLoading(true);
    let url = `/api/orders?status=${selectedStatus}&`;
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders || []);
          setStats(data.stats || {});
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  // Check URL params for quick order creation
  useEffect(() => {
    const prodName = searchParams.get('create_product_name');
    const prodCode = searchParams.get('create_product_code');
    const prodId = searchParams.get('create_product_id');
    const prodPrice = searchParams.get('create_product_price');
    const prodUnit = searchParams.get('create_product_unit');

    if (prodName) {
      const decodedName = decodeURIComponent(prodName);
      setFormProductName(decodedName);
      if (prodCode) {
        setSelectedProduct({
          id: prodId ? parseInt(prodId, 10) : null,
          code: prodCode,
          name: decodedName,
          price: prodPrice ? parseFloat(prodPrice) : 0,
          unit: prodUnit || 'Cái'
        });
      }
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  // Autocomplete search when user types product name
  useEffect(() => {
    if (!formProductName || formProductName.trim().length === 0) {
      setAutocompleteSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Debounce 250ms
    const timer = setTimeout(() => {
      setIsSearchingProduct(true);
      fetch(`/api/products?search=${encodeURIComponent(formProductName.trim())}&status=active`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.products) {
            setAutocompleteSuggestions(data.products);
            setShowDropdown(data.products.length > 0);
          } else {
            setAutocompleteSuggestions([]);
            setShowDropdown(false);
          }
          setIsSearchingProduct(false);
        })
        .catch(err => {
          console.error(err);
          setIsSearchingProduct(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [formProductName]);

  // Click outside to close autocomplete dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When user clicks a product in autocomplete dropdown
  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    setFormProductName(prod.name);
    setShowDropdown(false);

    // Auto-focus quantity input after choosing product
    setTimeout(() => {
      if (quantityInputRef.current) {
        quantityInputRef.current.focus();
        quantityInputRef.current.select();
      }
    }, 150);
  };

  // Reset Create Form
  const resetForm = () => {
    setFormProductName('');
    setFormQuantity(1);
    setSelectedProduct(null);
    setFormCustomerName('');
    setFormPhone('');
    setFormNote('');
    setShowDropdown(false);
    setAlertMsg(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Submit Create Order
  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!formProductName.trim()) {
      setAlertMsg({ type: 'danger', message: 'Vui lòng nhập tên sản phẩm' });
      return;
    }

    const qty = parseInt(formQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setAlertMsg({ type: 'danger', message: 'Số lượng sản phẩm phải lớn hơn 0' });
      return;
    }

    setSaving(true);
    setAlertMsg(null);

    const payload = {
      product_name: formProductName.trim(),
      quantity: qty,
      product_id: selectedProduct?.id || null,
      product_code: selectedProduct?.code || null,
      unit: selectedProduct?.unit || 'Cái',
      unit_price: selectedProduct ? parseFloat(selectedProduct.price) : 0,
      total_amount: selectedProduct ? parseFloat(selectedProduct.price) * qty : 0,
      customer_name: formCustomerName.trim() || null,
      phone: formPhone.trim() || null,
      note: formNote.trim() || null,
      status: 'pending'
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setShowCreateModal(false);
        fetchOrders();
        alert(`✔ Tạo đơn hàng thành công! Mã đơn: ${data.order?.order_code}`);
      } else {
        setAlertMsg({ type: 'danger', message: data.message || 'Lỗi khi tạo đơn hàng' });
      }
    } catch (err) {
      setAlertMsg({ type: 'danger', message: 'Lỗi máy chủ: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  // Update order status or quantity
  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!currentOrder) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          quantity: parseInt(editQuantity, 10),
          customer_name: currentOrder.customer_name,
          phone: currentOrder.phone,
          note: currentOrder.note
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowDetailModal(false);
        fetchOrders();
      } else {
        alert(data.message || 'Lỗi cập nhật');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (id, code) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn hàng [${code}] không?`)) return;

    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'Không thể xóa đơn hàng');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Status badge helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning text-dark"><i className="bi bi-hourglass-split me-1"></i>Chờ Xử Lý</span>;
      case 'confirmed':
        return <span className="badge bg-primary"><i className="bi bi-check-circle me-1"></i>Đã Xác Nhận</span>;
      case 'shipping':
        return <span className="badge bg-info text-dark"><i className="bi bi-truck me-1"></i>Đang Giao</span>;
      case 'completed':
        return <span className="badge bg-success"><i className="bi bi-patch-check-fill me-1"></i>Hoàn Tất</span>;
      case 'cancelled':
        return <span className="badge bg-danger"><i className="bi bi-x-circle me-1"></i>Đã Hủy</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Direct print order receipt
  const printOrderSlip = (ord) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Trình duyệt đã chặn cửa sổ in pop-up. Vui lòng cho phép pop-up để in phiếu!');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Phiếu Đơn Hàng - ${ord.order_code}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #212529; }
          .header { text-align: center; border-bottom: 2px solid #0d6efd; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #0d6efd; margin-bottom: 5px; text-transform: uppercase; }
          .sub { font-size: 13px; color: #6c757d; }
          .meta-table { width: 100%; margin-bottom: 25px; border-collapse: collapse; }
          .meta-table td { padding: 6px 10px; font-size: 14px; }
          .meta-table .label { font-weight: bold; width: 180px; color: #495057; }
          .item-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          .item-table th, .item-table td { border: 1px solid #dee2e6; padding: 12px; font-size: 14px; }
          .item-table th { background-color: #f8f9fa; font-weight: bold; text-align: left; }
          .total-box { text-align: right; margin-top: 15px; font-size: 18px; font-weight: bold; color: #dc3545; }
          .signatures { display: flex; justify-content: space-between; margin-top: 60px; text-align: center; }
          .sig-block { width: 45%; }
          .sig-title { font-weight: bold; margin-bottom: 70px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">PHIẾU ĐƠN ĐẶT HÀNG</div>
          <div class="sub">Hệ Thống Xuất Form ISO &amp; Quản Lý Kho Đơn Hàng</div>
          <div style="margin-top: 5px; font-weight: bold;">Mã Đơn: ${ord.order_code}</div>
        </div>

        <table class="meta-table">
          <tr>
            <td class="label">Ngày Tạo Đơn:</td>
            <td>${new Date(ord.created_at).toLocaleString('vi-VN')}</td>
            <td class="label">Trạng Thái:</td>
            <td><strong>${ord.status.toUpperCase()}</strong></td>
          </tr>
          <tr>
            <td class="label">Khách Hàng / Đơn Vị:</td>
            <td>${ord.customer_name || 'Khách vãng lai'}</td>
            <td class="label">Số Điện Thoại:</td>
            <td>${ord.phone || 'Chưa cập nhật'}</td>
          </tr>
          <tr>
            <td class="label">Người Tạo Đơn:</td>
            <td>${ord.created_by_name || 'Hệ thống'}</td>
            <td class="label">Ghi Chú:</td>
            <td>${ord.note || 'Không có ghi chú'}</td>
          </tr>
        </table>

        <table class="item-table">
          <thead>
            <tr>
              <th style="width: 50px;">STT</th>
              <th style="width: 140px;">Mã Sản Phẩm</th>
              <th>Tên Sản Phẩm Hàng Hóa</th>
              <th style="width: 70px; text-align: center;">ĐVT</th>
              <th style="width: 90px; text-align: center;">Số Lượng</th>
              <th style="width: 130px; text-align: right;">Đơn Giá</th>
              <th style="width: 140px; text-align: right;">Thành Tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center;">1</td>
              <td><strong>${ord.product_code}</strong></td>
              <td><strong>${ord.product_name}</strong></td>
              <td style="text-align: center;">${ord.unit || 'Cái'}</td>
              <td style="text-align: center; font-weight: bold; font-size: 16px;">${ord.quantity}</td>
              <td style="text-align: right;">${Number(ord.unit_price || 0).toLocaleString('vi-VN')} đ</td>
              <td style="text-align: right; font-weight: bold;">${Number(ord.total_amount || 0).toLocaleString('vi-VN')} đ</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          TỔNG GIÁ TRỊ ĐƠN HÀNG: ${Number(ord.total_amount || 0).toLocaleString('vi-VN')} VNĐ
        </div>

        <div class="signatures">
          <div class="sig-block">
            <div class="sig-title">Người Lập Phiếu</div>
            <div>(Ký và ghi rõ họ tên)</div>
          </div>
          <div class="sig-block">
            <div class="sig-title">Người Nhận Hàng / Khách Hàng</div>
            <div>(Ký và ghi rõ họ tên)</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-cart3 text-danger"></i>
            Quản Lý Đơn Hàng (Orders)
          </h2>
          <p className="text-muted mb-0">
            Tạo mới đơn hàng với tính năng <strong>autocomplete gợi ý sản phẩm</strong> và in phiếu cục bộ.
          </p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button
            type="button"
            className="btn btn-danger btn-lg shadow-sm d-flex align-items-center gap-2 px-4"
            onClick={openCreateModal}
          >
            <i className="bi bi-plus-circle-fill fs-5"></i>
            <span className="fw-bold">Tạo Order Mới</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-danger border-4 h-100">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-bold">Tổng Đơn Hàng</div>
                  <div className="fs-3 fw-bold text-dark">{stats.total_orders || 0}</div>
                </div>
                <div className="p-3 bg-danger-subtle rounded-circle text-danger">
                  <i className="bi bi-cart-check fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-warning border-4 h-100">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-bold">Chờ Xử Lý</div>
                  <div className="fs-3 fw-bold text-warning">{stats.pending_count || 0}</div>
                </div>
                <div className="p-3 bg-warning-subtle rounded-circle text-warning">
                  <i className="bi bi-hourglass-split fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-primary border-4 h-100">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-bold">Đã Xác Nhận</div>
                  <div className="fs-3 fw-bold text-primary">{stats.confirmed_count || 0}</div>
                </div>
                <div className="p-3 bg-primary-subtle rounded-circle text-primary">
                  <i className="bi bi-check2-circle fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 border-start border-success border-4 h-100">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-bold">Tổng Doanh Số</div>
                  <div className="fs-4 fw-bold text-success">
                    {Number(stats.total_revenue || 0).toLocaleString('vi-VN')} đ
                  </div>
                </div>
                <div className="p-3 bg-success-subtle rounded-circle text-success">
                  <i className="bi bi-cash-stack fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <form onSubmit={handleSearch} className="row g-2 align-items-center">
            <div className="col-12 col-md-6 col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Tìm theo mã code SP, tên sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-3 col-lg-3">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tất Cả Trạng Thái</option>
                <option value="pending">Chờ Xử Lý (Pending)</option>
                <option value="confirmed">Đã Xác Nhận (Confirmed)</option>
                <option value="shipping">Đang Giao Hàng</option>
                <option value="completed">Đã Hoàn Tất (Completed)</option>
                <option value="cancelled">Đã Hủy (Cancelled)</option>
              </select>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <button type="submit" className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-1">
                <i className="bi bi-funnel"></i> Lọc Đơn
              </button>
            </div>

            <div className="col-12 col-lg-2 text-lg-end">
              <span className="text-muted small">
                Hiển thị <strong>{orders.length}</strong> đơn hàng
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Order List Table */}
      <div className="card shadow-sm border-0 mb-5">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="bi bi-table text-primary"></i>
            Danh Sách Đơn Đặt Hàng
          </h5>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={fetchOrders}
            title="Tải lại danh sách"
          >
            <i className="bi bi-arrow-clockwise"></i> Làm mới
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '18%' }}>Mã Code SP</th>
                <th style={{ width: '38%' }}>Tên Sản Phẩm</th>
                <th style={{ width: '14%' }} className="text-center">Số Lượng</th>
                <th style={{ width: '15%' }}>Ngày Tạo</th>
                <th style={{ width: '15%' }} className="text-end">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="text-muted mb-3">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Chưa có đơn hàng nào phù hợp với điều kiện tìm kiếm.
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={openCreateModal}
                    >
                      <i className="bi bi-plus-circle me-1"></i> Tạo Đơn Hàng Đầu Tiên
                    </button>
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace fs-7 px-2 py-1">
                        {ord.product_code}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{ord.product_name}</div>
                      {ord.note && (
                        <small className="text-muted text-truncate d-block" style={{ maxWidth: '350px' }}>
                          <i className="bi bi-chat-left-dots me-1"></i>
                          {ord.note}
                        </small>
                      )}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-secondary-subtle text-dark border px-3 py-1 fs-6 fw-bold">
                        {ord.quantity} {ord.unit || 'Cái'}
                      </span>
                    </td>
                    <td className="text-muted">
                      <div>
                        <i className="bi bi-calendar3 me-1 text-secondary"></i>
                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString('vi-VN') : ''}
                      </div>
                      <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                        {ord.created_at ? new Date(ord.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </small>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                          title="In phiếu đơn hàng (Print Slip)"
                          onClick={() => printOrderSlip(ord)}
                        >
                          <i className="bi bi-printer-fill"></i>
                          <span className="d-none d-md-inline">In</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                          title="Chỉnh sửa / Chi tiết đơn hàng"
                          onClick={() => {
                            setCurrentOrder(ord);
                            setEditStatus(ord.status);
                            setEditQuantity(ord.quantity);
                            setShowDetailModal(true);
                          }}
                        >
                          <i className="bi bi-pencil-square"></i>
                          <span className="d-none d-md-inline">Sửa</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger d-inline-flex align-items-center gap-1"
                          title="Xóa đơn hàng"
                          onClick={() => handleDeleteOrder(ord.id, ord.order_code)}
                        >
                          <i className="bi bi-trash"></i>
                          <span className="d-none d-md-inline">Xóa</span>
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

      {/* ========================================================================= */}
      {/* MODAL TẠO ORDER MỚI - CÓ AUTOCOMPLETE TÌM SẢN PHẨM & NHẬP SỐ LƯỢNG */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-cart-plus-fill fs-4"></i>
                  Tạo Đơn Hàng Mới (New Order)
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateOrder}>
                <div className="modal-body p-4">
                  {alertMsg && (
                    <div className={`alert alert-${alertMsg.type} py-2 mb-3 small`}>
                      {alertMsg.message}
                    </div>
                  )}

                  <div className="alert alert-info py-2 px-3 small mb-4 d-flex align-items-center gap-2">
                    <i className="bi bi-lightning-charge-fill text-warning fs-5"></i>
                    <div>
                      <strong>Tính năng thông minh:</strong> Khi bạn gõ tên sản phẩm, hệ thống tự động tìm kiếm trong kho và hiển thị danh sách gợi ý (autocomplete). Bấm chọn sản phẩm để hệ thống nạp mã code và giá!
                    </div>
                  </div>

                  {/* 1. TÊN SẢN PHẨM WITH AUTOCOMPLETE */}
                  <div className="mb-3 position-relative" ref={dropdownRef}>
                    <label className="form-label fw-bold text-dark d-flex justify-content-between align-items-center">
                      <span>
                        Tên sản phẩm <span className="text-danger">*</span>
                      </span>
                      {selectedProduct && (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Mã SP: {selectedProduct.code}
                        </span>
                      )}
                    </label>

                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white text-muted">
                        {isSearchingProduct ? (
                          <span className="spinner-border spinner-border-sm text-primary"></span>
                        ) : (
                          <i className="bi bi-search"></i>
                        )}
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-lg fw-semibold"
                        placeholder="Gõ tên sản phẩm để tìm kiếm (vd: Laptop, Chuột, Giấy...)"
                        value={formProductName}
                        onChange={(e) => {
                          setFormProductName(e.target.value);
                          if (selectedProduct && e.target.value !== selectedProduct.name) {
                            setSelectedProduct(null); // Clear selected if user edits
                          }
                        }}
                        onFocus={() => {
                          if (autocompleteSuggestions.length > 0) setShowDropdown(true);
                        }}
                        required
                        autoFocus
                        autoComplete="off"
                      />
                      {formProductName && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setFormProductName('');
                            setSelectedProduct(null);
                            setShowDropdown(false);
                          }}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Dropdown Menu */}
                    {showDropdown && autocompleteSuggestions.length > 0 && (
                      <div
                        className="dropdown-menu show w-100 shadow-lg border mt-1 p-0 overflow-auto"
                        style={{
                          maxHeight: '280px',
                          zIndex: 1060,
                          position: 'absolute',
                          top: '100%',
                          left: 0
                        }}
                      >
                        <div className="p-2 bg-light border-bottom text-muted small fw-bold">
                          GỢI Ý TỪ KHO SẢN PHẨM ({autocompleteSuggestions.length} kết quả)
                        </div>
                        {autocompleteSuggestions.map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            className="dropdown-item py-2 px-3 border-bottom text-wrap d-flex justify-content-between align-items-center"
                            onClick={() => handleSelectProduct(prod)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="me-2">
                              <div className="fw-bold text-dark">{prod.name}</div>
                              <div className="small text-muted d-flex gap-2 align-items-center mt-1">
                                <span className="badge bg-primary-subtle text-primary font-monospace">
                                  {prod.code}
                                </span>
                                {prod.category_name && (
                                  <span>{prod.category_name}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold text-danger">
                                {Number(prod.price || 0).toLocaleString('vi-VN')} đ
                              </div>
                              <small className="text-muted">ĐVT: {prod.unit || 'Cái'}</small>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Product Summary Card */}
                  {selectedProduct && (
                    <div className="p-3 mb-3 bg-light rounded border border-primary-subtle d-flex flex-wrap justify-content-between align-items-center">
                      <div>
                        <div className="text-muted small">Mã sản phẩm đã chọn:</div>
                        <div className="font-monospace fw-bold text-primary fs-6">{selectedProduct.code}</div>
                      </div>
                      <div>
                        <div className="text-muted small">Đơn vị tính:</div>
                        <div className="fw-bold text-dark">{selectedProduct.unit || 'Cái'}</div>
                      </div>
                      <div>
                        <div className="text-muted small">Đơn giá niêm yết:</div>
                        <div className="fw-bold text-danger fs-6">
                          {Number(selectedProduct.price || 0).toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. SỐ LƯỢNG (QUANTITY) */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold text-dark">
                        Số lượng <span className="text-danger">*</span>
                      </label>
                      <div className="input-group input-group-lg">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setFormQuantity(prev => Math.max(1, parseInt(prev, 10) - 1))}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <input
                          ref={quantityInputRef}
                          type="number"
                          min="1"
                          className="form-control text-center fw-bold fs-5"
                          value={formQuantity}
                          onChange={(e) => setFormQuantity(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setFormQuantity(prev => (parseInt(prev, 10) || 0) + 1)}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-bold text-dark">
                        Thành tiền tạm tính
                      </label>
                      <div className="p-2 border rounded bg-white text-end d-flex flex-column justify-content-center" style={{ height: '48px' }}>
                        <span className="fs-5 fw-bold text-danger">
                          {selectedProduct
                            ? (parseFloat(selectedProduct.price || 0) * (parseInt(formQuantity, 10) || 0)).toLocaleString('vi-VN') + ' đ'
                            : '0 đ'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. THÔNG TIN BỔ SUNG (KHÁCH HÀNG & GHI CHÚ) */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label text-dark fw-semibold">
                        Khách hàng / Bộ phận yêu cầu
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên khách hàng hoặc phòng ban..."
                        value={formCustomerName}
                        onChange={(e) => setFormCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label text-dark fw-semibold">
                        Số điện thoại liên hệ
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Số điện thoại..."
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label text-dark fw-semibold">
                      Ghi chú đơn hàng
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Ghi chú yêu cầu giao hàng, quy cách đặc biệt..."
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                    disabled={saving}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger btn-lg px-4 fw-bold d-flex align-items-center gap-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cart-check-fill fs-5"></i>
                        <span>Tạo Order Ngay</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CHI TIẾT & CẬP NHẬT ĐƠN HÀNG */}
      {/* ========================================================================= */}
      {showDetailModal && currentOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-receipt"></i>
                  Chi Tiết Đơn Hàng: {currentOrder.order_code}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>

              <form onSubmit={handleUpdateOrder}>
                <div className="modal-body p-4">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block">Mã sản phẩm:</small>
                        <span className="badge bg-primary font-monospace fs-6">{currentOrder.product_code}</span>
                        <div className="mt-2 fw-bold text-dark fs-6">{currentOrder.product_name}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block">Đơn giá:</small>
                        <div className="fw-bold text-danger fs-6">
                          {Number(currentOrder.unit_price || 0).toLocaleString('vi-VN')} đ / {currentOrder.unit || 'Cái'}
                        </div>
                        <small className="text-muted d-block mt-2">Tổng tiền hiện tại:</small>
                        <div className="fw-bold text-success fs-5">
                          {(parseFloat(currentOrder.unit_price || 0) * editQuantity).toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Số lượng đặt:</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-lg fw-bold"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Trạng thái đơn hàng:</label>
                      <select
                        className="form-select form-select-lg"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        <option value="pending">Chờ Xử Lý (Pending)</option>
                        <option value="confirmed">Đã Xác Nhận (Confirmed)</option>
                        <option value="shipping">Đang Giao Hàng (Shipping)</option>
                        <option value="completed">Đã Hoàn Tất (Completed)</option>
                        <option value="cancelled">Đã Hủy (Cancelled)</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Khách hàng / Bộ phận:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentOrder.customer_name || ''}
                        onChange={(e) => setCurrentOrder({ ...currentOrder, customer_name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small">Số điện thoại:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentOrder.phone || ''}
                        onChange={(e) => setCurrentOrder({ ...currentOrder, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small">Ghi chú:</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={currentOrder.note || ''}
                      onChange={(e) => setCurrentOrder({ ...currentOrder, note: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-dark d-flex align-items-center gap-1"
                    onClick={() => printOrderSlip(currentOrder)}
                  >
                    <i className="bi bi-printer-fill"></i> In Phiếu Đơn Hàng
                  </button>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowDetailModal(false)}
                      disabled={saving}
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary fw-bold"
                      disabled={saving}
                    >
                      {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status"></div>
        <div className="text-muted mt-2">Đang tải quản lý đơn hàng...</div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
