# Session Handoff

- **Project:** phanmemxuatformiso (Next.js 14.2.35, MySQL, Bootstrap 5)
- **Branch / git commit:** `main` (`384a72e` + uncommitted changes: BUGFIX-001/002/003/004, REDESIGN-001..004)
- **Active task ID:** none (`BUGFIX-004` DONE; next pending in UI roadmap: `REDESIGN-005`)
- **Current status:** Đã xóa button lưu CSDL dư thừa trong `app/fill/page.js`; `LƯU & IN RA MÁY IN LOCAL` lưu DB rồi in local đúng yêu cầu.

## Verified completed work

### BUGFIX-004 — Bỏ button lưu CSDL dư thừa trong `Thao Tác & Kết Nối Máy In Local`
- `app/fill/page.js` (dùng chung cho cả template ISO và thường quy qua `TemplateList` -> `/fill/[templateId]` -> `/fill?template_id=...`): xóa nút phụ `Lưu Dữ Liệu Vào Cơ Sở Dữ Liệu` / `Lưu Cập Nhật Vào CSDL` (`onClick={() => saveFormRecord(false)}`).
- Giữ nguyên nút chính `LƯU & IN RA MÁY IN LOCAL` (`handleSaveAndPrint(false)`), thực hiện `await saveFormRecord(false)` lưu vào MySQL rồi gửi lệnh in local qua `printIframeRef` (`/api/records/${recordId}/print`).
- `scripts/test-fill-save-print-regression.js` & `package.json` (`test:fill-print`): thêm regression test xác minh luồng và cấu trúc nút bấm.

## Tests actually executed
- `node scripts/test-fill-save-print-regression.js` → **5 PASS, 0 FAIL**
- `npm run build` (`next build`) → **exit 0**, Compiled successfully, 21/21 static pages

## Blockers / uncertainties
- Không có blocker kỹ thuật. (Chưa chạy E2E trình duyệt trực tiếp cho hộp thoại in Windows).

## Next concrete action
- Triển khai **REDESIGN-005** (`docs/design/UI_ROADMAP.md`): Mobile sidebar drawer (responsive offcanvas drawer trên `<768px`, keyboard-navigable, WCAG 2.2 AA).
