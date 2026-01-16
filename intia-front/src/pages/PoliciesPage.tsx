import { useEffect, useState, useRef } from "react";
import { api } from "../lib/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

const typeOptions = [
  { label: "Automobile", value: "AUTO" },
  { label: "Santé", value: "SANTE" },
  { label: "Habitation", value: "MAISON" },
  { label: "Voyage", value: "VOYAGE" },
  { label: "Autre", value: "AUTRE" },
];

const statusOptions = [
  { label: "Actif", value: "ACTIVE" },
  { label: "Expiré", value: "EXPIRE" },
  { label: "Résilié", value: "CANCELED" },
];

type Policy = any;

export default function PoliciesPage() {
  const toast = useRef<Toast>(null);

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const emptyForm = {
    policyNo: "",
    type: "AUTO",
    status: "ACTIVE",
    startDate: null as Date | null,
    endDate: null as Date | null,
    premium: 0,
    clientId: null as number | null,
    branchId: null as number | null,
  };

  const [form, setForm] = useState<any>(emptyForm);

  const load = async () => {
    const [p, c, b] = await Promise.all([
      api.get("/policies"),
      api.get("/clients"),
      api.get("/branches"),
    ]);

    setPolicies(p.data);

    setClients(
      (c.data.items ?? []).map((x: any) => ({
        label: `${x.firstName} ${x.lastName}`,
        value: x.id,
      }))
    );

    setBranches(
      (b.data ?? []).map((x: any) => ({
        label: x.name,
        value: x.id,
      }))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      policyNo: p.policyNo ?? "",
      type: p.type ?? "AUTO",
      status: p.status ?? "ACTIVE",
      startDate: p.startDate ? new Date(p.startDate) : null,
      endDate: p.endDate ? new Date(p.endDate) : null,
      premium: p.premium ?? 0,
      clientId: p.clientId ?? p.client?.id ?? null,
      branchId: p.branchId ?? p.branch?.id ?? null,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      const payload = {
        ...form,
        startDate: form.startDate?.toISOString(),
        endDate: form.endDate?.toISOString(),
      };

      // validations rapides côté UI
      if (!payload.policyNo) throw new Error("Numéro de police requis");
      if (!payload.clientId) throw new Error("Client requis");
      if (!payload.branchId) throw new Error("Agence requise");
      if (!payload.startDate || !payload.endDate) throw new Error("Dates requises");

      if (!editingId) {
        await api.post("/policies", payload);
        toast.current?.show({ severity: "success", summary: "Succès", detail: "Contrat créé" });
      } else {
        await api.patch(`/policies/${editingId}`, payload);
        toast.current?.show({ severity: "success", summary: "Succès", detail: "Contrat mis à jour" });
      }

      setOpen(false);
      setEditingId(null);
      load();
    } catch (e: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: e?.message ?? e?.response?.data?.message ?? "Erreur serveur",
      });
    }
  };

  const removePolicy = (p: any) => {
    confirmDialog({
      header: "Confirmer la suppression",
      message: `Supprimer le contrat ${p.policyNo} ?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Supprimer",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await api.delete(`/policies/${p.id}`);
          toast.current?.show({ severity: "success", summary: "OK", detail: "Contrat supprimé" });
          await load();
        } catch (e: any) {
          toast.current?.show({
            severity: "error",
            summary: "Erreur",
            detail: e?.response?.data?.message ?? "Erreur serveur",
          });
        }
      },
    });
  };

  const actionsBody = (p: any) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded outlined severity="info" tooltip="Modifier" onClick={() => openEdit(p)} />
      <Button icon="pi pi-trash" rounded outlined severity="danger" tooltip="Supprimer" onClick={() => removePolicy(p)} />
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-3">
        <h2>Gestion des contrats</h2>
        <Button label="Nouveau contrat" icon="pi pi-plus" onClick={openCreate} />
      </div>

      <DataTable value={policies} paginator rows={10} stripedRows showGridlines responsiveLayout="scroll">
        <Column field="policyNo" header="Police" />
        <Column field="type" header="Type" />
        <Column field="status" header="Statut" />
        <Column header="Client" body={(p) => (p.client ? `${p.client.firstName} ${p.client.lastName}` : "-")} />
        <Column header="Fin" body={(p) => (p.endDate ? new Date(p.endDate).toLocaleDateString() : "-")} />
        <Column
          header="Prime"
          body={(p) =>
            (p.premium ?? 0).toLocaleString("fr-FR", { style: "currency", currency: "XAF" })
          }
        />
        <Column header="Actions" body={actionsBody} style={{ width: "11rem" }} />
      </DataTable>

      <Dialog
        header={editingId ? "Modifier un contrat" : "Création d’un contrat"}
        visible={open}
        style={{ width: "40rem" }}
        onHide={() => setOpen(false)}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Annuler" className="p-button-text" onClick={() => setOpen(false)} />
            <Button label="Enregistrer" icon="pi pi-check" onClick={save} />
          </div>
        }
      >
        <div className="grid">
          <div className="col-12">
            <label>Numéro de police</label>
            <InputText className="w-full" value={form.policyNo} onChange={(e) => setForm({ ...form, policyNo: e.target.value })} />
          </div>

          <div className="col-6">
            <label>Type de contrat</label>
            <Dropdown className="w-full" options={typeOptions} value={form.type} onChange={(e) => setForm({ ...form, type: e.value })} />
          </div>

          <div className="col-6">
            <label>Statut</label>
            <Dropdown className="w-full" options={statusOptions} value={form.status} onChange={(e) => setForm({ ...form, status: e.value })} />
          </div>

          <div className="col-6">
            <label>Date de début</label>
            <Calendar className="w-full" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.value })} showIcon />
          </div>

          <div className="col-6">
            <label>Date de fin</label>
            <Calendar className="w-full" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.value })} showIcon />
          </div>

          <div className="col-6">
            <label>Prime</label>
            <InputNumber
              className="w-full"
              value={form.premium}
              onValueChange={(e) => setForm({ ...form, premium: e.value })}
              mode="currency"
              currency="XAF"
            />
          </div>

          <div className="col-6">
            <label>Client</label>
            <Dropdown
              className="w-full"
              options={clients}
              value={form.clientId}
              placeholder="Sélectionner un client"
              onChange={(e) => setForm({ ...form, clientId: e.value })}
              filter
            />
          </div>

          <div className="col-12">
            <label>Agence</label>
            <Dropdown
              className="w-full"
              options={branches}
              value={form.branchId}
              placeholder="Sélectionner une agence"
              onChange={(e) => setForm({ ...form, branchId: e.value })}
              filter
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
