import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { HiAcademicCap, HiUser, HiIdentification, HiEnvelope } from 'react-icons/hi2';
import Swal from 'sweetalert2';
import Head from 'next/head';

export default function JoinClass() {
  const router = useRouter();
  const { classCode } = router.query;
  
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    email: ''
  });

  useEffect(() => {
    const fetchClassInfo = async () => {
      if (!classCode) return;
      
      try {
        const response = await fetch(`/api/classes?classCode=${classCode}`);
        if (response.ok) {
          const data = await response.json();
          setClassData(data);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Kelas Tidak Ditemukan',
            text: 'Kode kelas yang Anda masukkan tidak valid.',
            confirmButtonText: 'Kembali',
            customClass: { popup: 'rounded-xl' }
          }).then(() => {
            // Redirect or handle error
          });
        }
      } catch (error) {
        console.error('Error fetching class:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassInfo();
  }, [classCode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classData) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: classData.id,
          student: formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Bergabung!',
          text: `Selamat datang di kelas ${classData.name}.`,
          confirmButtonText: 'OK',
          customClass: { popup: 'rounded-xl' }
        }).then(() => {
            // Reset form or redirect
            setFormData({ name: '', nisn: '', email: '' });
        });
      } else {
        throw new Error(data.message || 'Gagal bergabung ke kelas');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Kelas Tidak Ditemukan</h1>
          <p className="text-neutral-600">Pastikan link atau kode kelas yang Anda gunakan benar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Head>
        <title>Bergabung ke Kelas {classData.name} - Auto Physics</title>
      </Head>

      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-brand -z-10"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute top-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up">
        <div className="p-8 text-center border-b border-neutral-100">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiAcademicCap className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-900 mb-1">Bergabung ke Kelas</h1>
          <p className="text-neutral-500">Lengkapi data diri Anda untuk masuk.</p>
          
          <div className="mt-6 bg-neutral-50 rounded-xl p-4 border border-neutral-200">
            <h2 className="font-bold text-lg text-neutral-900">{classData.name}</h2>
            <p className="text-sm text-neutral-600 mt-1">{classData.grade} • {classData.school}</p>
            <div className="mt-3 inline-block bg-white px-3 py-1 rounded border border-neutral-200 text-xs font-mono text-neutral-500">
              Kode: {classData.classCode}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Nama Lengkap</label>
            <div className="relative">
              <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input pl-10"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">NISN</label>
            <div className="relative">
              <HiIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                name="nisn"
                value={formData.nisn}
                onChange={handleChange}
                className="input pl-10"
                placeholder="Nomor Induk Siswa Nasional"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Email <span className="text-neutral-400 font-normal">(Opsional)</span></label>
            <div className="relative">
              <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input pl-10"
                placeholder="email@sekolah.sch.id"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg shadow-lg shadow-brand-500/20 mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
            ) : (
              'Gabung Kelas Sekarang'
            )}
          </button>
        </form>
      </div>
      
      <p className="mt-6 text-neutral-500 text-sm text-center">
        &copy; {new Date().getFullYear()} Auto Physics. All rights reserved.
      </p>
    </div>
  );
}
