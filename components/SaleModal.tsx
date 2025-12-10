
import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Minus, Plus, User, MapPin, Phone, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (saleData: any, customerData: any) => void;
}

export const SaleModal: React.FC<SaleModalProps> = ({ isOpen, onClose, product, onSubmit }) => {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  // Reset when product changes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const total = product.Price * quantity;
  const isMaxStock = quantity >= product.Stock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const saleData = {
      ProductName: product.Name,
      Quantity: quantity,
      Price: product.Price,
      Total: total,
      Customer: customerName,
      Status: 'Paid',
      InvoiceNumber: invoiceNumber,
      CustomerPhone: customerPhone,
      CustomerAddress: customerAddress
    };

    const customerData = {
      Name: customerName,
      Phone: customerPhone,
      Address: customerAddress,
      Email: '',
      TotalPurchases: total
    };

    onSubmit(saleData, customerData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-end sm:items-center justify-center backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-emerald-700 p-4 text-white flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold">إتمام عملية البيع</h2>
                <p className="text-emerald-100 text-sm mt-1">{product.Name}</p>
            </div>
            <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20">
                <X size={20} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Quantity Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-sm font-medium text-gray-500 mb-3 text-center">الكمية المطلوبة</label>
                <div className="flex items-center justify-center gap-6">
                    <button 
                        type="button"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-emerald-600 hover:bg-emerald-50 active:scale-90 transition"
                    >
                        <Minus size={24} />
                    </button>
                    <span className="text-3xl font-bold w-12 text-center text-gray-800">{quantity}</span>
                    <button 
                        type="button"
                        disabled={isMaxStock}
                        onClick={() => setQuantity(q => Math.min(q + 1, product.Stock))}
                        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition ${
                            isMaxStock 
                            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                            : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700 active:scale-90'
                        }`}
                    >
                        <Plus size={24} />
                    </button>
                </div>
                
                {/* Stock Warning/Info */}
                <div className="text-center mt-2 h-4">
                    {isMaxStock ? (
                        <p className="text-[10px] text-red-500 font-bold flex items-center justify-center gap-1">
                            <AlertCircle size={10} />
                            وصلت للحد الأقصى للمخزون
                        </p>
                    ) : (
                         <p className="text-[10px] text-gray-400">المتاح في المخزون: {product.Stock}</p>
                    )}
                </div>

                <div className="text-center mt-2 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">الإجمالي</p>
                    <p className="text-2xl font-bold text-emerald-700">{total} <span className="text-sm font-normal">د.م</span></p>
                </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <User size={18} className="text-emerald-600" />
                    بيانات العميل
                </h3>
                
                <div>
                    <input 
                        required
                        placeholder="اسم العميل"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full p-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
                <div>
                     <div className="relative">
                        <Phone size={18} className="absolute top-3 right-3 text-gray-400" />
                        <input 
                            required
                            type="tel"
                            placeholder="رقم الهاتف"
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            className="w-full p-3 pr-10 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>
                 <div>
                     <div className="relative">
                        <MapPin size={18} className="absolute top-3 right-3 text-gray-400" />
                        <input 
                            placeholder="العنوان (اختياري)"
                            value={customerAddress}
                            onChange={e => setCustomerAddress(e.target.value)}
                            className="w-full p-3 pr-10 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>
            </div>

        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white">
            <button 
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <ShoppingCart size={22} />
                تأكيد البيع ({total} د.م)
            </button>
        </div>

      </div>
    </div>
  );
};
