
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, Edit } from 'lucide-react';
import { SheetName } from '../types';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  type: SheetName;
  initialData?: any; // For editing
}

export const InputModal: React.FC<InputModalProps> = ({ isOpen, onClose, onSubmit, type, initialData }) => {
  const [formData, setFormData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // If initialData exists, we are in Edit mode
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        // Set defaults
        setFormData(type === 'Sales' ? { Quantity: 1, Price: 0, Total: 0 } : {});
      }
    }
  }, [type, isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: string | number) => {
    setFormData((prev: any) => {
      const newData = { ...prev, [key]: value };
      
      // Auto-calculate Total for Sales (Manual Entry)
      if (type === 'Sales' && (key === 'Price' || key === 'Quantity')) {
        const price = key === 'Price' ? Number(value) : Number(prev.Price || 0);
        const qty = key === 'Quantity' ? Number(value) : Number(prev.Quantity || 1);
        newData.Total = price * qty;
      }

      return newData;
    });
  };

  // Helper to compress image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600; // Limit width to 600px
          const scaleSize = MAX_WIDTH / img.width;
          const newWidth = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
          const newHeight = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;

          canvas.width = newWidth;
          canvas.height = newHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            // Compress to JPEG with 0.5 quality
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
            resolve(compressedDataUrl);
          } else {
            reject(new Error("Canvas context failed"));
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressedBase64 = await compressImage(file);
        setFormData((prev: any) => ({ ...prev, [fieldName]: compressedBase64 }));
      } catch (error) {
        console.error("Error compressing image", error);
        alert("فشل ضغط الصورة، يرجى المحاولة مرة أخرى.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const renderFields = () => {
    switch (type) {
      case 'Products':
        const productCategories = [
          'بورتريه',
          'خربشات بالقلم الجاف',
          'لوحات فنية',
          'أخرى'
        ];
        return (
          <>
             <div className="flex justify-center mb-4">
              <div 
                onClick={() => !isCompressing && fileInputRef.current?.click()}
                className={`w-24 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative ${isCompressing ? 'opacity-50 cursor-wait' : ''}`}
              >
                {isCompressing ? (
                   <span className="text-xs text-emerald-600 font-bold animate-pulse">جاري المعالجة...</span>
                ) : formData.Image ? (
                  <img src={formData.Image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload size={24} className="text-emerald-500 mb-1" />
                    <span className="text-[10px] text-gray-500">صورة المنتج</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'Image')} 
                />
              </div>
            </div>

            <Input label="اسم المنتج (Name)" name="Name" value={formData.Name} onChange={handleChange} required />
            <Select label="التصنيف (Category)" name="Category" options={productCategories} value={formData.Category} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-3">
               <Input label="السعر (Price)" name="Price" type="number" value={formData.Price} onChange={handleChange} required />
               <Input label="التكلفة (Cost)" name="Cost" type="number" value={formData.Cost} onChange={handleChange} />
            </div>
            <Input label="المخزون (Stock)" name="Stock" type="number" value={formData.Stock} onChange={handleChange} required />
            <TextArea label="الوصف (Description)" name="Description" value={formData.Description} onChange={handleChange} />
          </>
        );
      case 'Sales':
        // NOTE: Sales are now mostly handled via the specialized SaleModal, but kept here for manual entry if needed
        return (
          <>
            <Input label="اسم المنتج" name="ProductName" value={formData.ProductName} onChange={handleChange} required />
            <Input label="اسم العميل" name="Customer" value={formData.Customer} onChange={handleChange} required />
            <div className="grid grid-cols-3 gap-3">
              <Input label="السعر" name="Price" type="number" value={formData.Price} onChange={handleChange} required />
              <Input label="الكمية" name="Quantity" type="number" value={formData.Quantity} onChange={handleChange} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الإجمالي</label>
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 font-bold text-emerald-600">
                  {formData.Total || 0}
                </div>
              </div>
            </div>
            <Select label="الحالة" name="Status" options={['Pending', 'Paid', 'Cancelled']} value={formData.Status} onChange={handleChange} />
            <Input label="رقم الفاتورة" name="InvoiceNumber" value={formData.InvoiceNumber} onChange={handleChange} />
          </>
        );
      case 'Expenses':
        const expenseCategories = [
          'مواد خام',
          'أدوات فنية',
          'شحن وتسليم',
          'تسويق',
          'رواتب',
          'إيجار',
          'مرافق (كهرباء، ماء، إنترنت)',
          'صيانة',
          'أخرى'
        ];
        return (
          <>
            <div className="flex justify-center mb-4">
              <div 
                onClick={() => !isCompressing && fileInputRef.current?.click()}
                className={`w-full h-24 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden relative hover:bg-gray-100 transition ${isCompressing ? 'opacity-50 cursor-wait' : ''}`}
              >
                {isCompressing ? (
                   <span className="text-xs text-emerald-600 font-bold animate-pulse">جاري المعالجة...</span>
                ) : formData.ReceiptImage ? (
                  <div className="flex items-center gap-4 w-full h-full px-4">
                     <img src={formData.ReceiptImage} alt="Receipt" className="h-full w-auto object-contain" />
                     <span className="text-xs text-green-600 font-bold">تم تحميل صورة الإيصال</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload size={20} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">تحميل صورة الإيصال (اختياري)</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'ReceiptImage')} 
                />
              </div>
            </div>

            <Input label="نوع المصروف" name="Type" value={formData.Type} onChange={handleChange} required />
            <Select label="التصنيف" name="Category" options={expenseCategories} value={formData.Category} onChange={handleChange} />
            <Input label="المبلغ" name="Amount" type="number" value={formData.Amount} onChange={handleChange} required />
            <Input label="التاريخ" name="Date" type="date" value={formData.Date} onChange={handleChange} />
            <TextArea label="الوصف" name="Description" value={formData.Description} onChange={handleChange} />
          </>
        );
      case 'Customers':
        return (
          <>
            <Input label="اسم العميل" name="Name" value={formData.Name} onChange={handleChange} required />
            <Input label="رقم الهاتف" name="Phone" type="tel" value={formData.Phone} onChange={handleChange} required />
            <TextArea label="العنوان" name="Address" value={formData.Address} onChange={handleChange} />
          </>
        );
      default:
        return null;
    }
  };

  const titleMap: Record<SheetName, string> = {
    Products: initialData ? 'تعديل المنتج' : 'إضافة منتج جديد',
    Sales: initialData ? 'تعديل البيع' : 'تسجيل مبيعة يدوياً',
    Expenses: initialData ? 'تعديل المصروف' : 'تسجيل مصروف جديد',
    Customers: initialData ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out] max-h-[90vh] flex flex-col">
        <div className="bg-emerald-600 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="font-bold text-lg flex items-center gap-2">
            {initialData && <Edit size={18} />}
            {titleMap[type]}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded-full transition">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {renderFields()}

          <button
            type="submit"
            disabled={isCompressing}
            className={`w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-lg shadow-md hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Save size={20} />
            {initialData ? 'حفظ التعديلات' : 'إضافة'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Helper Components
const Input = ({ label, name, type = "text", required, value, onChange }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      required={required}
      value={value || ''}
      onChange={(e) => onChange(name, type === 'number' ? Number(e.target.value) : e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
    />
  </div>
);

const TextArea = ({ label, name, value, onChange }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      rows={3}
      value={value || ''}
      onChange={(e) => onChange(name, e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
    />
  </div>
);

const Select = ({ label, name, options, value, onChange }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(name, e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
    >
      <option value="">اختر...</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);
