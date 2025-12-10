
import React from 'react';
import { X, Printer, ShoppingBag } from 'lucide-react';
import { Sale } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] print:p-0 print:bg-white print:static">
      
      {/* Print Styles */}
      <style>
        {`
          @media print {
            @page {
              size: auto;
              margin: 0mm;
            }
            body * {
              visibility: hidden;
            }
            #receipt-content, #receipt-content * {
              visibility: visible;
            }
            #receipt-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 10px; /* Reduced padding for thermal paper */
              box-shadow: none;
              border: none;
            }
            /* Hide buttons during print */
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:max-w-none print:shadow-none" id="receipt-container">
        
        {/* Header Actions (Hidden in Print) */}
        <div className="bg-gray-100 p-3 flex justify-between items-center no-print border-b border-gray-200">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <Printer size={18} />
            معاينة الإيصال
          </h3>
          <button onClick={onClose} className="bg-white p-1.5 rounded-full hover:bg-gray-200 text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Printable Content */}
        <div id="receipt-content" className="p-6 bg-white text-black font-mono text-sm leading-relaxed overflow-y-auto">
          
          {/* Store Info */}
          <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
            <div className="flex justify-center mb-2">
               <div className="bg-black text-white p-2 rounded-lg">
                 <ShoppingBag size={24} />
               </div>
            </div>
            <h1 className="text-xl font-bold mb-1">Cipex Art</h1>
            <p className="text-xs text-gray-500">للفنون والهدايا</p>
            <p className="text-xs text-gray-500 mt-1">{sale.Date || new Date().toLocaleDateString('fr-FR')}</p>
          </div>

          {/* Invoice Info */}
          <div className="mb-4 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">رقم الفاتورة:</span>
              <span className="font-bold">{sale.InvoiceNumber || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">العميل:</span>
              <span className="font-bold">{sale.Customer}</span>
            </div>
            {sale.CustomerPhone && (
              <div className="flex justify-between">
                <span className="text-gray-500">الهاتف:</span>
                <span>{sale.CustomerPhone}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-right mb-4 border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="py-1 text-right">المنتج</th>
                <th className="py-1 text-center">الكمية</th>
                <th className="py-1 text-left">السعر</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2">{sale.ProductName}</td>
                <td className="py-2 text-center">{sale.Quantity}</td>
                <td className="py-2 text-left">{sale.Total} د.م</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t-2 border-dashed border-gray-300 pt-3 space-y-1">
            <div className="flex justify-between text-lg font-bold">
              <span>الإجمالي:</span>
              <span>{sale.Total} د.م</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-4 border-t border-gray-100">
            <p className="font-bold mb-1">شكراً لزيارتكم!</p>
            <p className="text-[10px] text-gray-400">يرجى الاحتفاظ بهذا الإيصال للاستبدال</p>
          </div>

        </div>

        {/* Footer Actions (Hidden in Print) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 no-print">
          <button 
            onClick={handlePrint}
            className="w-full bg-black text-white py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Printer size={20} />
            طباعة الإيصال
          </button>
        </div>

      </div>
    </div>
  );
};
