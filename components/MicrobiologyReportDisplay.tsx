import React from 'react';
import { VisitTest, Visit } from '../types';
import { useAppContext } from '../context/AppContext';

interface MicrobiologyReportDisplayProps {
    test: VisitTest;
    visit: Visit;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

export const MicrobiologyReportDisplay: React.FC<MicrobiologyReportDisplayProps> = ({ test, visit }) => {
    const { antibiotics } = useAppContext();
    if (!test.cultureResult) {
        return <div className="text-sm text-red-500 p-4">Culture result data is missing.</div>;
    }

    const { growthStatus, organismIsolated, colonyCount, sensitivity, remarks } = test.cultureResult;
    
    const sensitiveTo = (sensitivity || []).filter(s => s.sensitivity === 'S');
    const intermediateTo = (sensitivity || []).filter(s => s.sensitivity === 'I');
    const resistantTo = (sensitivity || []).filter(s => s.sensitivity === 'R');

    const getAntibioticName = (id: number) => antibiotics.find(ab => ab.id === id)?.name || 'Unknown';

    return (
        <div className="mt-2 text-xs p-4 border-l border-r border-b border-black">
            <div className="text-center mb-4">
                <h4 className="font-bold text-sm underline">Culture and Sensitivity Report</h4>
            </div>

            {growthStatus === 'no_growth' ? (
                <div className="text-center py-6">
                    <p className="font-bold text-gray-800">Organism Isolated: No growth occurred.</p>
                    {remarks && <p className="mt-2 text-gray-600">Remarks: {remarks}</p>}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4">
                        <div><span className="font-semibold">Source of specimen:</span> {test.specimen_type}</div>
                        <div><span className="font-semibold">Sample collection date:</span> {formatDate(test.collectedAt)}</div>
                        <div><span className="font-semibold">Reporting date:</span> {formatDate(test.approvedAt)}</div>
                    </div>
                    
                    <div className="mb-4">
                        <span className="font-semibold">Organism isolated:</span> 
                        <span className="ml-2 font-bold">{organismIsolated} {colonyCount && `> ${colonyCount} CFU/ml.`}</span>
                    </div>

                    <table className="w-full border-collapse border border-black">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black p-2 font-semibold">Sensitive To</th>
                                <th className="border border-black p-2 font-semibold">Intermediate To</th>
                                <th className="border border-black p-2 font-semibold">Resistant To</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black p-2 align-top">
                                    <ul className="list-disc list-inside space-y-1">
                                        {sensitiveTo.map(s => <li key={s.antibioticId}>{getAntibioticName(s.antibioticId)}</li>)}
                                        {sensitiveTo.length === 0 && <span className="text-gray-500">-</span>}
                                    </ul>
                                </td>
                                <td className="border border-black p-2 align-top">
                                    <ul className="list-disc list-inside space-y-1">
                                        {intermediateTo.map(s => <li key={s.antibioticId}>{getAntibioticName(s.antibioticId)}</li>)}
                                        {intermediateTo.length === 0 && <span className="text-gray-500">-</span>}
                                    </ul>
                                </td>
                                <td className="border border-black p-2 align-top">
                                    <ul className="list-disc list-inside space-y-1">
                                        {resistantTo.map(s => <li key={s.antibioticId}>{getAntibioticName(s.antibioticId)}</li>)}
                                        {resistantTo.length === 0 && <span className="text-gray-500">-</span>}
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>
            )}
             <div className="mt-6">
                <p className="font-semibold">* Correlate clinically.</p>
                <p>If there is a need kindly discuss.</p>
            </div>
        </div>
    );
};
