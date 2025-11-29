import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import AuthGuard from '@/components/auth-guard';
import { useRouter } from 'next/router';
import { 
  HiArrowLeft, 
  HiUserGroup, 
  HiClipboardDocumentCheck, 
  HiAcademicCap,
  HiPlus,
  HiTrash,
  HiPencil,
  HiArrowUpTray,
  HiXMark,
  HiMagnifyingGlass,
  HiCheck,
  HiExclamationTriangle
} from 'react-icons/hi2';
import users from '@/mock/users/index.json';
import Swal from 'sweetalert2';

export default function ClassDetail() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  
  const [user, setUser] = useState({ nama: '', nuptk: '' });
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({ name: '', nisn: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSV Import State
  const [csvData, setCsvData] = useState('');
  const [importPreview, setImportPreview] = useState([]);

  useEffect(() => {
    const nupkt = localStorage.getItem('nupkt');
    const password = localStorage.getItem('password');
    
    if (nupkt) {
      const foundUser = users.find(u => u.NUPTK === nupkt && u.Password === password);
      if (foundUser) {
        setUser({ nama: foundUser.Nama, nuptk: foundUser.NUPTK });
      } else {
        setUser({ nama: 'User', nuptk: nupkt });
      }
    }
  }, []);

  const fetchClassData = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/classes?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setClassData(data);
      } else {
        router.push('/classes');
      }
    } catch (error) {
      console.error('Error fetching class:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);

  const handleLogout = () => {
    localStorage.removeItem('nupkt');
    localStorage.removeItem('password');
    router.push('/');
  };

  const copyInviteLink = () => {
    if (!classData) return;
    const link = `${window.location.origin}/join/${classData.classCode}`;
    navigator.clipboard.writeText(link);
    Swal.fire({
      icon: 'success',
      title: 'Link Disalin!',
      text: 'Link undangan berhasil disalin ke clipboard.',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'rounded-xl' }
    });
  };

  // ════════════════════════════════════════════════════════════════════
  // ADD STUDENT
  // ════════════════════════════════════════════════════════════════════
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addStudent',
          classId: id,
          student: formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Siswa berhasil ditambahkan.',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-xl' }
        });
        setFormData({ name: '', nisn: '', email: '' });
        setIsAddModalOpen(false);
        fetchClassData();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message,
        customClass: { popup: 'rounded-xl' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════
  // EDIT STUDENT
  // ════════════════════════════════════════════════════════════════════
  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({ name: student.name, nisn: student.nisn, email: student.email || '' });
    setIsEditModalOpen(true);
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStudent',
          classId: id,
          studentId: editingStudent.id,
          student: formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data siswa berhasil diperbarui.',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-xl' }
        });
        setFormData({ name: '', nisn: '', email: '' });
        setEditingStudent(null);
        setIsEditModalOpen(false);
        fetchClassData();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message,
        customClass: { popup: 'rounded-xl' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════
  // DELETE STUDENT
  // ════════════════════════════════════════════════════════════════════
  const handleDeleteStudent = async (student) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Siswa?',
      html: `Apakah Anda yakin ingin menghapus <b>${student.name}</b> dari kelas ini?`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      customClass: { popup: 'rounded-xl' }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeStudent',
          classId: id,
          studentId: student.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Dihapus!',
          text: 'Siswa berhasil dihapus dari kelas.',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-xl' }
        });
        fetchClassData();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message,
        customClass: { popup: 'rounded-xl' }
      });
    }
  };

  // ════════════════════════════════════════════════════════════════════
  // CSV IMPORT
  // ════════════════════════════════════════════════════════════════════
  const handleCsvChange = (e) => {
    const text = e.target.value;
    setCsvData(text);
    
    // Parse CSV preview
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        name: parts[0] || '',
        nisn: parts[1] || '',
        email: parts[2] || ''
      };
    }).filter(s => s.name && s.nisn);
    
    setImportPreview(parsed);
  };

  const handleBulkImport = async () => {
    if (importPreview.length === 0) return;
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulkAddStudents',
          classId: id,
          students: importPreview
        })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Import Berhasil!',
          html: `<b>${data.added?.length || 0}</b> siswa ditambahkan<br><b>${data.skipped?.length || 0}</b> dilewati (duplikat/tidak valid)`,
          customClass: { popup: 'rounded-xl' }
        });
        setCsvData('');
        setImportPreview([]);
        setIsImportModalOpen(false);
        fetchClassData();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message,
        customClass: { popup: 'rounded-xl' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter students by search
  const filteredStudents = classData?.students?.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nisn.includes(searchQuery)
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!classData) return null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-neutral-50 flex">
        <Sidebar 
          t={t}
          user={user}
          onLogout={handleLogout}
          onOpenModal={() => router.push('/')}
          onAddQuestion={() => router.push('/')}
          onOpenReview={() => router.push('/')}
          questionCount={0}
        />

        <main className="flex-1 pt-20 lg:pt-8 pb-12 px-4 lg:px-8 overflow-x-hidden h-screen overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push('/classes')}
              className="flex items-center gap-2 text-neutral-600 hover:text-brand-600 transition-colors mb-6"
            >
              <HiArrowLeft className="w-5 h-5" />
              <span>Kembali ke Daftar Kelas</span>
            </button>

            {/* ══════════════════════════════════════════════════════════════
                CLASS HEADER CARD
            ══════════════════════════════════════════════════════════════ */}
            <div className="card p-6 md:p-8 mb-6 bg-gradient-to-br from-white to-brand-50/30">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                {/* Left: Class Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-neutral-900">
                      {classData.name}
                    </h1>
                    <span className="bg-success-100 text-success-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                      Aktif
                    </span>
                  </div>
                  <p className="text-neutral-600 flex items-center gap-2 text-base">
                    <HiAcademicCap className="w-5 h-5 text-neutral-400" />
                    Kelas {classData.grade} • {classData.school || 'Sekolah tidak diisi'}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                        <HiUserGroup className="w-5 h-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-neutral-900">{classData.students?.length || 0}</p>
                        <p className="text-xs text-neutral-500">Siswa Terdaftar</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Class Code */}
                <div className="flex flex-col items-start lg:items-end gap-3">
                  <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Kode Kelas</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-3xl md:text-4xl font-bold text-neutral-900 tracking-widest bg-white px-4 py-2 rounded-xl border-2 border-dashed border-neutral-200">
                      {classData.classCode}
                    </span>
                  </div>
                  <button 
                    onClick={copyInviteLink}
                    className="btn btn-primary btn-sm"
                  >
                    <HiClipboardDocumentCheck className="w-4 h-4" />
                    Salin Link Undangan
                  </button>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                STUDENTS TABLE
            ══════════════════════════════════════════════════════════════ */}
            <div className="card overflow-hidden">
              {/* Table Header */}
              <div className="p-4 md:p-6 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <HiUserGroup className="w-5 h-5 text-brand-600" />
                    Daftar Siswa
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Cari nama atau NISN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input input-sm pl-9 w-full sm:w-64"
                      />
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="btn btn-ghost btn-sm"
                      >
                        <HiArrowUpTray className="w-4 h-4" />
                        Import CSV
                      </button>
                      <button 
                        onClick={() => {
                          setFormData({ name: '', nisn: '', email: '' });
                          setIsAddModalOpen(true);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        <HiPlus className="w-4 h-4" />
                        Tambah Siswa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 w-16">No</th>
                      <th className="px-6 py-4">Nama Lengkap</th>
                      <th className="px-6 py-4">NISN</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Bergabung</th>
                      <th className="px-6 py-4 w-28 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, index) => (
                        <tr key={student.id} className="hover:bg-neutral-50 transition-colors group">
                          <td className="px-6 py-4 text-neutral-400 font-mono text-sm">{index + 1}</td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-neutral-900">{student.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                              {student.nisn}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-neutral-600 text-sm">{student.email || '-'}</td>
                          <td className="px-6 py-4 text-neutral-500 text-sm">
                            {new Date(student.joinedAt).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(student)}
                                className="p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                title="Edit"
                              >
                                <HiPencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student)}
                                className="p-2 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                                title="Hapus"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                              <HiUserGroup className="w-8 h-8 text-neutral-300" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-600">
                                {searchQuery ? 'Tidak ada hasil' : 'Belum ada siswa'}
                              </p>
                              <p className="text-sm text-neutral-400 mt-1">
                                {searchQuery 
                                  ? 'Coba kata kunci lain' 
                                  : 'Tambahkan siswa secara manual atau import dari CSV'
                                }
                              </p>
                            </div>
                            {!searchQuery && (
                              <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="btn btn-primary btn-sm mt-2"
                              >
                                <HiPlus className="w-4 h-4" />
                                Tambah Siswa Pertama
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              {filteredStudents.length > 0 && (
                <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 text-sm text-neutral-500">
                  Menampilkan {filteredStudents.length} dari {classData.students?.length || 0} siswa
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ══════════════════════════════════════════════════════════════════
            ADD STUDENT MODAL
        ══════════════════════════════════════════════════════════════════ */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backdropFilter: 'blur(4px)' }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsAddModalOpen(false)} />
            
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up">
              <div className="bg-gradient-brand p-5 text-white flex justify-between items-center">
                <h2 className="text-lg font-bold font-display">Tambah Siswa Baru</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    NISN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="Contoh: 0012345678"
                    className="input font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Contoh: budi@email.com (opsional)"
                    className="input"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-ghost">
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <>
                        <HiPlus className="w-4 h-4" />
                        Tambah Siswa
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            EDIT STUDENT MODAL
        ══════════════════════════════════════════════════════════════════ */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backdropFilter: 'blur(4px)' }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsEditModalOpen(false)} />
            
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white flex justify-between items-center">
                <h2 className="text-lg font-bold font-display">Edit Data Siswa</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditStudent} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    NISN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="input font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-ghost">
                    Batal
                  </button>
                  <button type="submit" className="btn bg-amber-500 hover:bg-amber-600 text-white" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <>
                        <HiCheck className="w-4 h-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            IMPORT CSV MODAL
        ══════════════════════════════════════════════════════════════════ */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backdropFilter: 'blur(4px)' }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsImportModalOpen(false)} />
            
            <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white flex justify-between items-center flex-shrink-0">
                <h2 className="text-lg font-bold font-display">Import Siswa dari CSV</h2>
                <button onClick={() => setIsImportModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Instructions */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <h4 className="font-semibold text-teal-800 mb-2">Format CSV:</h4>
                  <p className="text-sm text-teal-700 mb-2">Satu siswa per baris dengan format:</p>
                  <code className="block bg-white px-3 py-2 rounded-lg text-sm font-mono text-teal-800">
                    Nama Lengkap, NISN, Email (opsional)
                  </code>
                  <p className="text-xs text-teal-600 mt-2">
                    Contoh: Budi Santoso, 0012345678, budi@email.com
                  </p>
                </div>

                {/* CSV Input */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Data CSV
                  </label>
                  <textarea
                    value={csvData}
                    onChange={handleCsvChange}
                    placeholder="Budi Santoso, 0012345678, budi@email.com&#10;Siti Aminah, 0012345679&#10;Rudi Hartono, 0012345680, rudi@email.com"
                    className="input min-h-[150px] font-mono text-sm"
                  />
                </div>

                {/* Preview */}
                {importPreview.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                      <HiCheck className="w-4 h-4 text-success-500" />
                      Preview ({importPreview.length} siswa valid)
                    </h4>
                    <div className="border border-neutral-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-neutral-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Nama</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">NISN</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500">Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {importPreview.map((s, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 text-neutral-800">{s.name}</td>
                              <td className="px-3 py-2 font-mono text-neutral-600">{s.nisn}</td>
                              <td className="px-3 py-2 text-neutral-500">{s.email || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {csvData && importPreview.length === 0 && (
                  <div className="flex items-center gap-2 text-warning-600 bg-warning-50 px-4 py-3 rounded-xl">
                    <HiExclamationTriangle className="w-5 h-5" />
                    <span className="text-sm">Tidak ada data valid. Pastikan format CSV benar.</span>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-neutral-100 flex justify-end gap-3 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => {
                    setCsvData('');
                    setImportPreview([]);
                    setIsImportModalOpen(false);
                  }} 
                  className="btn btn-ghost"
                >
                  Batal
                </button>
                <button 
                  onClick={handleBulkImport}
                  className="btn bg-teal-500 hover:bg-teal-600 text-white" 
                  disabled={isSubmitting || importPreview.length === 0}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <HiArrowUpTray className="w-4 h-4" />
                      Import {importPreview.length} Siswa
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['common'])),
    },
  };
}
