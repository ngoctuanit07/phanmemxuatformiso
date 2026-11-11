'use client';

import { useRef } from 'react';

export const FQC_TEMPLATE_CODES = new Set([
  'FQC-002-02',
  'FQC-003-02',
  'FQC-004-02',
  'FQC-005-02',
  'FQC-012-01',
  'FQC-005-02-14STD',
  'FQC-005-V2-ASFV',
  'FQC-013-01'
]);

function DateTextOrPickerInput({ value, onChange, placeholder = 'dd/mm/yyyy' }) {
  const hiddenDateRef = useRef(null);

  const handleCalendarPick = (e) => {
    const iso = e.target.value;
    if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, d] = iso.split('-');
      onChange(`${d}/${m}/${y}`);
    }
  };

  return (
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        title="Chọn ngày từ lịch"
        onClick={() => {
          if (hiddenDateRef.current) {
            if (hiddenDateRef.current.showPicker) {
              hiddenDateRef.current.showPicker();
            } else {
              hiddenDateRef.current.click();
            }
          }
        }}
      >
        <i className="bi bi-calendar3"></i>
      </button>
      <input
        ref={hiddenDateRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
        onChange={handleCalendarPick}
      />
    </div>
  );
}

function ConclusionToggle({ value, onChange }) {
  const isPass = value === 'Pass/Đạt';
  const isFail = value === 'Fail/K.Đạt';

  return (
    <div className="btn-group btn-group-sm" role="group" aria-label="Kết luận dòng">
      <button
        type="button"
        className={`btn ${isPass ? 'btn-success fw-bold' : 'btn-outline-secondary'}`}
        onClick={() => onChange(isPass ? '' : 'Pass/Đạt')}
        title="Chọn Đạt (bấm lần nữa để bỏ chọn)"
      >
        Đạt
      </button>
      <button
        type="button"
        className={`btn ${isFail ? 'btn-danger fw-bold' : 'btn-outline-secondary'}`}
        onClick={() => onChange(isFail ? '' : 'Fail/K.Đạt')}
        title="Chọn Không đạt (bấm lần nữa để bỏ chọn)"
      >
        K. Đạt
      </button>
    </div>
  );
}

function buildMixRows({ block, testNum, klGroup, prefix, isNoCtNeg = false }) {
  const rows = [];
  for (const m of block) {
    m.channels.forEach((ch, idx) => {
      const chLower = ch.name.toLowerCase();
      const level = ch.level || `${ch.name}: No Ct`;
      const dev = ch.dev || '-';
      rows.push({
        mixLabel: idx === 0 ? m.label : null,
        mixSpan: idx === 0 ? m.channels.length : 0,
        channel: ch.name,
        levelFixed: level,
        devFixed: dev,
        resultKey: `${prefix}_test${testNum}_${m.key}_${chLower}_ket_qua`,
        placeholder: level.includes('No Ct') ? 'No hoặc Ct...' : undefined,
        isNoCtExpected: level.includes('No Ct') || isNoCtNeg,
        conclusionKey: `kl_${klGroup}_${testNum}_${m.key}_${chLower}`
      });
    });
  }
  return rows;
}

function buildFqcTableSpec(templateCode) {
  if (templateCode === 'FQC-002-02') {
    return {
      noSuffix: '/PQCCPDT',
      hasControlLotAndSerialRows: true,
      hasMixCol: false,
      hasHexStandardInputs: true,
      volumeLevelFixed: null,
      groups: [
        {
          id: 2,
          title: 'Chứng dương (Positive Control)',
          tests: [1, 2, 3].map((t) => ({
            testNum: t,
            rows: [
              { channel: 'Fam', levelFixed: 'Fam: 26.00 Ct', devFixed: '± 1.50 Ct', resultKey: `cd_test${t}_fam_ket_qua`, conclusionKey: `kl_2_${t}_fam` },
              { channel: 'Hex', levelKey: `cd_test${t}_hex_muc_chat_luong`, devKey: `cd_test${t}_hex_do_lech`, resultKey: `cd_test${t}_hex_ket_qua`, conclusionKey: `kl_2_${t}_hex` }
            ]
          }))
        },
        {
          id: 3,
          title: 'Chứng âm (Negative Control)',
          tests: [1, 2].map((t) => ({
            testNum: t,
            rows: [
              { channel: 'Fam', levelFixed: 'Fam: No Ct', devFixed: '-', resultKey: `ca_test${t}_fam_ket_qua`, placeholder: 'No hoặc Ct...', conclusionKey: `kl_3_${t}_fam` },
              { channel: 'Hex', levelKey: `ca_test${t}_hex_muc_chat_luong`, devKey: `ca_test${t}_hex_do_lech`, resultKey: `ca_test${t}_hex_ket_qua`, conclusionKey: `kl_3_${t}_hex` }
            ]
          }))
        }
      ]
    };
  }

  if (templateCode === 'FQC-003-02') {
    const mixes = ['A', 'B', 'C'];
    return {
      noSuffix: '/PQCCPDT',
      hasControlLotAndSerialRows: true,
      hasMixCol: false,
      hasHexStandardInputs: false,
      volumeLevelFixed: '20.0 µl',
      groups: [
        {
          id: 2,
          title: 'Chứng dương (Positive Control)',
          tests: [1, 2, 3].map((t) => ({
            testNum: t,
            rows: mixes.map((m) => ({
              channel: 'Fam',
              levelFixed: `Mix ${m} - Fam: 26.00 Ct`,
              devFixed: '± 1.50 Ct',
              resultKey: `cd_test${t}_mix${m.toLowerCase()}_fam_ket_qua`,
              conclusionKey: `kl_2_${t}_mix${m.toLowerCase()}`
            }))
          }))
        },
        {
          id: 3,
          title: 'Chứng âm (Negative Control)',
          tests: [1, 2].map((t) => ({
            testNum: t,
            rows: mixes.map((m) => ({
              channel: 'Fam',
              levelFixed: `Mix ${m} - Fam: No Ct`,
              devFixed: '-',
              resultKey: `ca_test${t}_mix${m.toLowerCase()}_fam_ket_qua`,
              placeholder: 'No hoặc Ct...',
              conclusionKey: `kl_3_${t}_mix${m.toLowerCase()}`
            }))
          }))
        }
      ]
    };
  }

  if (templateCode === 'FQC-004-02') {
    const subRows = [
      { mix: 'Mix 1.6', mKey: 'm16', ch: 'Fam' },
      { mix: 'Mix 1.6', mKey: 'm16', ch: 'Hex' },
      { mix: 'Mix 2.3', mKey: 'm23', ch: 'Fam' },
      { mix: 'Mix 2.3', mKey: 'm23', ch: 'Hex' }
    ];
    return {
      noSuffix: '/PQCCPDT',
      hasControlLotAndSerialRows: true,
      hasMixCol: true,
      hasHexStandardInputs: false,
      volumeLevelFixed: '15.0 µl',
      groups: [
        {
          id: 2,
          title: 'Chứng dương (Positive Control)',
          tests: [1, 2, 3].map((t) => ({
            testNum: t,
            rows: subRows.map((r, idx) => ({
              mixLabel: idx % 2 === 0 ? r.mix : null,
              mixSpan: idx % 2 === 0 ? 2 : 0,
              channel: r.ch,
              levelFixed: `${r.ch}: 26.00 Ct`,
              devFixed: '± 1.50 Ct',
              resultKey: `cd_test${t}_${r.mKey}_${r.ch.toLowerCase()}_ket_qua`,
              conclusionKey: `kl_2_${t}_${r.mKey}_${r.ch.toLowerCase()}`
            }))
          }))
        },
        {
          id: 3,
          title: 'Chứng âm (Negative Control)',
          tests: [1, 2].map((t) => ({
            testNum: t,
            rows: subRows.map((r, idx) => ({
              mixLabel: idx % 2 === 0 ? r.mix : null,
              mixSpan: idx % 2 === 0 ? 2 : 0,
              channel: r.ch,
              levelFixed: `${r.ch}: No Ct`,
              devFixed: '-',
              resultKey: `ca_test${t}_${r.mKey}_${r.ch.toLowerCase()}_ket_qua`,
              placeholder: 'No hoặc Ct...',
              conclusionKey: `kl_3_${t}_${r.mKey}_${r.ch.toLowerCase()}`
            }))
          }))
        }
      ]
    };
  }

  if (templateCode === 'FQC-012-01') {
    const posBlock = [
      {
        label: 'Mix 1',
        key: 'm1',
        channels: [
          { name: 'Fam', level: 'Fam: 22.50 Ct', dev: '± 1.50 Ct' },
          { name: 'Rox', level: 'Rox: 25.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Cy5', level: 'Cy5: 24.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Hex', level: 'Hex: No Ct', dev: '-' }
        ]
      },
      {
        label: 'Mix 2',
        key: 'm2',
        channels: [
          { name: 'Fam', level: 'Fam: 22.50 Ct', dev: '± 1.50 Ct' },
          { name: 'Hex', level: 'Hex: 22.50 Ct', dev: '± 1.50 Ct' },
          { name: 'Rox', level: 'Rox: 22.50 Ct', dev: '± 1.50 Ct' },
          { name: 'Cy5', level: 'Cy5: 22.50 Ct', dev: '± 1.50 Ct' }
        ]
      }
    ];
    const negBlock = [
      {
        label: 'Mix 1',
        key: 'm1',
        channels: [
          { name: 'Fam' },
          { name: 'Rox' },
          { name: 'Cy5' },
          { name: 'Hex', level: 'Hex: ≤ 35 Ct' }
        ]
      },
      {
        label: 'Mix 2',
        key: 'm2',
        channels: [{ name: 'Fam' }, { name: 'Hex' }, { name: 'Rox' }, { name: 'Cy5' }]
      }
    ];
    return {
      noSuffix: '/PQCCPVA',
      hasControlLotAndSerialRows: false,
      hasMixCol: true,
      hasHexStandardInputs: false,
      volumeLevelFixed: '20.0 µl',
      groups: [
        {
          id: 2,
          title: 'Chứng dương (Positive Control)',
          tests: [{ testNum: 1, rows: buildMixRows({ block: posBlock, testNum: 1, klGroup: 2, prefix: 'cd' }) }]
        },
        {
          id: 3,
          title: 'Chứng âm (Negative Control)',
          tests: [1, 2].map((t) => ({
            testNum: t,
            rows: buildMixRows({ block: negBlock, testNum: t, klGroup: 3, prefix: 'ca' })
          }))
        }
      ]
    };
  }

  if (templateCode === 'FQC-005-02-14STD') {
    const posBlock = [
      {
        label: 'Mix 1',
        key: 'm1',
        channels: [
          { name: 'Fam', level: 'Fam: 30.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Cy3', level: 'Cy3: 23.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Cy5', level: 'Cy5: No Ct', dev: '-' }
        ]
      },
      {
        label: 'Mix 2',
        key: 'm2',
        channels: [
          { name: 'Fam', level: 'Fam: 24.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Hex', level: 'Hex: 26.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Rox', level: 'Rox: 27.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Cy5', level: 'Cy5: 22.00 Ct', dev: '± 1.50 Ct' }
        ]
      },
      {
        label: 'Mix 3',
        key: 'm3',
        channels: [
          { name: 'Fam', level: 'Fam: 26.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Rox', level: 'Rox: 25.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Cy3', level: 'Cy3: 21.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Cy5', level: 'Cy5: 24.00 Ct', dev: '± 1.50 Ct' }
        ]
      },
      {
        label: 'Mix 4',
        key: 'm4',
        channels: [
          { name: 'Fam', level: 'Fam: 26.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Rox', level: 'Rox: 30.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Cy3', level: 'Cy3: 23.00 Ct', dev: '± 1.50 Ct' },
          { name: 'Cy5', level: 'Cy5: 25.00 Ct', dev: '± 1.50 Ct' }
        ]
      }
    ];
    const negBlock = [
      {
        label: 'Mix 1',
        key: 'm1',
        channels: [
          { name: 'Fam' },
          { name: 'Cy3' },
          { name: 'Cy5', level: 'Cy5: ≤ 34 Ct' }
        ]
      },
      {
        label: 'Mix 2',
        key: 'm2',
        channels: [{ name: 'Fam' }, { name: 'Hex' }, { name: 'Rox' }, { name: 'Cy5' }]
      },
      {
        label: 'Mix 3',
        key: 'm3',
        channels: [{ name: 'Fam' }, { name: 'Rox' }, { name: 'Cy3' }, { name: 'Cy5' }]
      },
      {
        label: 'Mix 4',
        key: 'm4',
        channels: [{ name: 'Fam' }, { name: 'Rox' }, { name: 'Cy3' }, { name: 'Cy5' }]
      }
    ];
    return {
      noSuffix: '/PQCCPVA',
      hasControlLotAndSerialRows: false,
      hasMixCol: true,
      hasHexStandardInputs: false,
      volumeLevelFixed: '15.0 µl',
      groups: [
        {
          id: 2,
          title: 'Chứng dương (Positive Control)',
          tests: [{ testNum: 1, rows: buildMixRows({ block: posBlock, testNum: 1, klGroup: 2, prefix: 'cd' }) }]
        },
        {
          id: 3,
          title: 'Chứng âm (Negative Control)',
          tests: [1, 2].map((t) => ({
            testNum: t,
            rows: buildMixRows({ block: negBlock, testNum: t, klGroup: 3, prefix: 'ca' })
          }))
        }
      ]
    };
  }

  if (templateCode === 'FQC-005-V2-ASFV') {
    return {
      noSuffix: '/PQCCPVA',
      hasControlLotAndSerialRows: false,
      hasMixCol: false,
      hasHexStandardInputs: false,
      volumeLevelFixed: '20.0 µl',
      groups: [
        {
          id: 2,
          title: 'Chứng dương (Positive Control)',
          tests: [1, 2, 3].map((t) => ({
            testNum: t,
            rows: [
              { channel: 'Fam', levelFixed: 'Fam: 26.00 Ct', devFixed: '± 1.5 Ct', resultKey: `cd_test${t}_fam_ket_qua`, conclusionKey: `kl_2_${t}_fam` },
              { channel: 'Hex', levelFixed: 'Hex: 27.00 Ct', devFixed: '± 1.5 Ct', resultKey: `cd_test${t}_hex_ket_qua`, conclusionKey: `kl_2_${t}_hex` }
            ]
          }))
        },
        {
          id: 3,
          title: 'Chứng âm (Negative Control)',
          tests: [1, 2].map((t) => ({
            testNum: t,
            rows: [
              { channel: 'Fam', levelFixed: 'Fam: No Ct', devFixed: '-', resultKey: `ca_test${t}_fam_ket_qua`, placeholder: 'No hoặc Ct...', conclusionKey: `kl_3_${t}_fam` },
              { channel: 'Hex', levelFixed: 'Hex: 27.00 Ct', devFixed: '± 1.50 Ct', resultKey: `ca_test${t}_hex_ket_qua`, conclusionKey: `kl_3_${t}_hex` }
            ]
          }))
        }
      ]
    };
  }

  if (templateCode === 'FQC-013-01') {
    return {
      noSuffix: '/PQCCPDT',
      hasControlLotAndSerialRows: false,
      hasMixCol: false,
      hasHexStandardInputs: false,
      volumeLevelFixed: '20.0 µl',
      groups: [
        {
          id: 2,
          title: 'Chứng dương (Positive Control)',
          tests: [1].map((t) => ({
            testNum: t,
            rows: [
              { channel: 'Fam', levelFixed: 'Fam: 26.00 Ct', devFixed: '± 1.50 Ct', resultKey: `cd_test${t}_fam_ket_qua`, conclusionKey: `kl_2_${t}_fam` },
              { channel: 'Rox', levelFixed: 'Rox: 26.00 Ct', devFixed: '± 1.50 Ct', resultKey: `cd_test${t}_rox_ket_qua`, conclusionKey: `kl_2_${t}_rox` },
              { channel: 'Hex', levelFixed: 'Hex: No Ct', devFixed: '-', resultKey: `cd_test${t}_hex_ket_qua`, placeholder: 'No hoặc Ct...', conclusionKey: `kl_2_${t}_hex` }
            ]
          }))
        },
        {
          id: 3,
          title: 'Chứng âm (Negative Control)',
          tests: [1, 2].map((t) => ({
            testNum: t,
            rows: [
              { channel: 'Fam', levelFixed: 'Fam: No Ct', devFixed: '-', resultKey: `ca_test${t}_fam_ket_qua`, placeholder: 'No hoặc Ct...', conclusionKey: `kl_3_${t}_fam` },
              { channel: 'Rox', levelFixed: 'Rox: No Ct', devFixed: '-', resultKey: `ca_test${t}_rox_ket_qua`, placeholder: 'No hoặc Ct...', conclusionKey: `kl_3_${t}_rox` },
              { channel: 'Hex', levelFixed: 'Hex: 24.50 Ct', devFixed: '± 7.50 Ct', resultKey: `ca_test${t}_hex_ket_qua`, conclusionKey: `kl_3_${t}_hex` }
            ]
          }))
        }
      ]
    };
  }

  // FQC-005-02 (NGN/CHT/GV/TV)
  return {
    noSuffix: '/PQCCPDT',
    hasControlLotAndSerialRows: true,
    hasMixCol: true,
    hasHexStandardInputs: true,
    volumeLevelFixed: '20.0 µl',
    groups: [
      {
        id: 2,
        title: 'Chứng dương (Positive Control)',
        tests: [1, 2, 3].map((t) => {
          const mix1 = t === 1 ? 'Mix 1' : 'Mix 1.6';
          const mix2 = t === 1 ? 'Mix 2' : 'Mix 2.3';
          return {
            testNum: t,
            rows: [
              { mixLabel: mix1, mixSpan: 3, channel: 'Fam', levelFixed: 'Fam: 22.50 Ct', devFixed: '± 1.50 Ct', resultKey: `cd_test${t}_fam_ket_qua`, conclusionKey: `kl_2_${t}_fam` },
              { channel: 'Rox', levelFixed: 'Rox: 22.50 Ct', devFixed: '± 1.50 Ct', resultKey: `cd_test${t}_rox_ket_qua`, conclusionKey: `kl_2_${t}_rox` },
              { channel: 'Hex', levelKey: `cd_test${t}_hex_muc_chat_luong`, devKey: `cd_test${t}_hex_do_lech`, resultKey: `cd_test${t}_hex_ket_qua`, conclusionKey: `kl_2_${t}_hex` },
              { mixLabel: mix2, mixSpan: 2, channel: 'Cy3', levelFixed: 'Cy3: 22.50 Ct', devFixed: '± 1.50 Ct', resultKey: `cd_test${t}_cy3_ket_qua`, conclusionKey: `kl_2_${t}_cy3` },
              { channel: 'Cy5', inputPrefix: 'Cy5', levelFixed: 'Cy5: 22.50 Ct', devFixed: '± 1.50 Ct', resultKey: `cd_test${t}_cy5_ket_qua`, conclusionKey: `kl_2_${t}_cy5` }
            ]
          };
        })
      },
      {
        id: 3,
        title: 'Chứng âm (Negative Control)',
        tests: [1, 2].map((t) => ({
          testNum: t,
          rows: [
            { mixLabel: 'Mix 1.6', mixSpan: 3, channel: 'Fam', levelFixed: 'Fam: No Ct', devFixed: '-', resultKey: `ca_test${t}_fam_ket_qua`, placeholder: 'No hoặc Ct...', conclusionKey: `kl_3_${t}_fam` },
            { channel: 'Rox', levelFixed: 'Rox: No Ct', devFixed: '-', resultKey: `ca_test${t}_rox_ket_qua`, placeholder: 'No hoặc Ct...', conclusionKey: `kl_3_${t}_rox` },
            { channel: 'Hex', levelKey: `ca_test${t}_hex_muc_chat_luong`, devKey: `ca_test${t}_hex_do_lech`, resultKey: `ca_test${t}_hex_ket_qua`, conclusionKey: `kl_3_${t}_hex` },
            { mixLabel: 'Mix 2.3', mixSpan: 2, channel: 'Cy3', levelFixed: 'Cy3: No Ct', devFixed: '-', resultKey: `ca_test${t}_cy3_ket_qua`, placeholder: 'No hoặc Ct...', conclusionKey: `kl_3_${t}_cy3` },
            { channel: 'Cy5', inputPrefix: 'Cy5', levelFixed: 'Cy5: No Ct', devFixed: '-', resultKey: `ca_test${t}_cy5_ket_qua`, placeholder: 'No hoặc Ct...', conclusionKey: `kl_3_${t}_cy5` }
          ]
        }))
      }
    ]
  };
}

export default function FqcTestingForm({ templateCode, formData, onChange, onBatchChange }) {
  const val = (key) => (formData[key] !== undefined && formData[key] !== null ? formData[key] : '');
  const spec = buildFqcTableSpec(templateCode);

  const copyPositiveHexStandards = () => {
    onBatchChange({
      cd_test2_hex_muc_chat_luong: val('cd_test1_hex_muc_chat_luong'),
      cd_test2_hex_do_lech: val('cd_test1_hex_do_lech'),
      cd_test3_hex_muc_chat_luong: val('cd_test1_hex_muc_chat_luong'),
      cd_test3_hex_do_lech: val('cd_test1_hex_do_lech')
    });
  };

  const copyNegativeHexStandards = () => {
    onBatchChange({
      ca_test2_hex_muc_chat_luong: val('ca_test1_hex_muc_chat_luong'),
      ca_test2_hex_do_lech: val('ca_test1_hex_do_lech')
    });
  };

  const noCtRows = spec.groups.flatMap((g) =>
    g.tests.flatMap((t) => t.rows.filter((r) => (r.levelFixed || '').includes('No Ct')))
  );

  const fillEmptyNoCtRows = () => {
    const patch = {};
    for (const r of noCtRows) {
      if (!val(r.resultKey).trim()) {
        patch[r.resultKey] = 'No';
      }
    }
    if (Object.keys(patch).length > 0) {
      onBatchChange(patch);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Section 1: Thông tin chung & Sản phẩm (chung cho các phiếu FQC) */}
      <div>
        <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
          <span className="badge bg-primary rounded-pill">Phần 1</span>
          <h6 className="mb-0 fw-bold text-primary">Thông Tin Lô Sản Xuất &amp; Lấy Mẫu</h6>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold text-dark mb-1">
              Bộ phận <span className="text-muted fw-normal">(Department)</span> <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={val('bo_phan')}
              onChange={(e) => onChange('bo_phan', e.target.value)}
              placeholder="VD: KTCL / QC"
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold text-dark mb-1">
              Số phiếu <span className="text-muted fw-normal">(No.)</span> <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={val('so_phieu')}
                onChange={(e) => onChange('so_phieu', e.target.value)}
                placeholder="VD: 015/2026"
              />
              <span className="input-group-text font-monospace bg-light">{spec.noSuffix || '/PQCCPDT'}</span>
            </div>
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold text-dark mb-1">
              Tên sản phẩm <span className="text-muted fw-normal">(Name of product)</span> <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={val('ten_san_pham')}
              onChange={(e) => onChange('ten_san_pham', e.target.value)}
              placeholder="Nhập tên bán thành phẩm..."
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold text-dark mb-1">
              Mã code <span className="text-muted fw-normal">(Code)</span> <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={val('ma_code')}
              onChange={(e) => onChange('ma_code', e.target.value)}
              placeholder="Nhập mã code sản phẩm..."
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold text-dark mb-1">
              Ngày sản xuất <span className="text-muted fw-normal">(Date of manufacture)</span> <span className="text-danger">*</span>
            </label>
            <DateTextOrPickerInput
              value={val('ngay_san_xuat')}
              onChange={(v) => onChange('ngay_san_xuat', v)}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold text-dark mb-1">
              Số Lot <span className="text-muted fw-normal">(Lot number)</span> <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={val('so_lot')}
              onChange={(e) => onChange('so_lot', e.target.value)}
              placeholder="VD: LOT261101"
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold text-dark mb-1">
              Hạn sử dụng sản phẩm <span className="text-muted fw-normal">(Expiry date)</span> <span className="text-danger">*</span>
            </label>
            <DateTextOrPickerInput
              value={val('han_su_dung')}
              onChange={(v) => onChange('han_su_dung', v)}
              placeholder="dd/mm/yyyy hoặc mm/yyyy"
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold text-dark mb-1">
              Số lượng sản xuất <span className="text-muted fw-normal">(Total)</span>
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={val('so_luong_san_xuat')}
                onChange={(e) => onChange('so_luong_san_xuat', e.target.value)}
                placeholder="VD: 1000"
              />
              <span className="input-group-text bg-light">Đơn vị: Test</span>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold text-dark mb-1">
              Số lượng mẫu lấy <span className="text-muted fw-normal">(Tested samples)</span>
            </label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={val('so_luong_mau_lay')}
                onChange={(e) => onChange('so_luong_mau_lay', e.target.value)}
                placeholder="VD: 10"
              />
              <span className="input-group-text bg-light">Đơn vị: Test</span>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold text-dark mb-1">
              Phiếu lấy mẫu <span className="text-muted fw-normal">(Sampling sheet)</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={val('phieu_lay_mau')}
              onChange={(e) => onChange('phieu_lay_mau', e.target.value)}
              placeholder="VD: PLM-2611-01"
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold text-dark mb-1">
              Ngày lấy mẫu <span className="text-muted fw-normal">(Date of sampling)</span>
            </label>
            <DateTextOrPickerInput
              value={val('ngay_lay_mau')}
              onChange={(v) => onChange('ngay_lay_mau', v)}
            />
          </div>

          {spec.hasControlLotAndSerialRows && (
            <>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-dark mb-1">
                  Số lot chứng dương <span className="text-muted fw-normal">(Positive control lots)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={val('so_lot_chung_duong')}
                  onChange={(e) => onChange('so_lot_chung_duong', e.target.value)}
                  placeholder="Nhập số lot chứng dương..."
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-dark mb-1">
                  Hạn sử dụng chứng dương <span className="text-muted fw-normal">(Expiry date)</span>
                </label>
                <DateTextOrPickerInput
                  value={val('han_su_dung_chung_duong')}
                  onChange={(v) => onChange('han_su_dung_chung_duong', v)}
                  placeholder="dd/mm/yyyy hoặc mm/yyyy"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-dark mb-1">
                  Số lot chứng âm <span className="text-muted fw-normal">(Negative control lots)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={val('so_lot_chung_am')}
                  onChange={(e) => onChange('so_lot_chung_am', e.target.value)}
                  placeholder="Nhập số lot chứng âm..."
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-dark mb-1">
                  Hạn sử dụng chứng âm <span className="text-muted fw-normal">(Expiry date)</span>
                </label>
                <DateTextOrPickerInput
                  value={val('han_su_dung_chung_am')}
                  onChange={(v) => onChange('han_su_dung_chung_am', v)}
                  placeholder="dd/mm/yyyy hoặc mm/yyyy"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-dark mb-1">
                  Số seri máy <span className="text-muted fw-normal">(Machine serial number)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={val('so_seri_may')}
                  onChange={(e) => onChange('so_seri_may', e.target.value)}
                  placeholder="Nhập số seri máy chạy PCR..."
                />
              </div>
            </>
          )}

          <div className="col-12">
            <div className="bg-light border rounded px-3 py-2 d-flex flex-wrap justify-content-between gap-2 small text-muted">
              <span><strong>Quy trình KTCL:</strong> DQC-005</span>
              <span><strong>Điều kiện bảo quản:</strong> -20°C ± 5°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Bảng Kết Quả Kiểm Tra */}
      <div>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-2 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary rounded-pill">Phần 2</span>
            <h6 className="mb-0 fw-bold text-primary">Bảng Kết Quả Kiểm Tra Chất Lượng</h6>
          </div>
          {(spec.hasHexStandardInputs || noCtRows.length > 0) && (
            <div className="d-flex flex-wrap gap-2">
              {spec.hasHexStandardInputs && (
                <>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline-primary py-1 px-2"
                    style={{ fontSize: '0.78rem' }}
                    onClick={copyPositiveHexStandards}
                    title="Sao chép mức chất lượng và độ lệch Hex của Test 1 sang Test 2 và Test 3"
                  >
                    <i className="bi bi-files me-1"></i>Chép Hex Chứng dương T1 → T2, T3
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline-secondary py-1 px-2"
                    style={{ fontSize: '0.78rem' }}
                    onClick={copyNegativeHexStandards}
                    title="Sao chép mức chất lượng và độ lệch Hex của Test 1 sang Test 2"
                  >
                    <i className="bi bi-files me-1"></i>Chép Hex Chứng âm T1 → T2
                  </button>
                </>
              )}
              {noCtRows.length > 0 && (
                <button
                  type="button"
                  className="btn btn-xs btn-outline-info py-1 px-2"
                  style={{ fontSize: '0.78rem' }}
                  onClick={fillEmptyNoCtRows}
                  title="Điền giá trị 'No' vào các ô Kết quả đang trống có mức chất lượng No Ct"
                >
                  <i className="bi bi-magic me-1"></i>Điền &apos;No&apos; cho dòng No Ct
                </button>
              )}
            </div>
          )}
        </div>

        <div className="table-responsive">
          <table className="table table-bordered align-middle table-sm mb-0" style={{ fontSize: '0.88rem' }}>
            <thead className="table-light text-center">
              <tr>
                <th style={{ width: '44px' }}>Stt</th>
                <th style={{ width: '145px' }}>Tiêu chuẩn</th>
                <th style={{ width: '62px' }}>Test</th>
                {spec.hasMixCol && <th style={{ width: '74px' }}>Mix</th>}
                <th style={{ minWidth: '165px' }}>Mức chất lượng</th>
                <th style={{ minWidth: '110px' }}>Độ lệch</th>
                <th style={{ minWidth: '165px' }}>Kết quả</th>
                <th style={{ width: '116px' }}>Kết luận (tùy chọn)</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Uniform volume */}
              <tr>
                <td className="text-center fw-bold">1</td>
                <td>Độ đồng đều thể tích 1 test</td>
                <td className="text-center text-muted" colSpan={spec.hasMixCol ? 2 : 1}>-</td>
                <td>
                  {spec.volumeLevelFixed ? (
                    <span className="text-muted fw-semibold">{spec.volumeLevelFixed}</span>
                  ) : (
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        className="form-control"
                        value={val('the_tich_muc_chat_luong')}
                        onChange={(e) => onChange('the_tich_muc_chat_luong', e.target.value)}
                        placeholder="..."
                      />
                      <span className="input-group-text">µl</span>
                    </div>
                  )}
                </td>
                <td className="text-center fw-semibold text-muted">± 0.5 µl</td>
                <td>
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control"
                      value={val('the_tich_ket_qua')}
                      onChange={(e) => onChange('the_tich_ket_qua', e.target.value)}
                      placeholder="..."
                    />
                    <span className="input-group-text">µl</span>
                  </div>
                </td>
                <td className="text-center">
                  <ConclusionToggle value={val('kl_1')} onChange={(v) => onChange('kl_1', v)} />
                </td>
              </tr>

              {/* Dynamic Groups (2: Positive Control, 3: Negative Control) */}
              {spec.groups.map((group) => {
                const totalGroupRows = group.tests.reduce((sum, t) => sum + t.rows.length, 0);
                let isFirstRowOfGroup = true;

                return group.tests.flatMap((test) =>
                  test.rows.map((row, rIdx) => {
                    const renderGroupCell = isFirstRowOfGroup;
                    isFirstRowOfGroup = false;
                    const prefix = row.inputPrefix || row.channel;

                    return (
                      <tr key={`${group.id}-${test.testNum}-${rIdx}`}>
                        {renderGroupCell && (
                          <>
                            <td className="text-center fw-bold" rowSpan={totalGroupRows}>{group.id}</td>
                            <td className="fw-semibold" rowSpan={totalGroupRows}>{group.title}</td>
                          </>
                        )}
                        {rIdx === 0 && (
                          <td className="text-center fw-semibold" rowSpan={test.rows.length}>
                            Test {test.testNum}
                          </td>
                        )}
                        {spec.hasMixCol && row.mixLabel && (
                          <td className="text-center fw-semibold" rowSpan={row.mixSpan}>
                            {row.mixLabel}
                          </td>
                        )}
                        <td>
                          {row.levelFixed ? (
                            <span className="text-muted fw-semibold">{row.levelFixed}</span>
                          ) : (
                            <div className="input-group input-group-sm">
                              <span className="input-group-text">{row.channel}:</span>
                              <input
                                type="text"
                                className="form-control"
                                value={val(row.levelKey)}
                                onChange={(e) => onChange(row.levelKey, e.target.value)}
                                placeholder="..."
                              />
                              <span className="input-group-text">Ct</span>
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          {row.devFixed ? (
                            <span className="text-muted fw-semibold">{row.devFixed}</span>
                          ) : (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={val(row.devKey)}
                              onChange={(e) => onChange(row.devKey, e.target.value)}
                              placeholder="VD: ± 1.50 Ct"
                            />
                          )}
                        </td>
                        <td>
                          <div className="input-group input-group-sm">
                            <span className="input-group-text">{prefix}:</span>
                            <input
                              type="text"
                              className="form-control"
                              value={val(row.resultKey)}
                              onChange={(e) => onChange(row.resultKey, e.target.value)}
                              placeholder={row.placeholder || '...'}
                            />
                            <span className="input-group-text">Ct</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <ConclusionToggle
                            value={val(row.conclusionKey)}
                            onChange={(v) => onChange(row.conclusionKey, v)}
                          />
                        </td>
                      </tr>
                    );
                  })
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note about Image 2 untouched fields */}
      <div className="alert alert-secondary mb-0 small d-flex align-items-start gap-2">
        <i className="bi bi-info-circle-fill fs-5 text-primary mt-1"></i>
        <div>
          <strong>Phần ký duyệt &amp; kết luận cuối phiếu (Hình thứ 2) được giữ nguyên định dạng trống:</strong>{' '}
          Các mục <em>Conclusion/ Kết luận (Pass/Fail)</em>, <em>Recommend/ Kiến nghị</em>, <em>Date/ Ngày… tháng… năm 20…</em> và chữ ký (<em>QC staff</em>, <em>QC manager</em>, <em>Board of QA / QA department</em>) sẽ giữ nguyên dấu chấm <code>....</code> và ô vuông trống trên bản in để điền tay và ký duyệt trực tiếp.
        </div>
      </div>
    </div>
  );
}
