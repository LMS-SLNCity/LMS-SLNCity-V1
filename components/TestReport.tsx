import React from 'react';
import { VisitTest, Visit, Signatory } from '../types';
import { useAppContext } from '../context/AppContext';
import { mockReferralDoctors, mockClients } from '../api/mock';
import { MicrobiologyReportDisplay } from './MicrobiologyReportDisplay';

interface TestReportProps {
  visit: Visit;
  signatory: Signatory;
  canEdit: boolean;
  onEdit: (test: VisitTest) => void;
}

const ReportRow: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
  <div className="flex">
    <span className="font-semibold text-xs w-32 shrink-0">{label}</span>
    <span className="font-semibold text-xs mr-2">:</span>
    <span className="text-xs">{value || '-'}</span>
  </div>
);

const formatAge = (p: Visit['patient']) => {
    if (p.age_years > 0) return `${p.age_years} Year(s)`;
    if (p.age_months > 0) return `${p.age_months} Month(s)`;
    if (p.age_days > 0) return `${p.age_days} Day(s)`;
    return 'N/A';
}

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(',', '');
}


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
  const doctor = mockReferralDoctors.find(d => d.id === visit.referred_doctor_id);
  
  const testsByCategory = approvedTestsForVisit.reduce((acc, test) => {
    const category = test.template.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(test);
    return acc;
  }, {} as Record<string, VisitTest[]>);

  const client = mockClients.find(c => c.id === visit.ref_customer_id);
  const isB2BClient = client?.type === 'REFERRAL_LAB';


  return (
    <>
    <style>{`
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-content-only .report-header,
        .print-content-only .report-footer {
          display: none;
        }
        .print-content-only .report-body-container {
           padding-top: 140px;
        }
      }
      .text-xxs {
        font-size: 0.65rem;
        line-height: 0.9rem;
      }
    `}</style>
    <div className="bg-white p-10 max-w-4xl mx-auto text-gray-900 shadow-2xl font-sans" id="test-report">
        <div className="report-header border-b-4 border-black pb-4">
            <h1 className="text-3xl font-bold text-black">SLNCity Diagnostic Center</h1>
            <p className="text-xs text-gray-600">123 Health St, Wellness City | Phone: (123) 456-7890</p>
        </div>
        
        <div className="report-body-container">
            <div className="grid grid-cols-2 gap-x-8 mt-6 text-xs border-b-2 border-black pb-4">
                <div className="space-y-1.5">
                    <ReportRow label="Patient Name" value={visit.patient.name} />
                    <ReportRow label="Age / Gender" value={`${formatAge(visit.patient)} / ${visit.patient.sex}`} />
                    <ReportRow label="Sample Type" value={firstTest.specimen_type} />
                    <ReportRow label="Client Code" value={visit.ref_customer_id ? `C${visit.ref_customer_id}` : '-'} />
                    <ReportRow label="Referred By" value={doctor?.name || visit.other_ref_doctor || 'SELF'} />
                </div>
                <div className="flex flex-col justify-between items-end">
                     <div>
                        <svg className="w-48 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 32" fill="black">
                            <rect x="0" y="0" width="2" height="32" /> <rect x="4" y="0" width="2" height="32" />
                            <rect x="8" y="0" width="4" height="32" /> <rect x="14" y="0" width="2" height="32" />
                            <rect x="18" y="0" width="4" height="32" /> <rect x="24" y="0" width="2" height="32" />
                            <rect x="28" y="0" width="2" height="32" /> <rect x="32" y="0" width="4" height="32" />
                            <rect x="38" y="0" width="2" height="32" /> <rect x="42" y="0" width="2" height="32" />
                            <rect x="48" y="0" width="4" height="32" /> <rect x="54" y="0" width="2" height="32" />
                            <rect x="58" y="0" width="2" height="32" /> <rect x="62" y="0" width="4" height="32" />
                            <rect x="68" y="0" width="2" height="32" /> <rect x="72" y="0" width="2" height="32" />
                            <rect x="76" y="0" width="4" height="32" /> <rect x="82" y="0" width="4" height="32" />
                            <rect x="88" y="0" width="2" height="32" /> <rect x="92" y="0" width="2" height="32" />
                            <rect x="96" y="0" width="4" height="32" /> <rect x="102" y="0" width="2" height="32" />
                            <rect x="106" y="0" width="4" height="32" /> <rect x="112" y="0" width="4" height="32" />
                            <rect x="118" y="0" width="2" height="32" /> <rect x="122" y="0" width="4" height="32" />
                            <rect x="128" y="0" width="2" height="32" /> <rect x="132" y="0" width="2" height="32" />
                            <rect x="136" y="0" width="4" height="32" /> <rect x="142" y="0" width="2" height="32" />
                            <rect x="146" y="0" width="4" height="32" /> <rect x="152" y="0" width="2" height="32" />
                            <rect x="156" y="0" width="4" height="32" />
                        </svg>
                    </div>
                    <div className="space-y-1.5">
                        <ReportRow label="Patient Id" value={visit.visit_code} />
                        <ReportRow label="Sample Drawn Date" value={formatDate(firstTest.collectedAt)} />
                        <ReportRow label="Registration Date" value={formatDate(visit.registration_datetime)} />
                        <ReportRow label="Reported Date" value={formatDate(firstTest.approvedAt)} />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                {Object.entries(testsByCategory).map(([category, tests]) => (
                    <div key={category} className="mt-4 break-inside-avoid">
                        <div className="bg-gray-200 text-center py-1.5 border-x border-t border-black">
                            <h3 className="font-bold text-sm tracking-wider text-black">{category.toUpperCase()}</h3>
                        </div>
                        {tests[0].template.reportType === 'culture' ? (
                            tests.map(test => <MicrobiologyReportDisplay key={test.id} test={test} visit={visit} />)
                        ) : (
                           <div className="border-l border-r border-b border-black">
                                {tests.map(test => (
                                    <div key={test.id} className="pt-2 px-2 relative group first:pt-2 last:pb-2">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-sm text-black underline pl-2">{test.template.name}</p>
                                            {canEdit && (
                                                <button onClick={() => onEdit(test)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 text-xs bg-yellow-400 text-yellow-900 rounded-md hover:bg-yellow-500">
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                        
                                        <table className="min-w-full text-xs mt-1">
                                            <thead className="border-b border-gray-300">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-semibold uppercase w-2/5 text-gray-700">Test Description</th>
                                                    <th className="px-4 py-2 text-left font-semibold uppercase w-1/5 text-gray-700">Result</th>
                                                    <th className="px-4 py-2 text-left font-semibold uppercase w-1/5 text-gray-700">Units</th>
                                                    <th className="px-4 py-2 text-left font-semibold uppercase w-1/f text-gray-700">Reference Range</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {test.template.parameters.fields.map(param => (
                                                    <tr key={param.name} className="border-b border-gray-100 last:border-b-0">
                                                        <td className="pl-6 pr-4 py-1.5 text-gray-800">{param.name}</td>
                                                        <td className="px-4 py-1.5 font-bold text-black">{String(test.results?.[param.name] ?? '-')}</td>
                                                        <td className="px-4 py-1.5 text-gray-800">{param.unit || ''}</td>
                                                        <td className="px-4 py-1.5 text-gray-800">{param.reference_range || ''}</td>
                                                    </tr>
                                                ))}
                                                {test.template.parameters.fields.length === 0 && (
                                                    <tr><td colSpan={4} className="px-4 py-3 text-center text-gray-500">No parameters for this test.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                           </div>
                        )}
                    </div>
                ))}
                <p className="text-center font-bold text-xs mt-6">** End of Report **</p>
            </div>
        </div>

        <div className="report-footer">
            <div style={{minHeight: '100px'}}></div>
            {isB2BClient && visit.due_amount > 0 && (
                <div className="mt-4 p-2 border-2 border-dashed border-gray-400 bg-gray-50 text-gray-800 text-xs text-center">
                    <strong>Billing Note (B2B Client):</strong> Amount due for this visit is <strong>₹{visit.due_amount.toFixed(2)}</strong>.
                </div>
            )}
            <div className="mt-8 pt-8 border-t-2 border-gray-300 flex flex-col items-center text-xs">
                 <div className="flex justify-center items-center flex-col mb-8">
                     <svg viewBox="0 0 100 100" className="w-20 h-20">
                        <path d="M0 0h30v30H0z M10 10h10v10H10z M70 0h30v30H70z M80 10h10v10H80z M0 70h30v30H0z M10 80h10v10H10z M40 0h10v10H40z M60 0h10v10H60z M0 40h10v10H0z M0 60h10v10H0z M90 40h10v10H90z M90 60h10v10H90z M40 90h10v10H40z M60 90h10v10H60z M40 40h30v10H40z M40 60h10v10H40z M60 60h10v10H60z M70 40h10v30H70z M40 70h30v10H40z M20 20h10v10H20z M20 40h10v10H20z M40 20h10v10H40z M20 60h10v10H20z M60 20h10v10H60z M60 40h10v10H60z" fill="#0f172a"/>
                     </svg>
                    <p className="text-xxs mt-1 text-gray-700">Scan to verify report for Visit ID: {visit.visit_code}</p>
                </div>
                
                <div className="text-center">
                    <div className="h-10"></div>
                    <p className="font-bold text-sm">{signatory.name}</p>
                    <p>{signatory.title}</p>
                </div>
            </div>

            <div className="mt-8 text-xxs text-gray-600 space-y-1">
                <p>Assay result should be correlated clinically with other laboratory finding and the total clinical status of the patient.</p>
                <p>Note : This Report is subject to the terms and conditions mentioned overleaf</p>
                <p>Note : PARTIAL REPRODUCTION OF THIS REPORT IS NOT PERMITTED</p>
            </div>
            <div className="text-right text-xs mt-4">
                Page 1 of 1
            </div>
        </div>
    </div>
    </>
  );
};