import React, { useState, useMemo, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClinicMultiSelect({
  clinics = [],
  selectedClinicId = null,
  onChange,
  label = "Clínica Vinculada",
  placeholder = "Buscar e selecionar clínica",
  required = false,
  error = null
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredClinics = useMemo(() => {
    if (!searchTerm) return clinics;
    return clinics.filter((clinic) =>
      clinic.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clinics, searchTerm]);

  const selectedClinic = useMemo(() => {
    return clinics.find((c) => c.id === selectedClinicId) || null;
  }, [selectedClinicId, clinics]);

  const handleSelect = (clinicId) => {
    onChange(clinicId);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {/* Tag da clínica selecionada */}
      {selectedClinic && (
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
            <span>{selectedClinic.nome}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="hover:text-blue-900 focus:outline-none focus:text-blue-900 rounded-full p-0.5"
              aria-label={`Remover ${selectedClinic.nome}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Campo de busca e dropdown */}
      {!selectedClinic && (
        <div className="relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className={error ? "border-red-500" : ""}
          />

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredClinics.length > 0 ? (
                <ul className="py-1">
                  {filteredClinics.map((clinic) => {
                    return (
                      <li
                        key={clinic.id}
                        onClick={() => handleSelect(clinic.id)}
                        className="px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 text-gray-700"
                      >
                        {clinic.nome}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Nenhuma clínica encontrada
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mensagem de erro */}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
