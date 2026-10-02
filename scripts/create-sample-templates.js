const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');
const mysql = require('mysql2/promise');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'templates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function generateSampleDocxTemplates() {
  console.log('--- Đang tạo các file Word template mẫu (.docx) ---');

  // ================= 1. ĐƠN XIN NGHỈ PHÉP =================
  const docNghiPhep = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
        }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, underline: {}, size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "ĐƠN XIN NGHỈ PHÉP", bold: true, size: 36, font: "Times New Roman", color: "1A365D" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Kính gửi: Ban Giám Đốc & Trưởng Bộ Phận {phong_ban}", italics: true, bold: true, size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "Tôi tên là: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ho_ten}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Mã nhân viên: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ma_nhan_vien}", size: 24, font: "Times New Roman" }),
            new TextRun({ text: "       Chức danh: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{chuc_vu}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Bộ phận / Phòng ban: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{phong_ban}", size: 24, font: "Times New Roman" }),
            new TextRun({ text: "       Số điện thoại: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{so_dien_thoai}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Hình thức nghỉ: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{loai_nghi}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Thời gian xin nghỉ: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "Từ ngày ", size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{tu_ngay}", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: " đến hết ngày ", size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{den_ngay}", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: " (Tổng cộng: ", size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{so_ngay_nghi}", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: " ngày).", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Lý do xin nghỉ: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ly_do_nghi}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Bàn giao công việc cho: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{nguoi_ban_giao}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Địa chỉ liên hệ khi cần: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{dia_chi_nghi}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "Tôi cam kết hoàn thành hoặc bàn giao đầy đủ các công việc đang phụ trách trước khi nghỉ và có mặt đúng hẹn sau kỳ nghỉ.", italics: true, size: 22, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: "Ngày lập đơn: {ngay_lam_don}", italics: true, size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        // Signatures table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 33, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NGƯỜI LÀM ĐƠN", bold: true, size: 22, font: "Times New Roman" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(Ký và ghi rõ họ tên)", italics: true, size: 20, font: "Times New Roman" })] }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{ho_ten}", bold: true, size: 22, font: "Times New Roman" })] }),
                  ]
                }),
                new TableCell({
                  width: { size: 33, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TRƯỞNG BỘ PHẬN", bold: true, size: 22, font: "Times New Roman" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(Ký duyệt)", italics: true, size: 20, font: "Times New Roman" })] }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Đã ký duyệt", italics: true, size: 20, font: "Times New Roman" })] }),
                  ]
                }),
                new TableCell({
                  width: { size: 34, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "BAN GIÁM ĐỐC", bold: true, size: 22, font: "Times New Roman" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(Phê duyệt)", italics: true, size: 20, font: "Times New Roman" })] }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phê duyệt đồng ý", italics: true, size: 20, font: "Times New Roman" })] }),
                  ]
                }),
              ]
            })
          ]
        })
      ]
    }]
  });

  const file1 = path.join(uploadDir, 'don_xin_nghi_phep.docx');
  const buffer1 = await Packer.toBuffer(docNghiPhep);
  fs.writeFileSync(file1, buffer1);
  console.log('✔ Đã tạo template mẫu: don_xin_nghi_phep.docx');

  // ================= 2. GIẤY ĐỀ NGHỊ THANH TOÁN =================
  const docThanhToan = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: "Đơn vị: CÔNG TY CỔ PHẦN CÔNG NGHỆ & DỊCH VỤ SỐ", bold: true, size: 22, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Mẫu số: 05-TT (Ban hành theo TT 133/2016/TT-BTC)", italics: true, size: 20, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "GIẤY ĐỀ NGHỊ THANH TOÁN", bold: true, size: 34, font: "Times New Roman", color: "1A365D" }),
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Số: {so_phieu}  |  Ngày lập: {ngay_thanh_toan}", italics: true, size: 22, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "Kính gửi: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "Ban Tổng Giám đốc và Phòng Tài chính - Kế toán", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Người đề nghị thanh toán: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ho_ten}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Bộ phận / Phòng ban: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{bo_phan}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Nội dung thanh toán: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{noi_dung_thanh_toan}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Số tiền đề nghị: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{so_tien} VNĐ", bold: true, size: 24, font: "Times New Roman", color: "C53030" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Bằng chữ: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{so_tien_chu}", italics: true, size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Hình thức thanh toán: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{hinh_thuc_thanh_toan}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Tài khoản nhận tiền: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{so_tai_khoan_ngan_hang}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Chứng từ gốc kèm theo: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{chung_tu_kem_theo}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "GIÁM ĐỐC", bold: true, size: 20, font: "Times New Roman" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(Ký, duyệt)", italics: true, size: 18, font: "Times New Roman" })] }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Duyệt chi", italics: true, size: 20, font: "Times New Roman" })] }),
                  ]
                }),
                new TableCell({
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "KẾ TOÁN TRƯỞNG", bold: true, size: 20, font: "Times New Roman" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(Ký, ghi họ tên)", italics: true, size: 18, font: "Times New Roman" })] }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Đã kiểm tra", italics: true, size: 20, font: "Times New Roman" })] }),
                  ]
                }),
                new TableCell({
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TRƯỞNG BỘ PHẬN", bold: true, size: 20, font: "Times New Roman" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(Ký xác nhận)", italics: true, size: 18, font: "Times New Roman" })] }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Xác nhận", italics: true, size: 20, font: "Times New Roman" })] }),
                  ]
                }),
                new TableCell({
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NGƯỜI ĐỀ NGHỊ", bold: true, size: 20, font: "Times New Roman" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(Ký, ghi họ tên)", italics: true, size: 18, font: "Times New Roman" })] }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{ho_ten}", bold: true, size: 20, font: "Times New Roman" })] }),
                  ]
                })
              ]
            })
          ]
        })
      ]
    }]
  });

  const file2 = path.join(uploadDir, 'giay_de_nghi_thanh_toan.docx');
  const buffer2 = await Packer.toBuffer(docThanhToan);
  fs.writeFileSync(file2, buffer2);
  console.log('✔ Đã tạo template mẫu: giay_de_nghi_thanh_toan.docx');

  // ================= 3. BIÊN BẢN BÀN GIAO =================
  const docBanGiao = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, underline: {}, size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "BIÊN BẢN BÀN GIAO THIẾT BỊ / TÀI SẢN", bold: true, size: 32, font: "Times New Roman", color: "1A365D" }),
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Số: {so_bien_ban}  |  Ngày lập: {ngay_lap_bien_ban}", italics: true, size: 22, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "Địa điểm bàn giao: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{dia_diem_ban_giao}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "I. BÊN GIAO (BÊN A):", bold: true, size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "- Ông/Bà: ", size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ben_giao_ho_ten}", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "       Chức vụ: ", size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ben_giao_chuc_vu}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "- Bộ phận / Phòng ban: ", size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ben_giao_phong_ban}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "II. BÊN NHẬN (BÊN B):", bold: true, size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "- Ông/Bà: ", size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ben_nhan_ho_ten}", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "       Chức vụ: ", size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ben_nhan_chuc_vu}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "- Bộ phận / Phòng ban: ", size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ben_nhan_phong_ban}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "III. NỘI DUNG VÀ CHI TIẾT BÀN GIAO:", bold: true, size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "1. Danh mục tài sản / thiết bị: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ten_tai_san}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "2. Số lượng: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{so_luong}", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "       Số Serial/Mã vạch: ", size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ma_serial}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "3. Tình trạng kỹ thuật: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{tinh_trang_thiet_bi}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "4. Phụ kiện đi kèm: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{phu_kien_kem_theo}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "5. Ghi chú / Trách nhiệm quản lý: ", bold: true, size: 24, font: "Times New Roman" }),
            new TextRun({ text: "{ghi_chu}", size: 24, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "Hai bên đã kiểm tra kỹ lưỡng, đối chiếu thông số và thống nhất ký biên bản này.", italics: true, size: 22, font: "Times New Roman" }),
          ]
        }),
        new Paragraph({ text: "" }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ĐẠI DIỆN BÊN GIAO (BÊN A)", bold: true, size: 22, font: "Times New Roman" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(Ký và ghi rõ họ tên)", italics: true, size: 20, font: "Times New Roman" })] }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{ben_giao_ho_ten}", bold: true, size: 22, font: "Times New Roman" })] }),
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ĐẠI DIỆN BÊN NHẬN (BÊN B)", bold: true, size: 22, font: "Times New Roman" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(Ký và ghi rõ họ tên)", italics: true, size: 20, font: "Times New Roman" })] }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "{ben_nhan_ho_ten}", bold: true, size: 22, font: "Times New Roman" })] }),
                  ]
                })
              ]
            })
          ]
        })
      ]
    }]
  });

  const file3 = path.join(uploadDir, 'bien_ban_ban_giao.docx');
  const buffer3 = await Packer.toBuffer(docBanGiao);
  fs.writeFileSync(file3, buffer3);
  console.log('✔ Đã tạo template mẫu: bien_ban_ban_giao.docx');

  // Insert into DB
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'phanmemxuatform',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  try {
    const templates = [
      {
        code: 'TPL-NGHI-PHEP',
        name: 'Đơn xin nghỉ phép nhân sự',
        description: 'Mẫu đơn xin nghỉ phép năm, nghỉ ốm, việc riêng có phê duyệt của Trưởng bộ phận và Ban Giám Đốc',
        category_id: 1,
        file_path: '/uploads/templates/don_xin_nghi_phep.docx',
        file_name: 'don_xin_nghi_phep.docx',
        file_type: 'docx',
        file_size: buffer1.length,
        fields_schema: JSON.stringify([
          { name: 'phong_ban', label: 'Phòng ban / Bộ phận', type: 'select', options: ['Phòng Kỹ Thuật & Vận Hành', 'Phòng Hành Chính Nhân Sự', 'Phòng Kế Toán Tài Chính', 'Phòng Kinh Doanh & Tiếp Thị'], required: true, default_value: 'Phòng Kỹ Thuật & Vận Hành' },
          { name: 'ho_ten', label: 'Họ và tên nhân viên', type: 'text', required: true, default_value: 'Trần Thị Nhân Viên' },
          { name: 'ma_nhan_vien', label: 'Mã nhân viên', type: 'text', required: true, default_value: 'NV-2026-088' },
          { name: 'chuc_vu', label: 'Chức vụ', type: 'text', required: true, default_value: 'Chuyên viên Kế toán' },
          { name: 'so_dien_thoai', label: 'Số điện thoại', type: 'text', required: true, default_value: '0988.123.456' },
          { name: 'loai_nghi', label: 'Loại nghỉ phép', type: 'select', options: ['Nghỉ phép thường niên (có lương)', 'Nghỉ ốm đau / thai sản', 'Nghỉ việc riêng hưởng nguyên lương', 'Nghỉ việc riêng không hưởng lương'], required: true, default_value: 'Nghỉ phép thường niên (có lương)' },
          { name: 'tu_ngay', label: 'Nghỉ từ ngày', type: 'date', required: true, default_value: '2026-10-05' },
          { name: 'den_ngay', label: 'Đến hết ngày', type: 'date', required: true, default_value: '2026-10-07' },
          { name: 'so_ngay_nghi', label: 'Số ngày nghỉ', type: 'number', required: true, default_value: '3' },
          { name: 'ly_do_nghi', label: 'Lý do xin nghỉ', type: 'textarea', required: true, default_value: 'Giải quyết công việc gia đình' },
          { name: 'nguoi_ban_giao', label: 'Người nhận bàn giao công việc', type: 'text', required: true, default_value: 'Nguyễn Văn Quản Lý' },
          { name: 'dia_chi_nghi', label: 'Địa chỉ / Liên hệ trong thời gian nghỉ', type: 'text', required: false, default_value: 'Số 45 Lê Duẩn, TP. Đà Nẵng' },
          { name: 'ngay_lam_don', label: 'Ngày làm đơn', type: 'date', required: true, default_value: '2026-10-01' }
        ]),
        created_by: 1
      },
      {
        code: 'TPL-THANH-TOAN',
        name: 'Giấy đề nghị thanh toán / tạm ứng',
        description: 'Biểu mẫu đề nghị thanh toán chi phí công tác, mua sắm vật tư, tiếp khách hoặc tạm ứng theo mẫu 05-TT',
        category_id: 2,
        file_path: '/uploads/templates/giay_de_nghi_thanh_toan.docx',
        file_name: 'giay_de_nghi_thanh_toan.docx',
        file_type: 'docx',
        file_size: buffer2.length,
        fields_schema: JSON.stringify([
          { name: 'so_phieu', label: 'Số phiếu thanh toán', type: 'text', required: true, default_value: 'TT-2026/10-001' },
          { name: 'ngay_thanh_toan', label: 'Ngày lập đề nghị', type: 'date', required: true, default_value: '2026-10-01' },
          { name: 'ho_ten', label: 'Người đề nghị thanh toán', type: 'text', required: true, default_value: 'Nguyễn Văn Quản Lý' },
          { name: 'bo_phan', label: 'Bộ phận / Phòng ban', type: 'text', required: true, default_value: 'Phòng Hành Chính Nhân Sự' },
          { name: 'noi_dung_thanh_toan', label: 'Nội dung thanh toán', type: 'textarea', required: true, default_value: 'Thanh toán chi phí mua sắm văn phòng phẩm và mực in quý IV/2026' },
          { name: 'so_tien', label: 'Số tiền thanh toán (VNĐ)', type: 'currency', required: true, default_value: '8,500,000' },
          { name: 'so_tien_chu', label: 'Số tiền bằng chữ', type: 'text', required: true, default_value: 'Tám triệu năm trăm nghìn đồng chẵn' },
          { name: 'hinh_thuc_thanh_toan', label: 'Hình thức thanh toán', type: 'select', options: ['Chuyển khoản qua ngân hàng', 'Tiền mặt tại thủ quỹ'], required: true, default_value: 'Chuyển khoản qua ngân hàng' },
          { name: 'so_tai_khoan_ngan_hang', label: 'Số tài khoản / Ngân hàng', type: 'text', required: true, default_value: '1903456789999 - Techcombank Chi nhánh Thăng Long' },
          { name: 'chung_tu_kem_theo', label: 'Chứng từ gốc kèm theo', type: 'text', required: false, default_value: '02 Hóa đơn GTGT điện tử, 01 Biên bản giao hàng' }
        ]),
        created_by: 1
      },
      {
        code: 'TPL-BAN-GIAO',
        name: 'Biên bản bàn giao thiết bị / tài sản',
        description: 'Biên bản giao nhận máy tính, laptop, thiết bị văn phòng, máy móc hoặc tài sản công ty',
        category_id: 3,
        file_path: '/uploads/templates/bien_ban_ban_giao.docx',
        file_name: 'bien_ban_ban_giao.docx',
        file_type: 'docx',
        file_size: buffer3.length,
        fields_schema: JSON.stringify([
          { name: 'so_bien_ban', label: 'Số biên bản', type: 'text', required: true, default_value: 'BBBG-2026-104' },
          { name: 'ngay_lap_bien_ban', label: 'Ngày lập biên bản', type: 'date', required: true, default_value: '2026-10-01' },
          { name: 'dia_diem_ban_giao', label: 'Địa điểm bàn giao', type: 'text', required: true, default_value: 'Phòng IT - Tầng 5 Tòa nhà Công Nghệ' },
          { name: 'ben_giao_ho_ten', label: 'Họ tên Bên Giao (Bên A)', type: 'text', required: true, default_value: 'Quản trị viên Hệ Thống' },
          { name: 'ben_giao_chuc_vu', label: 'Chức vụ Bên Giao', type: 'text', required: true, default_value: 'Trưởng nhóm IT Admin' },
          { name: 'ben_giao_phong_ban', label: 'Bộ phận Bên Giao', type: 'text', required: true, default_value: 'Phòng Công Nghệ Thông Tin' },
          { name: 'ben_nhan_ho_ten', label: 'Họ tên Bên Nhận (Bên B)', type: 'text', required: true, default_value: 'Trần Thị Nhân Viên' },
          { name: 'ben_nhan_chuc_vu', label: 'Chức vụ Bên Nhận', type: 'text', required: true, default_value: 'Chuyên viên Kế toán' },
          { name: 'ben_nhan_phong_ban', label: 'Bộ phận Bên Nhận', type: 'text', required: true, default_value: 'Phòng Kế Toán & Vận Hành' },
          { name: 'ten_tai_san', label: 'Tên thiết bị / Tài sản', type: 'text', required: true, default_value: 'Laptop Dell Latitude 7420 Core i7 / 16GB RAM / 512GB SSD' },
          { name: 'so_luong', label: 'Số lượng', type: 'text', required: true, default_value: '01 bộ' },
          { name: 'ma_serial', label: 'Số Serial / Service Tag', type: 'text', required: true, default_value: 'DELL-LT-7420-VN987' },
          { name: 'tinh_trang_thiet_bi', label: 'Tình trạng kỹ thuật', type: 'text', required: true, default_value: 'Mới 100%, hoạt động ổn định, cài sẵn Windows & Office bản quyền' },
          { name: 'phu_kien_kem_theo', label: 'Phụ kiện kèm theo', type: 'text', required: false, default_value: '01 Sạc Type-C 65W, 01 Chuột không dây Logitech, 01 Cặp chống sốc' },
          { name: 'ghi_chu', label: 'Ghi chú / Trách nhiệm', type: 'textarea', required: false, default_value: 'Bên nhận có trách nhiệm bảo quản tài sản được giao và hoàn trả khi có yêu cầu điều chuyển.' }
        ]),
        created_by: 1
      }
    ];

    for (const t of templates) {
      await connection.query(
        `INSERT INTO templates (code, name, description, category_id, file_path, file_name, file_type, file_size, fields_schema, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), fields_schema=VALUES(fields_schema), file_path=VALUES(file_path), file_size=VALUES(file_size)`,
        [t.code, t.name, t.description, t.category_id, t.file_path, t.file_name, t.file_type, t.file_size, t.fields_schema, t.created_by]
      );
    }
    console.log('✔ Đã lưu thông tin 3 templates vào cơ sở dữ liệu.');
  } finally {
    await connection.end();
  }
}

generateSampleDocxTemplates().catch(err => {
  console.error(err);
  process.exit(1);
});
