/**
 * Regression test for BUGFIX-004:
 * Verify that in app/fill/page.js (shared by both ISO and Regular templates):
 * 1. The redundant standalone "Lưu Dữ Liệu Vào Cơ Sở Dữ Liệu" / "Lưu Cập Nhật Vào CSDL" button is removed.
 * 2. The primary "LƯU & IN RA MÁY IN LOCAL" button calls handleSaveAndPrint(false).
 * 3. handleSaveAndPrint saves to the database via saveFormRecord(...) before triggering local print.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`FAIL: ${name}\n  ${err.message}`);
    failed++;
  }
}

const fillPage = fs.readFileSync(path.join(root, 'app/fill/page.js'), 'utf8');
const fillDynamicPage = fs.readFileSync(path.join(root, 'app/fill/[templateId]/page.js'), 'utf8');
const templateList = fs.readFileSync(path.join(root, 'components/TemplateList.js'), 'utf8');

test('TemplateList routes both ISO and Regular templates to /fill/${id}', () => {
  assert(templateList.includes('/fill/${tpl.id}'), 'TemplateList should link to /fill/${tpl.id}');
  assert(fillDynamicPage.includes('/fill?template_id=${params.templateId}'), 'Dynamic fill route should redirect to /fill?template_id=...');
});

test('Redundant standalone DB-save button is removed from Thao Tác & Kết Nối Máy In Local', () => {
  assert(!fillPage.includes('Lưu Dữ Liệu Vào Cơ Sở Dữ Liệu'), 'Redundant button label "Lưu Dữ Liệu Vào Cơ Sở Dữ Liệu" still exists');
  assert(!fillPage.includes('Lưu Cập Nhật Vào CSDL'), 'Redundant button label "Lưu Cập Nhật Vào CSDL" still exists');
  assert(!fillPage.includes('saveFormRecord(false)'), 'Standalone onClick saveFormRecord(false) button still exists');
});

test('Primary Save & Print button is present and wired to handleSaveAndPrint(false)', () => {
  assert(fillPage.includes('Thao Tác & Kết Nối Máy In Local'), 'Action panel header missing');
  assert(fillPage.includes('LƯU & IN RA MÁY IN LOCAL'), 'Primary button label missing');
  assert(fillPage.includes('CẬP NHẬT & IN LẠI RA MÁY IN LOCAL'), 'Primary update button label missing');
  assert(fillPage.includes('onClick={() => handleSaveAndPrint(false)}'), 'Primary button not wired to handleSaveAndPrint(false)');
});

test('handleSaveAndPrint saves to DB first, then triggers local print', () => {
  const fnMatch = fillPage.match(/const handleSaveAndPrint = async \(saveAsNew = false\) => \{[\s\S]*?\n  \};/);
  assert(fnMatch, 'handleSaveAndPrint function not found');
  const fnBody = fnMatch[0];

  const saveIdx = fnBody.indexOf('await saveFormRecord(saveAsNew)');
  const guardIdx = fnBody.indexOf('if (!recordId)');
  const printUrlIdx = fnBody.indexOf('/api/records/${recordId}/print');
  const printCallIdx = fnBody.indexOf('contentWindow.print()');

  assert(saveIdx !== -1, 'handleSaveAndPrint must await saveFormRecord(saveAsNew)');
  assert(guardIdx > saveIdx, 'handleSaveAndPrint must abort if saveFormRecord fails');
  assert(printUrlIdx > guardIdx, 'handleSaveAndPrint must build /api/records/${recordId}/print after saving');
  assert(printCallIdx > printUrlIdx, 'handleSaveAndPrint must trigger contentWindow.print() after setting printUrl');
});

test('saveFormRecord persists to /api/records (POST/PUT)', () => {
  assert(fillPage.includes("fetch('/api/records'"), 'saveFormRecord must POST to /api/records');
  assert(fillPage.includes('fetch(`/api/records/${savedRecord.id}`'), 'saveFormRecord must PUT to /api/records/${savedRecord.id}');
});

console.log(`\nSummary: ${passed} PASS, ${failed} FAIL`);
process.exit(failed > 0 ? 1 : 0);
