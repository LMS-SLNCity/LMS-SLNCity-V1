import React, { useEffect, useRef } from 'react';
import { VisitTest, Visit, Signatory } from '../types';
import { useAppContext } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';

// Barcode component
const BarcodeComponent: React.FC<{ value: string }> = ({ value }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && typeof window !== 'undefined') {
      try {
        import('jsbarcode').then((JsBarcode) => {
          if (barcodeRef.current) {
            JsBarcode.default(barcodeRef.current, value, {
              format: 'CODE128',
              width: 1.5,
              height: 40,
              displayValue: false,
            });
          }
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [value]);

  return <svg ref={barcodeRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }}></svg>;
};

interface TestReportProps {
  visit: Visit;
  signatory: Signatory;
  canEdit: boolean;
  onEdit: (test: VisitTest) => void;
}

const formatAge = (p: Visit['patient']) => {
  if (p.age_years > 0) return `${p.age_years} Year(s)`;
  if (p.age_months > 0) return `${p.age_months} Month(s)`;
  if (p.age_days > 0) return `${p.age_days} Day(s)`;
  return 'N/A';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '');
};

export const TestReport: React.FC<TestReportProps> = ({ visit, signatory, canEdit, onEdit }) => {
  const { visitTests } = useAppContext();

  const approvedTestsForVisit = visit.tests
    .map(testId => visitTests.find(vt => vt.id === testId && vt.status === 'APPROVED'))
    .filter(Boolean) as VisitTest[];

  if (!visit) {
    return <div className="bg-white p-8 max-w-4xl mx-auto text-red-500">Error: Visit data not found.</div>;
  }
  if (approvedTestsForVisit.length === 0) {
    return <div className="bg-white p-8 max-w-4xl mx-auto text-yellow-600">Report not ready. No approved tests found for this visit.</div>;
  }

  const firstTest = approvedTestsForVisit[0];
  const doctorName = visit.referred_doctor_id ? `Dr. ID: ${visit.referred_doctor_id}` : visit.other_ref_doctor || 'N/A';

  const testsByCategory = approvedTestsForVisit.reduce((acc, test) => {
    const category = test.template.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(test);
    return acc;
  }, {} as Record<string, VisitTest[]>);

  return (
    <>
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          #test-report {
            box-shadow: none !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0.4in !important;
          }
          .screen-footer {
            display: none !important;
          }
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        td, th {
          border: 1px solid #000;
          padding: 4px 6px;
          text-align: left;
        }
        th {
          background-color: #e5e5e5;
          font-weight: bold;
        }
      `}</style>

      <div id="test-report" className="bg-white max-w-4xl mx-auto" style={{ padding: '0.4in', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>

        {/* PATIENT INFORMATION - 2 Column Layout */}
        <div className="flex justify-between mb-6 gap-8">
          {/* LEFT COLUMN - Patient Details */}
          <div className="flex-1 text-xs space-y-1">
            <div className="flex">
              <span className="font-bold">Patient Name</span>
              <span className="ml-1">: {visit.patient.name}</span>
            </div>
            <div className="flex">
              <span className="font-bold">Age / Gender</span>
              <span className="ml-1">: {formatAge(visit.patient)} / {visit.patient.sex}</span>
            </div>
            <div className="flex">
              <span className="font-bold">Sample Type</span>
              <span className="ml-1">: {visit.sample_type || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-bold">Client Code</span>
              <span className="ml-1">: {visit.ref_customer_id || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-bold">Referred By</span>
              <span className="ml-1">: {doctorName}</span>
            </div>
          </div>

          {/* RIGHT COLUMN - Barcode + Patient ID + Dates */}
          <div className="flex flex-col items-end text-xs space-y-2">
            {/* Barcode */}
            <div className="w-40">
              <BarcodeComponent value={visit.visit_code} />
            </div>

            {/* Patient ID and Dates */}
            <div className="text-right space-y-0.5 text-xs">
              <div>
                <span className="font-bold">Patient Id</span>
                <span className="ml-2">{visit.visit_code}</span>
              </div>
              <div>
                <span className="font-bold">Sample Drawn Date</span>
                <span className="ml-2">{formatDate(visit.sample_drawn_datetime)}</span>
              </div>
              <div>
                <span className="font-bold">Registration Date</span>
                <span className="ml-2">{formatDate(visit.registration_datetime)}</span>
              </div>
              <div>
                <span className="font-bold">Reported Date</span>
                <span className="ml-2">{formatDate(firstTest.approvedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TEST RESULTS SECTION */}
        <div className="mt-6">
          {Object.entries(testsByCategory).map(([category, tests]) => (
            <div key={category} className="mb-4">
              {/* Category Header - Gray Background */}
              <div className="bg-gray-300 border border-black py-1 px-2 mb-2">
                <h3 className="font-bold text-sm text-black uppercase">{category}</h3>
              </div>

              {/* Results Table */}
              <table className="w-full text-xs border border-black mb-4">
                <thead>
                  <tr className="bg-gray-300">
                    <th className="border border-black px-3 py-2 text-left">TEST DESCRIPTION</th>
                    <th className="border border-black px-3 py-2 text-center w-20">RESULT</th>
                    <th className="border border-black px-3 py-2 text-center w-20">UNITS</th>
                    <th className="border border-black px-3 py-2 text-left">BIOLOGICAL REFERENCE RANGE</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map(test => (
                    <React.Fragment key={test.id}>
                      {/* Test Name Row - Bold */}
                      <tr>
                        <td colSpan={4} className="border border-black px-3 py-1 font-bold bg-white">
                          {test.template.name}
                        </td>
                      </tr>
                      {/* Parameter Rows */}
                      {test.template.parameters?.fields && test.template.parameters.fields.length > 0 ? (
                        test.template.parameters.fields.map(param => (
                          <tr key={param.name}>
                            <td className="border border-black px-3 py-1">{param.name}</td>
                            <td className="border border-black px-3 py-1 font-bold text-center">{String(test.results?.[param.name] ?? '-')}</td>
                            <td className="border border-black px-3 py-1 text-center">{param.unit || ''}</td>
                            <td className="border border-black px-3 py-1">{param.reference_range || ''}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="border border-black px-3 py-1 text-center">No parameters</td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* END OF REPORT */}
        <div className="text-center font-bold text-xs mt-4 py-2">
          ** End of Report **
        </div>

        {/* FOOTER - Print View */}
        <div className="hidden print:block mt-6 pt-4 border-t-2 border-black">
          {/* Signature Section - 3 Columns */}
          <div className="grid grid-cols-3 gap-8 text-center mt-4 mb-4">
            {/* Left - Signature Line */}
            <div>
              <div className="h-8 border-b-2 border-black mb-1"></div>
              <p className="font-bold text-xs">DR MISBHA LATEEFA, MD</p>
              <p className="text-xs text-gray-700">Consultant Pathologist</p>
            </div>

            {/* Center - QR Code */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-1 border border-gray-300 rounded mb-2">
                <QRCodeSVG
                  value={`${window.location.origin}/verify-report/${visit.visit_code}`}
                  size={50}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-gray-700">{visit.visit_code}</p>
            </div>

            {/* Right - Signatory */}
            <div>
              <div className="h-8 border-b-2 border-black mb-1"></div>
              <p className="font-bold text-xs">T.V. SUBBARAO</p>
              <p className="text-xs text-gray-700">M.Sc., Bio-Chemist</p>
            </div>
          </div>

          {/* Disclaimer & Notes */}
          <div className="text-xs text-gray-700 mt-3 pt-2 border-t border-black space-y-1">
            <p>Assay result should be correlated clinically with other laboratory finding and the total clinical status of the patient.</p>
            <p>Note :- This Report is subject to the terms and conditions mentioned overleaf</p>
            <p>Note :- PARTIAL REPRODUCTION OF THIS REPORT IS NOT PERMITTED</p>
          </div>

          {/* Page Number */}
          <div className="text-center text-xs mt-3 pt-2 border-t border-black">
            <p>Page 1 of 1</p>
          </div>
        </div>

        {/* FOOTER - Screen View */}
        <div className="screen-footer mt-6 pt-4 border-t-2 border-black">
          <div className="grid grid-cols-3 gap-6 mt-4">
            {/* Left - Signature */}
            <div className="flex flex-col items-center">
              <div className="border-b border-black w-32 mb-2"></div>
              <p className="font-bold text-xs">{signatory.name}</p>
              <p className="text-xs text-gray-600">{signatory.title}</p>
            </div>

            {/* Center - QR Code */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-1 border border-gray-300 rounded mb-2">
                <QRCodeSVG
                  value={`${window.location.origin}/verify-report/${visit.visit_code}`}
                  size={60}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs text-gray-700">{visit.visit_code}</p>
            </div>

            {/* Right - Notes */}
            <div className="text-xs text-gray-700 space-y-1 flex flex-col justify-center">
              <p>Assay result should be correlated clinically with other laboratory finding and the total clinical status of the patient.</p>
              <p>Note :- This Report is subject to the terms and conditions mentioned overleaf</p>
              <p>Note :- PARTIAL REPRODUCTION OF THIS REPORT IS NOT PERMITTED</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

