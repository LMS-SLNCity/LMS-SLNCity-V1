import React, { useState } from 'react';
import { Visit, Signatory, VisitTest } from '../types';
import { TestReport } from './TestReport';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


interface ReportModalProps {
  visit: Visit;
  signatory: Signatory;
  onClose: () => void;
  onEdit: (test: VisitTest) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ visit, signatory, onClose, onEdit }) => {
  const { hasPermission } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = async () => {
    try {
      setIsExporting(true);
      const element = document.getElementById('test-report-content');

      if (!element) {
        alert('Report content not found');
        return;
      }

      // Clone the element to avoid modifying the DOM
      const clonedElement = element.cloneNode(true) as HTMLElement;

      // Remove header from cloned element for print
      const header = clonedElement.querySelector('.report-header');
      if (header) {
        header.remove();
      }

      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm';
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);

      // Create canvas from the cloned element (with footer and QR code)
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF (handle multiple pages if needed)
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Get PDF as blob and open in new window for printing
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const printWindow = window.open(pdfUrl);
      if (printWindow) {
        // Wait for PDF to load, then print
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }

      console.log('✅ PDF opened for printing');
    } catch (error) {
      console.error('Error printing PDF:', error);
      alert('Failed to print. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      const element = document.getElementById('test-report-content');

      if (!element) {
        alert('Report content not found');
        return;
      }

      // Clone the element to avoid modifying the DOM
      const clonedElement = element.cloneNode(true) as HTMLElement;

      // Remove header from cloned element for print
      const header = clonedElement.querySelector('.report-header');
      if (header) {
        header.remove();
      }

      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm';
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);

      // Create canvas from the cloned element (with footer and QR code)
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF (handle multiple pages if needed)
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Save PDF
      const filename = `report_${visit.visit_code}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      console.log('✅ PDF exported:', filename);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const canEditReport = hasPermission('EDIT_APPROVED_REPORT');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-gray-200 w-full h-full overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gray-800 p-3 flex justify-end items-center space-x-2 print:hidden flex-wrap gap-2">
            <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 disabled:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                title="Download report as PDF"
            >
                {isExporting ? 'Exporting...' : '📥 Download PDF'}
            </button>
            <button
                onClick={handlePrint}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Print as PDF"
            >
                🖨️ Print as PDF
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                ✕ Close
            </button>
        </div>
        <div className="p-4 sm:p-8">
          <div id="test-report-content">
            <TestReport visit={visit} signatory={signatory} canEdit={canEditReport} onEdit={onEdit} />
          </div>
        </div>
      </div>
    </div>
  );
};