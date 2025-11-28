import { HiUserGroup, HiAcademicCap, HiClipboardDocumentCheck } from 'react-icons/hi2';
import Swal from 'sweetalert2';

export default function ClassCard({ data }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.classCode);
    Swal.fire({
      icon: 'success',
      title: 'Disalin!',
      text: 'Kode kelas berhasil disalin ke clipboard.',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'rounded-xl' }
    });
  };

  return (
    <div className="card p-6 hover:shadow-md transition-all border-l-4 border-l-brand-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-neutral-900">{data.name}</h3>
          <p className="text-neutral-500 text-sm flex items-center gap-1 mt-1">
            <HiAcademicCap className="w-4 h-4" />
            {data.grade} {data.school ? `• ${data.school}` : ''}
          </p>
        </div>
        <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
          Active
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-neutral-600">
          <HiUserGroup className="w-5 h-5 text-neutral-400" />
          <span className="font-medium">{data.students?.length || 0} Siswa</span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1">Kode Kelas</span>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors group"
            title="Salin Kode"
          >
            <span className="font-mono font-bold text-lg text-neutral-800 tracking-widest">{data.classCode}</span>
            <HiClipboardDocumentCheck className="w-5 h-5 text-neutral-400 group-hover:text-brand-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
