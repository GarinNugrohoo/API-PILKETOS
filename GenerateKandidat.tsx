// src/components/panitia/GenerateKandidat.tsx
import { useState, useEffect, useRef } from "react";
import {
  RiAddLine,
  RiUserAddLine,
  RiImageAddLine,
  RiCloseLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiDeleteBin6Line,
} from "react-icons/ri";
import { kandidatApi } from "../../services/api";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// ─────────────────────────────────────────────
// Modal Component
// ─────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, message, type }: ModalProps) => {
  if (!isOpen) return null;

  const icons = {
    success: <RiCheckLine className="text-green-500" size={24} />,
    error: <RiErrorWarningLine className="text-red-500" size={24} />,
    info: <RiInformationLine className="text-blue-500" size={24} />,
    warning: <RiErrorWarningLine className="text-amber-500" size={24} />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white border-2 border-slate-800 max-w-md w-full">
        <div className="border-b-2 border-slate-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {icons[type]}
            <h3 className="font-mono font-black text-sm uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 transition-colors"
          >
            <RiCloseLine size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="font-mono text-sm text-slate-600">{message}</p>
        </div>
        <div className="border-t-2 border-slate-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Status Message Component
// ─────────────────────────────────────────────
const StatusMessage = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "bg-green-50 border-l-green-500",
    error: "bg-red-50 border-l-red-500",
    info: "bg-blue-50 border-l-blue-500",
  };

  return (
    <div className={`${bgColors[type]} border-l-4 p-3`}>
      <div className="flex justify-between items-start gap-3">
        <p className="text-[11px] font-mono flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <RiCloseLine size={14} />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function GenerateKandidat() {
  const [formData, setFormData] = useState({
    nama_kandidat: "",
    nomor_urut: "",
    username: "",
    password: "",
    visi: "",
    image: null as File | null,
  });

  // Misi sebagai array — user tidak perlu tahu format separator
  const [misiArray, setMisiArray] = useState<string[]>([""]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalProps>({
    isOpen: false,
    onClose: () => {},
    title: "",
    message: "",
    type: "info",
  });
  const [statusMessage, setStatusMessage] = useState<{
    message: string;
    type: "success" | "error" | "info";
    id: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showModal = (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => {
    setModal({
      isOpen: true,
      onClose: () => setModal((prev) => ({ ...prev, isOpen: false })),
      title,
      message,
      type,
    });
  };

  const showStatusMessage = (
    message: string,
    type: "success" | "error" | "info",
  ) => {
    const id = Date.now();
    setStatusMessage({ message, type, id });
    setTimeout(
      () => setStatusMessage((prev) => (prev?.id === id ? null : prev)),
      5000,
    );
  };

  // ── Misi handlers ──
  const handleMisiChange = (idx: number, val: string) => {
    const next = [...misiArray];
    next[idx] = val;
    setMisiArray(next);
  };

  const handleAddMisi = () => setMisiArray((prev) => [...prev, ""]);

  const handleDeleteMisi = (idx: number) =>
    setMisiArray((prev) => prev.filter((_, i) => i !== idx));

  // ── Image handler ──
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showModal(
        "Error",
        "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.",
        "error",
      );
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showModal("Error", "Ukuran file maksimal 2MB.", "error");
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomor_urut)
      return showStatusMessage("Nomor urut harus diisi!", "error");
    if (!formData.nama_kandidat)
      return showStatusMessage("Nama kandidat harus diisi!", "error");
    if (!formData.username)
      return showStatusMessage("Username harus diisi!", "error");
    if (!formData.password)
      return showStatusMessage("Password harus diisi!", "error");
    if (!formData.visi) return showStatusMessage("Visi harus diisi!", "error");
    if (!formData.image)
      return showStatusMessage("Foto kandidat harus diupload!", "error");

    const validMisi = misiArray.map((m) => m.trim()).filter(Boolean);
    if (validMisi.length === 0)
      return showStatusMessage("Minimal harus ada 1 misi!", "error");

    setIsSubmitting(true);
    showStatusMessage("Menyimpan data kandidat...", "info");

    try {
      const payload = {
        nomor_urut: parseInt(formData.nomor_urut),
        nama_kandidat: formData.nama_kandidat,
        username: formData.username,
        password: formData.password,
        visi: formData.visi,
        // Kirim sebagai plain string dengan separator || — konsisten dengan updateData
        misi: validMisi.join(" || "),
        image_kandidat: formData.image,
      };

      const response = await kandidatApi.create(payload);

      if (response?.success || response?.data) {
        showStatusMessage("Kandidat berhasil ditambahkan!", "success");
        // Reset form
        setFormData({
          nama_kandidat: "",
          nomor_urut: "",
          username: "",
          password: "",
          visi: "",
          image: null,
        });
        setMisiArray([""]);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        showModal(
          "Gagal",
          response?.message || "Gagal menambahkan kandidat",
          "error",
        );
      }
    } catch (err: any) {
      console.error("Error:", err);
      showModal(
        "Error",
        err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat menambahkan kandidat",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Modal {...modal} />
      {statusMessage && (
        <StatusMessage
          message={statusMessage.message}
          type={statusMessage.type}
          onClose={() => setStatusMessage(null)}
        />
      )}

      {/* Header */}
      <div className="border-b-2 border-slate-800 pb-4">
        <h3 className="text-2xl font-mono font-black uppercase tracking-tighter">
          GENERATE KANDIDAT
        </h3>
        <p className="text-xs font-mono text-slate-400 mt-1 uppercase">
          G-VOTE Candidate Management System // Tambah kandidat baru
        </p>
      </div>

      {/* Form Panel */}
      <div className="border-2 border-slate-800 bg-white">
        <div className="border-b-2 border-slate-800 bg-slate-100 px-5 py-3">
          <h2 className="text-sm font-mono font-black uppercase tracking-wider flex items-center gap-2">
            <RiUserAddLine size={18} />
            CONTROL PANEL // INPUT KANDIDAT
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1 — Nomor Urut & Nama */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                NOMOR URUT
              </label>
              <input
                type="number"
                min={1}
                value={formData.nomor_urut}
                onChange={(e) =>
                  setFormData({ ...formData, nomor_urut: e.target.value })
                }
                placeholder="Contoh: 1"
                className="w-full h-12 border-2 border-slate-800 px-3 font-mono font-bold focus:outline-none focus:bg-slate-50 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                NAMA KANDIDAT
              </label>
              <input
                type="text"
                value={formData.nama_kandidat}
                onChange={(e) =>
                  setFormData({ ...formData, nama_kandidat: e.target.value })
                }
                placeholder="Contoh: Pasangan Calon A & B"
                className="w-full h-12 border-2 border-slate-800 px-3 font-mono focus:outline-none focus:bg-slate-50 transition-all"
                required
              />
            </div>
          </div>

          {/* Row 2 — Username & Password */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                USERNAME
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Username untuk login kandidat"
                className="w-full h-12 border-2 border-slate-800 px-3 font-mono focus:outline-none focus:bg-slate-50 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                PASSWORD
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Password untuk login kandidat"
                className="w-full h-12 border-2 border-slate-800 px-3 font-mono focus:outline-none focus:bg-slate-50 transition-all"
                required
              />
            </div>
          </div>

          {/* Visi */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              VISI
            </label>
            <textarea
              rows={3}
              value={formData.visi}
              onChange={(e) =>
                setFormData({ ...formData, visi: e.target.value })
              }
              placeholder="Masukkan visi kandidat"
              className="w-full border-2 border-slate-800 px-3 py-2 font-mono text-sm focus:outline-none focus:bg-slate-50 transition-all resize-none"
              required
            />
          </div>

          {/* Misi — dynamic list, user tidak perlu tahu format || */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              MISI
            </label>

            <div className="space-y-2">
              {misiArray.map((misi, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  {/* Nomor */}
                  <span className="w-7 h-10 shrink-0 border-2 border-slate-800 bg-slate-50 flex items-center justify-center text-xs font-mono font-black text-slate-600">
                    {idx + 1}
                  </span>
                  {/* Input */}
                  <input
                    type="text"
                    value={misi}
                    onChange={(e) => handleMisiChange(idx, e.target.value)}
                    placeholder={`Misi ke-${idx + 1}`}
                    className="flex-1 h-10 border-2 border-slate-800 px-3 font-mono text-sm focus:outline-none focus:bg-slate-50 transition-all"
                  />
                  {/* Hapus — hanya tampil kalau lebih dari 1 item */}
                  {misiArray.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMisi(idx)}
                      className="h-10 px-3 border-2 border-red-400 text-red-500 hover:bg-red-50 transition-colors"
                      title="Hapus misi ini"
                    >
                      <RiDeleteBin6Line size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddMisi}
              className="flex items-center gap-1 px-3 py-1.5 border-2 border-dashed border-slate-400 text-slate-500 font-mono text-xs hover:border-slate-800 hover:text-slate-800 transition-colors"
            >
              <RiAddLine size={13} /> TAMBAH MISI
            </button>

            <p className="text-[9px] font-mono text-slate-400">
              Tiap baris = 1 poin misi yang ditampilkan di halaman voting
            </p>
          </div>

          {/* Upload Foto */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              FOTO KANDIDAT
            </label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border-2 border-slate-800 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                <RiImageAddLine size={16} />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Pilih Foto
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {formData.image && (
                <span className="text-xs font-mono text-slate-600 self-center">
                  📷 {formData.image.name}
                </span>
              )}
            </div>

            {imagePreview && (
              <div className="mt-3">
                <div className="w-32 h-40 border-2 border-slate-800 overflow-hidden bg-slate-100">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[9px] font-mono text-slate-400 mt-1">
                  Preview (rasio 4:5 direkomendasikan)
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-slate-900 text-white flex items-center justify-center gap-3 border-2 border-slate-900 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                <span className="font-mono font-bold uppercase tracking-wider text-sm">
                  PROCESSING...
                </span>
              </>
            ) : (
              <>
                <RiAddLine size={18} />
                <span className="font-mono font-bold uppercase tracking-wider text-sm">
                  GENERATE KANDIDAT
                </span>
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="border-l-4 border-slate-800 bg-slate-50 p-3 space-y-1">
            <p className="text-[10px] font-mono text-slate-600 leading-relaxed">
              SYSTEM INFO: Pastikan foto kandidat memiliki rasio 4:5 untuk hasil
              terbaik.
            </p>
            <p className="text-[9px] font-mono text-slate-500">
              • Format yang didukung: JPG, PNG, WEBP • Maksimal ukuran: 2MB
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
