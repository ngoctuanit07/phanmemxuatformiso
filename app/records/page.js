'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';

export default function RecordsManagementPage() {
  const [records, setRecords] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateStats, setTemplateStats] = useState([]);
  const [summary, setSummary] = useState({
    total_records: 0,
    total_prints: 0,
    templates_used: 0,
    last_printed_at: null,
    latest_record_at: null
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTemplateTab, setSelectedTemplateTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrinted, setFilterPrinted] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Batch selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // Print modal states
  const [activePrintRecord, setActivePrintRecord] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printerNote, setPrinterNote] = useState('Máy in mặc định Local');
  const [copies, setCopies] = useState(1);
  const [printingStatus, setPrintingStatus] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Notification / Alert
  const [alertMsg, setAlertMsg] = useState(null);

  const printIframeRef = useRef(null);
  const modalIframeRef = useRef(null);

  // Fetch records with all active filters
  const fetchRecords = (tplId = selectedTemplateTab) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (tplId && tplId !== 'all') params.set('template_id', tplId);
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (filterPrinted !== 'all') params.set('has_printed', filterPrinted);
    if (fromDate) params.set('from_date', fromDate);
    if (toDate) params.set('to_date', toDate);

    fetch(`/api/records?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecords(data.records || []);
          if (data.template_stats) setTemplateStats(data.template_stats);
          if (data.summary) setSummary(data.summary);
        } else {
          setAlertMsg({ type: 'danger', text: data.message || 'Lỗi tải danh sách dữ liệu hồ sơ' });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setAlertMsg({ type: 'danger', text: 'Lỗi kết nối máy chủ: ' + err.message });
        setLoading(false);
      });
  };

  useEffect(() => {
    // Initial fetch templates list
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTemplates(data.templates || []);
      })
      .catch(console.error);

    fetchRecords('all');
  }, []);

  const handleTemplateTabChange = (tplId) => {
    setSelectedTemplateTab(tplId);
    setSelectedIds([]);
    fetchRecords(tplId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords(selectedTemplateTab);
  };

  const handleResetFilters = () => {
    setSelectedTemplateTab('all');
    setSearchTerm('');
    setFilterPrinted('all');
    setFromDate('');
    setToDate('');
    setSelectedIds([]);
    fetchRecords('all');
  };

  // Direct print trigger for a record (via hidden iframe or modal)
  const handleDirectPrint = (record) => {
    setActivePrintRecord(record);
    setPrintingStatus('initiating');
    setShowPrintModal(true);
  };

  // Trigger browser print from modal
  const executeModalPrint = () => {
    if (modalIframeRef.current) {
      try {
        setPrintingStatus('printing');
        modalIframeRef.current.contentWindow.focus();
        modalIframeRef.current.contentWindow.print();
        setTimeout(() => {
          setPrintingStatus('done');
          // Refresh list to show updated print_count
          fetchRecords(selectedTemplateTab);
        }, 1000);
      } catch (err) {
        console.warn('Modal iframe print error:', err);
        window.open(`/api/records/${activePrintRecord.id}/print`, '_blank');
      }
    } else {
      window.open(`/api/records/${activePrintRecord.id}/print`, '_blank');
    }
  };

  // Delete a single record
  const handleDeleteRecord = async (record) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa hồ sơ "${record.title}" [${record.code}] khỏi cơ sở dữ liệu?`)) return;
    try {
      const res = await fetch(`/api/records/${record.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAlertMsg({ type: 'success', text: `✔ Đã xóa hồ sơ ${record.code} thành công!` });
        setRecords(prev => prev.filter(r => r.id !== record.id));
        setSelectedIds(prev => prev.filter(id => id !== record.id));
      } else {
        setAlertMsg({ type: 'danger', text: data.message || 'Lỗi khi xóa hồ sơ' });
      }
    } catch (err) {
      setAlertMsg({ type: 'danger', text: 'Lỗi kết nối: ' + err.message });
    }
  };

  // Batch selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(records.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Batch delete selected records
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} hồ sơ đã chọn khỏi cơ sở dữ liệu? Hành động này không thể hoàn tác.`)) {
      return;
    }
    setBatchDeleting(true);
    try {
      const res = await fetch('/api/records', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      const data = await res.json();
      if (data.success) {
        setAlertMsg({ type: 'success', text: `✔ ${data.message}` });
        setSelectedIds([]);
        fetchRecords(selectedTemplateTab);
      } else {
        setAlertMsg({ type: 'danger', text: data.message || 'Lỗi khi xóa hồ sơ hàng loạt' });
      }
    } catch (err) {
      setAlertMsg({ type: 'danger', text: 'Lỗi kết nối: ' + err.message });
    } finally {
      setBatchDeleting(false);
    }
  };

  // Export records table to Excel-compatible CSV with UTF-8 BOM
  const handleExportCsv = () => {
    if (records.length === 0) {
      alert('Không có dữ liệu để xuất file CSV.');
      return;
    }

    const headers = ['Mã Hồ Sơ', 'Tên Hồ Sơ', 'Mã Biểu Mẫu', 'Tên Biểu Mẫu', 'Người Tạo', 'Ngày Tạo', 'Số Lần In', 'Lần In Cuối', 'Tóm Tắt Dữ Liệu'];
    const rows = records.map(r => {
      const summaryText = r.form_data && typeof r.form_data === 'object'
        ? Object.entries(r.form_data)
            .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
            .slice(0, 5)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ')
        : '';

      return [
        `"${r.code}"`,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${r.template_code || ''}"`,
        `"${(r.template_name || '').replace(/"/g, '""')}"`,
        `"${(r.created_by_name || '').replace(/"/g, '""')}"`,
        `"${r.created_at || ''}"`,
        r.print_count || 0,
        `"${r.last_printed_at || ''}"`,
        `"${summaryText.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Danh_sach_ho_so_form_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to copy record code to clipboard
  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Helper to format key-value preview from form_data
  const renderFormDataSnippet = (formData) => {
    if (!formData || typeof formData !== 'object') return <span className="text-muted small">Không có dữ liệu</span>;
    const entries = Object.entries(formData).filter(([_, v]) => v !== '' && v !== null && v !== undefined);
    if (entries.length === 0) return <span className="text-muted small">Chưa điền thông tin</span>;

    // Pick top 3 most informative fields
    const displayed = entries.slice(0, 3);
    return (
      <div className="small text-secondary lh-sm">
        {displayed.map(([key, val], idx) => (
          <div key={idx} className="text-truncate" style={{ maxWidth: '280px' }}>
            <span className="text-dark fw-semibold">{key}: </span>
            <span>{String(val)}</span>
          </div>
        ))}
        {entries.length > 3 && (
          <small className="text-primary fst-italic">+{entries.length - 3} trường khác...</small>
        )}
      </div>
    );
  };

  return (
    <div className="pb-5">
      {/* Hidden print iframe for silent background print */}
      <iframe
        ref={printIframeRef}
        style={{ display: 'none', position: 'absolute', width: '0px', height: '0px' }}
        title="Direct Print Iframe"
      />

      {/* Main Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white font-monospace px-2 py-1">MODULE QUẢN LÝ DỮ LIỆU</span>
            <span className="badge bg-success-subtle text-success border border-success-subtle">
              <i className="bi bi-database me-1"></i>MySQL Storage
            </span>
          </div>
          <h2 className="fw-bold mb-1 text-primary d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-spreadsheet-fill text-warning"></i>
            Quản Lý Dữ Liệu Template Đã Nhập & In Lại File
          </h2>
          <p className="text-muted mb-0">
            Toàn bộ các biểu mẫu đã thực hiện nhập liệu và lưu trữ trong CSDL. Bạn có thể tra cứu, chỉnh sửa, nhân bản và gửi lệnh in lại trực tiếp ra máy in local bất kỳ lúc nào.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0">
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-1 shadow-sm"
            onClick={() => fetchRecords(selectedTemplateTab)}
            title="Tải lại danh sách"
          >
            <i className="bi bi-arrow-clockwise"></i> Tải Lại
          </button>
          <button
            type="button"
            className="btn btn-outline-success d-flex align-items-center gap-1 shadow-sm"
            onClick={handleExportCsv}
            title="Xuất bảng dữ liệu ra file Excel / CSV UTF-8"
          >
            <i className="bi bi-file-earmark-excel"></i> Xuất Excel (CSV)
          </button>
          <Link href="/fill" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <i className="bi bi-plus-circle-fill"></i>
            <span>Nhập Liệu Mới Vào Form</span>
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show shadow-sm`} role="alert">
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${alertMsg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`}></i>
            <div>{alertMsg.text}</div>
          </div>
          <button type="button" className="btn-close" onClick={() => setAlertMsg(null)}></button>
        </div>
      )}

      {/* KPI & Summary Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border-primary border-opacity-25 bg-white shadow-sm">
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                  Tổng Hồ Sơ Đã Nhập
                </span>
                <h3 className="fw-bold my-1 text-primary">{summary.total_records || records.length}</h3>
                <small className="text-muted">
                  <i className="bi bi-check2-circle text-success me-1"></i>Đã lưu trong CSDL
                </small>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <i className="bi bi-file-earmark-check-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border-warning border-opacity-25 bg-white shadow-sm">
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                  Tổng Lượt In Lại Local
                </span>
                <h3 className="fw-bold my-1 text-warning">{summary.total_prints || 0}</h3>
                <small className="text-muted">
                  <i className="bi bi-printer-fill text-warning me-1"></i>Xuất lệnh in vật lý
                </small>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-circle">
                <i className="bi bi-printer-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border-success border-opacity-25 bg-white shadow-sm">
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                  Biểu Mẫu Đã Phát Sinh
                </span>
                <h3 className="fw-bold my-1 text-success">{templateStats.length}</h3>
                <small className="text-muted">
                  <i className="bi bi-collection text-success me-1"></i>Mẫu template có dữ liệu
                </small>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <i className="bi bi-folder-check fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border-info border-opacity-25 bg-white shadow-sm">
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                  Lần In Gần Nhất
                </span>
                <div className="fw-bold my-1 text-dark text-truncate" style={{ maxWidth: '180px' }}>
                  {summary.last_printed_at ? String(summary.last_printed_at) : 'Chưa ghi nhận'}
                </div>
                <small className="text-info">
                  <Link href="/print-logs" className="text-decoration-none text-info">
                    <i className="bi bi-clock-history me-1"></i>Xem nhật ký in &rarr;
                  </Link>
                </small>
              </div>
              <div className="p-3 bg-info bg-opacity-10 text-info rounded-circle">
                <i className="bi bi-clock-history fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Categorization Tabs */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-white py-3 border-bottom">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span className="fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-filter-circle-fill text-primary"></i>
              Phân Loại Dữ Liệu Theo Biểu Mẫu (Template):
            </span>
            <span className="text-muted small">
              Nhấp vào từng biểu mẫu để lọc nhanh các bản ghi đã nhập của mẫu đó
            </span>
          </div>
        </div>
        <div className="card-body p-3 bg-light bg-opacity-50">
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn btn-sm ${selectedTemplateTab === 'all' ? 'btn-primary shadow-sm' : 'btn-outline-secondary bg-white'}`}
              onClick={() => handleTemplateTabChange('all')}
            >
              <i className="bi bi-collection me-1"></i>
              Tất Cả Biểu Mẫu ({summary.total_records || records.length})
            </button>

            {templates.map(tpl => {
              const matchedStat = templateStats.find(s => String(s.template_id) === String(tpl.id));
              const count = matchedStat ? matchedStat.count : 0;
              const isSelected = String(selectedTemplateTab) === String(tpl.id);

              return (
                <button
                  key={tpl.id}
                  type="button"
                  className={`btn btn-sm d-flex align-items-center gap-2 ${
                    isSelected ? 'btn-primary shadow-sm' : 'btn-outline-secondary bg-white'
                  }`}
                  onClick={() => handleTemplateTabChange(String(tpl.id))}
                >
                  <span className="font-monospace fw-semibold">{tpl.code}</span>
                  <span className="text-truncate" style={{ maxWidth: '200px' }}>{tpl.name}</span>
                  <span className={`badge ${isSelected ? 'bg-white text-primary' : (count > 0 ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-dark')}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body p-3">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            {/* Search Keyword */}
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Tìm theo mã REC, tiêu đề, tên SP, họ tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Template Dropdown */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select"
                value={selectedTemplateTab}
                onChange={(e) => handleTemplateTabChange(e.target.value)}
              >
                <option value="all">-- Tất cả biểu mẫu --</option>
                {templates.map(t => (
                  <option key={t.id} value={String(t.id)}>
                    [{t.code}] {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Print Status Filter */}
            <div className="col-6 col-sm-3 col-md-2">
              <select
                className="form-select"
                value={filterPrinted}
                onChange={(e) => {
                  setFilterPrinted(e.target.value);
                  setTimeout(() => fetchRecords(selectedTemplateTab), 50);
                }}
              >
                <option value="all">Lượt in: Tất cả</option>
                <option value="yes">Đã in ít nhất 1 lần</option>
                <option value="no">Chưa in lần nào</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="col-6 col-sm-3 col-md-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-grow-1">
                <i className="bi bi-funnel me-1"></i> Lọc
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleResetFilters}
                title="Đặt lại bộ lọc"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Batch Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2 shadow-sm">
          <div className="d-flex align-items-center gap-2 fw-semibold text-dark">
            <i className="bi bi-check2-square fs-5 text-primary"></i>
            <span>Đã chọn <strong>{selectedIds.length}</strong> hồ sơ</span>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary bg-white"
              onClick={() => setSelectedIds([])}
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger d-flex align-items-center gap-1 shadow-sm"
              onClick={handleBatchDelete}
              disabled={batchDeleting}
            >
              {batchDeleting ? (
                <span className="spinner-border spinner-border-sm me-1"></span>
              ) : (
                <i className="bi bi-trash-fill"></i>
              )}
              <span>Xóa {selectedIds.length} Hồ Sơ Đã Chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="bi bi-table text-primary"></i>
            Danh Sách Bản Ghi Đã Lưu Trong CSDL ({records.length} hồ sơ)
          </h5>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
            Đang hiển thị {records.length} bản ghi
          </span>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th style={{ width: '4%' }} className="text-center">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={records.length > 0 && selectedIds.length === records.length}
                      onChange={handleSelectAll}
                      title="Chọn tất cả hồ sơ"
                    />
                  </th>
                  <th style={{ width: '12%' }}>Mã Hồ Sơ</th>
                  <th style={{ width: '22%' }}>Biểu Mẫu & Tiêu Đề</th>
                  <th style={{ width: '22%' }}>Dữ Liệu Đã Nhập (Trích Yếu)</th>
                  <th style={{ width: '12%' }}>Người Tạo / Ngày</th>
                  <th style={{ width: '10%' }} className="text-center">Trạng Thái In</th>
                  <th style={{ width: '18%' }} className="text-end">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                      <span className="text-muted">Đang tải danh sách dữ liệu hồ sơ từ MySQL...</span>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1 text-secondary opacity-50 d-block mb-2"></i>
                      <div className="fw-semibold text-dark mb-1">Chưa có dữ liệu hồ sơ nào phù hợp với bộ lọc</div>
                      <p className="text-muted small mb-3">
                        Bạn có thể chọn một biểu mẫu và nhập dữ liệu để lưu vào cơ sở dữ liệu.
                      </p>
                      <Link href="/fill" className="btn btn-sm btn-primary shadow-sm">
                        <i className="bi bi-pencil-square me-1"></i> Điền và lưu biểu mẫu mới
                      </Link>
                    </td>
                  </tr>
                ) : (
                  records.map(rec => {
                    const isSelected = selectedIds.includes(rec.id);
                    return (
                      <tr key={rec.id} className={isSelected ? 'table-primary table-active' : ''}>
                        {/* Checkbox */}
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(rec.id)}
                          />
                        </td>

                        {/* Code */}
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <span className="badge bg-dark-subtle text-dark font-monospace fw-bold">
                              {rec.code}
                            </span>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-muted"
                              title="Sao chép mã hồ sơ"
                              onClick={() => copyCode(rec.code)}
                            >
                              <i className={`bi ${copiedCode === rec.code ? 'bi-check-lg text-success' : 'bi-clipboard'}`}></i>
                            </button>
                          </div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                            ID: #{rec.id}
                          </small>
                        </td>

                        {/* Template & Title */}
                        <td>
                          <div className="d-flex align-items-center gap-1 mb-1">
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace" style={{ fontSize: '0.7rem' }}>
                              {rec.template_code || 'TPL'}
                            </span>
                            <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.7rem' }}>
                              {rec.template_type === 'docx' ? 'Word' : 'PDF'}
                            </span>
                          </div>
                          <Link
                            href={`/records/${rec.id}`}
                            className="fw-bold text-dark text-decoration-none hover-primary d-block"
                            title="Xem chi tiết toàn bộ dữ liệu hồ sơ"
                          >
                            {rec.title}
                          </Link>
                          <small className="text-muted d-flex align-items-center gap-1">
                            <i className="bi bi-file-earmark-text text-secondary"></i>
                            <span className="text-truncate" style={{ maxWidth: '240px' }}>{rec.template_name}</span>
                          </small>
                        </td>

                        {/* Data summary preview */}
                        <td>
                          {renderFormDataSnippet(rec.form_data)}
                        </td>

                        {/* Creator & Date */}
                        <td>
                          <div className="fw-semibold small text-dark">{rec.created_by_name}</div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                            {rec.created_at}
                          </small>
                        </td>

                        {/* Print count & status */}
                        <td className="text-center">
                          {rec.print_count > 0 ? (
                            <div>
                              <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1">
                                <i className="bi bi-printer-fill"></i>
                                <span>Đã in {rec.print_count} lần</span>
                              </span>
                              {rec.last_printed_at && (
                                <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                                  Lần cuối: {rec.last_printed_at.split(' ')[0]}
                                </small>
                              )}
                            </div>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary">
                              <i className="bi bi-printer me-1"></i>Chưa in
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="text-end">
                          <div className="btn-group btn-group-sm shadow-sm" role="group">
                            {/* Primary: In lại trực tiếp */}
                            <button
                              type="button"
                              className="btn btn-warning text-dark fw-bold d-inline-flex align-items-center gap-1"
                              onClick={() => handleDirectPrint(rec)}
                              title="In lại hồ sơ này ra máy in local"
                            >
                              <i className="bi bi-printer-fill"></i>
                              <span>In Lại</span>
                            </button>

                            {/* Xem chi tiết */}
                            <Link
                              href={`/records/${rec.id}`}
                              className="btn btn-outline-secondary"
                              title="Xem chi tiết toàn bộ dữ liệu & bản xem trước in"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>

                            {/* Chỉnh sửa dữ liệu & điền tiếp */}
                            <Link
                              href={`/fill?record_id=${rec.id}`}
                              className="btn btn-outline-primary"
                              title="Chỉnh sửa dữ liệu đã lưu rồi in lại"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Link>

                            {/* Dropdown for More Actions */}
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                type="button"
                                className="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <span className="visually-hidden">Tùy chọn khác</span>
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end shadow">
                                <li>
                                  <h6 className="dropdown-header">Xuất & Tải File</h6>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item d-flex align-items-center gap-2"
                                    href={`/api/records/${rec.id}/export?format=docx`}
                                  >
                                    <i className="bi bi-file-earmark-word text-primary"></i>
                                    <span>Tải file Word (.docx) đã điền</span>
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item d-flex align-items-center gap-2"
                                    href={`/api/records/${rec.id}/export?format=pdf`}
                                  >
                                    <i className="bi bi-file-earmark-pdf text-danger"></i>
                                    <span>Tải file PDF (.pdf) đã điền</span>
                                  </a>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                  <h6 className="dropdown-header">Thao Tác Dữ Liệu</h6>
                                </li>
                                <li>
                                  <Link
                                    className="dropdown-item d-flex align-items-center gap-2"
                                    href={`/fill?record_id=${rec.id}&mode=duplicate`}
                                  >
                                    <i className="bi bi-copy text-success"></i>
                                    <span>Nhân bản (Tạo bản sao mới)</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    className="dropdown-item d-flex align-items-center gap-2"
                                    href={`/fill?record_id=${rec.id}`}
                                  >
                                    <i className="bi bi-pencil text-primary"></i>
                                    <span>Chỉnh sửa nội dung hồ sơ</span>
                                  </Link>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                  <button
                                    type="button"
                                    className="dropdown-item text-danger d-flex align-items-center gap-2"
                                    onClick={() => handleDeleteRecord(rec)}
                                  >
                                    <i className="bi bi-trash"></i>
                                    <span>Xóa hồ sơ này khỏi CSDL</span>
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Print Modal ("In Lại Bản Ghi Ra Máy In Local") */}
      {showPrintModal && activePrintRecord && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered" style={{ height: '92vh' }}>
            <div className="modal-content h-100 shadow-lg border-0">
              {/* Modal Header */}
              <div className="modal-header bg-dark text-white py-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-printer-fill text-warning fs-5"></i>
                  <div>
                    <h6 className="modal-title fw-bold mb-0">
                      In Lại Hồ Sơ: {activePrintRecord.title} [{activePrintRecord.code}]
                    </h6>
                    <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                      Biểu mẫu: {activePrintRecord.template_name} ({activePrintRecord.template_code}) | Đã in: {activePrintRecord.print_count} lần
                    </small>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 ms-auto me-2">
                  {/* Print Action Button */}
                  <button
                    type="button"
                    className="btn btn-warning text-dark fw-bold d-flex align-items-center gap-2 shadow"
                    onClick={executeModalPrint}
                  >
                    <i className="bi bi-printer-fill fs-5"></i>
                    <span>GỬI LỆNH IN RA MÁY IN LOCAL</span>
                  </button>

                  {/* Open in new tab fallback */}
                  <a
                    href={`/api/records/${activePrintRecord.id}/print`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-light"
                    title="Mở tab in riêng trong trường hợp trình duyệt chặn cửa sổ pop-up"
                  >
                    <i className="bi bi-box-arrow-up-right me-1"></i> Mở Tab In Độc Lập
                  </a>

                  {/* Download Word */}
                  <a
                    href={`/api/records/${activePrintRecord.id}/export?format=docx`}
                    className="btn btn-sm btn-outline-light"
                    title="Tải file Word (.docx) đã điền sẵn dữ liệu"
                  >
                    <i className="bi bi-file-earmark-word me-1"></i> Tải Word
                  </a>
                </div>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPrintModal(false)}
                ></button>
              </div>

              {/* Modal Print Settings Toolbar */}
              <div className="bg-light p-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2 px-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-1">
                    <span className="small text-muted fw-semibold">Máy in nhận lệnh:</span>
                    <span className="badge bg-dark font-monospace">{printerNote}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <span className="small text-muted fw-semibold">Khổ giấy:</span>
                    <span className="badge bg-secondary">A4 Chuẩn</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <span className="small text-muted fw-semibold">Số bản in:</span>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      className="form-control form-control-sm text-center fw-bold"
                      style={{ width: '65px' }}
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Link
                    href={`/fill?record_id=${activePrintRecord.id}`}
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setShowPrintModal(false)}
                  >
                    <i className="bi bi-pencil-square me-1"></i> Sửa dữ liệu trước khi in
                  </Link>
                  <span className="small text-muted">
                    * Lệnh in sẽ tự động ghi nhật ký vào bảng <code>print_logs</code>
                  </span>
                </div>
              </div>

              {/* Modal Body: Embedded Print View Iframe */}
              <div className="modal-body p-0 bg-secondary bg-opacity-10 h-100 position-relative">
                <iframe
                  ref={modalIframeRef}
                  id="recordPrintIframe"
                  src={`/api/records/${activePrintRecord.id}/print`}
                  className="w-100 h-100 border-0"
                  title="PDF Print View"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
