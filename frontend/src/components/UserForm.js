import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ClinicMultiSelect from "./ClinicMultiSelect";

export default function UserForm({ 
  initialData, 
  professionals = [], 
  clinics = [], 
  onSubmit, 
  onCancel, 
  isLoading 
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    user_type: "consultor",
    professional_id: "",
    is_admin: false,
    clinic_id: null
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "", // do not populate password on edit
        user_type: initialData.user_type || "consultor",
        professional_id: initialData.professional_id || "",
        is_admin: initialData.is_admin || (initialData.role?.is_admin) || false,
        clinic_id: initialData.clinic_id || (initialData.clinics && initialData.clinics.length > 0 ? (initialData.clinics[0].clinicId || initialData.clinics[0].id) : null)
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        user_type: "consultor",
        professional_id: "",
        is_admin: false,
        clinic_id: null
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome *</Label>
        <Input 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          required 
          placeholder="Nome completo do usuário"
        />
      </div>
      <div>
        <Label>Email *</Label>
        <Input 
          type="email" 
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
          placeholder="email@exemplo.com"
        />
      </div>
      {!initialData && (
        <div>
          <Label>Senha *</Label>
          <Input 
            type="password" 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
            placeholder="Mínimo 6 caracteres"
            minLength={6}
          />
        </div>
      )}
      <div>
        <Label>Tipo de Usuário</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
          value={formData.user_type}
          onChange={(e) => setFormData({...formData, user_type: e.target.value})}
        >
          <option value="admin">Super Usuário</option>
          <option value="consultor">Consultor</option>
          <option value="profissional">Profissional</option>
        </select>
      </div>
      {formData.user_type === "profissional" && (
        <div>
          <Label>Profissional Vinculado</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
            value={formData.professional_id}
            onChange={(e) => setFormData({...formData, professional_id: e.target.value})}
          >
            <option value="">Selecione um profissional</option>
            {professionals.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_admin"
          checked={formData.is_admin}
          onChange={(e) => setFormData({...formData, is_admin: e.target.checked})}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="is_admin">Permissão de Administrador</Label>
      </div>

      <div>
        <ClinicMultiSelect
          clinics={clinics}
          selectedClinicId={formData.clinic_id}
          onChange={(newClinicId) => setFormData({ ...formData, clinic_id: newClinicId })}
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="btn-secondary">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Criar Usuário")}
        </Button>
      </div>
    </form>
  );
}
