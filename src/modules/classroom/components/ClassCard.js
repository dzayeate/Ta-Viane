import { useRouter } from 'next/router';
import { HiUserGroup, HiAcademicCap, HiClipboardDocumentCheck, HiArrowRight, HiTrash } from 'react-icons/hi2';
import Swal from 'sweetalert2';

export default function ClassCard({ data, onDelete }) {
  const router = useRouter();

  const copyToClipboard = (e) => {
    e.stopPropagation();
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

  const handleClick = () => {
    router.push(`/classes/${data.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="card p-6 hover:shadow-lg transition-all border-l-4 border-l-brand-500 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-neutral-900 truncate group-hover:text-brand-600 transition-colors">
            {data.name}
          </h3>
          <p className="text-neutral-500 text-sm flex items-center gap-1 mt-1">
            <HiAcademicCap className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Kelas {data.grade} {data.school ? `• ${data.school}` : ''}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="bg-success-50 text-success-700 px-2 py-0.5 rounded-md text-xs font-bold">
            Aktif
          </span>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(data);
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Hapus kelas"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          )}
          <HiArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-neutral-600">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <HiUserGroup className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-neutral-900">{data.students?.length || 0}</p>
            <p className="text-xs text-neutral-500">Siswa</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Kode Kelas</span>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 mt-1 hover:bg-neutral-100 px-2 py-1 -mx-2 rounded-lg transition-colors group/copy"
            title="Klik untuk menyalin"
          >
            <span className="font-mono font-bold text-lg text-neutral-800 tracking-widest">{data.classCode}</span>
            <HiClipboardDocumentCheck className="w-4 h-4 text-neutral-400 group-hover/copy:text-brand-600" />
          </button>
        </div>
        
        <span className="text-xs text-neutral-400">
          {new Date(data.createdAt).toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}
        </span>
      </div>
    </div>
  );
}
