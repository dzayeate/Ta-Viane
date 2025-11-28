import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { HiPlus } from 'react-icons/hi2';
import Swal from 'sweetalert2';

export default function CreateClassModal({ isOpen, onClose, onSuccess, userNuptk }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    school: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teacher_nuptk: userNuptk
        })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Kelas baru berhasil dibuat.',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-xl' }
        });
        setFormData({ name: '', grade: '', school: '' });
        onSuccess();
        onClose();
      } else {
        throw new Error(data.message || 'Gagal membuat kelas');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message,
        customClass: { popup: 'rounded-xl' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up">
        <div className="bg-gradient-brand p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold font-display">Buat Kelas Baru</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Nama Kelas <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: X IPA 1"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Tingkat Kelas <span className="text-red-500">*</span></label>
            <select
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Pilih Tingkat</option>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Nama Sekolah</label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="Contoh: SMA Negeri 1 Jakarta"
              className="input"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-ghost">Batal</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <HiPlus className="w-5 h-5" />
                  Buat Kelas
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
