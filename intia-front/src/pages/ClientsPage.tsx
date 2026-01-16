import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

type Client = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  cni?: string | null;
  isActive?: boolean;
  branchId?: number | null;
  branch?: { id: number; name: string } | null;
};

export default function ClientsPage() {
  const toast = useRef<Toast>(null);

  const [items, setItems] = useState<Client[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Rôle depuis api.ts (headers)
  const role = (api.defaults.headers as any)?.["x-role"] as string | undefined;
  const isDG = role === "DG_ADMIN";

  const [editingId, setEditingId] = useState<number | null>(null);

  const emptyForm = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    cni: "",
    branchId: null as number | null, // utile surtout en DG
  };

  const [form, setForm] = useState<any>(emptyForm);

  const branchOptions = useMemo(
    () =>
      (branches ?? []).map((b: any) => ({
        label: b.name,
        value: b.id,
      })),
    [branches]
  );

  const load = async () => {
    setLoading(true);
    try {
      const [c, b] = await Promise.all([api.get("/clients"), api.get("/branches")]);
      setItems((c.data.items ?? []) as Client[]);
      setBranches(b.data ?? []);
    } catch (e: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: e?.response?.data?.message ?? "Impossible de charger les clients",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (c: Client) => {
    setEditingId(c.id);
    setForm({
      firstName: c.firstName ?? "",
      lastName: c.lastName ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
      cni: c.cni ?? "",
      branchId: c.branchId ?? c.branch?.id ?? null,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      // Validation simple
      if (!form.firstName?.trim() || !form.lastName?.trim() || !form.phone?.trim()) {
        toast.current?.show({
          severity: "warn",
          summary: "Champs requis",
          detail: "Prénom, Nom et Téléphone sont obligatoires.",
        });
        return;
      }

      // En création : DG doit choisir agence (sinon le service refuse)
      if (!editingId && isDG && !form.branchId) {
        toast.current?.show({
          severity: "warn",
          summary: "Agence requise",
          detail: "Sélectionnez une agence pour créer le client.",
        });
        return;
      }

      // Payload (en AGENT, branchId est ignoré/forcé par header côté backend)
      const payload = isDG
        ? {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            email: form.email?.trim() || undefined,
            cni: form.cni?.trim() || undefined,
            branchId: form.branchId,
          }
        : {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            email: form.email?.trim() || undefined,
            cni: form.cni?.trim() || undefined,
          };

      if (!editingId) {
        await api.post("/clients", payload);
        toast.current?.show({ severity: "success", summary: "OK", detail: "Client créé" });
      } else {
        await api.patch(`/clients/${editingId}`, payload);
        toast.current?.show({ severity: "success", summary: "OK", detail: "Client mis à jour" });
      }

      setOpen(false);
      setEditingId(null);
      await load();
    } catch (e: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: e?.response?.data?.message ?? "Erreur serveur",
      });
    }
  };

  // Soft delete => ton backend fait isActive=false sur DELETE /clients/:id
  const deactivateClient = (c: Client) => {
    confirmDialog({
      header: "Confirmer la désactivation",
      message: `Désactiver le client ${c.firstName} ${c.lastName} ?`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Désactiver",
      rejectLabel: "Annuler",
      acceptClassName: "p-button-warning",
      accept: async () => {
        try {
          await api.delete(`/clients/${c.id}`);
          toast.current?.show({ severity: "success", summary: "OK", detail: "Client désactivé" });
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

  const statusBody = (c: Client) => (
    <Tag value={c.isActive === false ? "Désactivé" : "Actif"} severity={c.isActive === false ? "danger" : "success"} />
  );

  const clientBody = (c: Client) =>
    `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "-";

  const actionsBody = (c: Client) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        outlined
        severity="info"
        tooltip="Modifier"
        onClick={() => openEdit(c)}
      />
      {c.isActive === false ? (
        <Button
          icon="pi pi-ban"
          rounded
          outlined
          severity="secondary"
          tooltip="Déjà désactivé"
          disabled
        />
      ) : (
        <Button
          icon="pi pi-ban"
          rounded
          outlined
          severity="warning"
          tooltip="Désactiver"
          onClick={() => deactivateClient(c)}
        />
      )}
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-3">
        <div>
          <div className="text-xl font-semibold">Clients</div>
          <div className="text-500">
            Rôle courant :{" "}
            <Tag value={isDG ? "DG_ADMIN" : "AGENT"} severity={isDG ? "success" : "info"} />
          </div>
          {!isDG && (
            <div className="text-500">
              Astuce : en mode AGENT, assure-toi d’avoir <b>x-branch-id</b> dans <code>api.ts</code>.
            </div>
          )}
        </div>

        <Button label="Nouveau client" icon="pi pi-user-plus" onClick={openCreate} />
      </div>

      <DataTable
        value={items}
        loading={loading}
        paginator
        rows={10}
        stripedRows
        showGridlines
        responsiveLayout="scroll"
        emptyMessage="Aucun client."
      >
        <Column header="Client" body={clientBody} />
        <Column field="phone" header="Téléphone" />
        <Column field="email" header="Email" />
        <Column field="cni" header="CNI" />
        <Column header="Agence" body={(c: Client) => c.branch?.name ?? "-"} />
        <Column header="Statut" body={statusBody} style={{ width: "9rem" }} />
        <Column header="Actions" body={actionsBody} style={{ width: "12rem" }} />
      </DataTable>

      <Dialog
        header={editingId ? "Modifier un client" : "Créer un client"}
        visible={open}
        style={{ width: "38rem" }}
        onHide={() => setOpen(false)}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Annuler" className="p-button-text" onClick={() => setOpen(false)} />
            <Button label={editingId ? "Enregistrer" : "Créer"} icon="pi pi-check" onClick={save} />
          </div>
        }
      >
        <div className="grid">
          <div className="col-6">
            <label className="block mb-1">Prénom *</label>
            <InputText
              className="w-full"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>

          <div className="col-6">
            <label className="block mb-1">Nom *</label>
            <InputText
              className="w-full"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <div className="col-12">
            <label className="block mb-1">Téléphone *</label>
            <InputText
              className="w-full"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Ex: 6XXXXXXXX"
            />
          </div>

          <div className="col-12">
            <label className="block mb-1">Email</label>
            <InputText
              className="w-full"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Ex: client@mail.com"
            />
          </div>

          <div className="col-12">
            <label className="block mb-1">CNI</label>
            <InputText
              className="w-full"
              value={form.cni}
              onChange={(e) => setForm({ ...form, cni: e.target.value })}
              placeholder="Optionnel"
            />
          </div>

          {isDG ? (
            <div className="col-12">
              <label className="block mb-1">Agence *</label>
              <Dropdown
                className="w-full"
                options={branchOptions}
                value={form.branchId}
                placeholder="Sélectionner une agence"
                onChange={(e) => setForm({ ...form, branchId: e.value })}
                filter
              />
              <small className="text-500">
                En mode DG, vous choisissez l’agence du client.
              </small>
            </div>
          ) : (
            <div className="col-12">
              <div className="p-2 border-round surface-100">
                <i className="pi pi-info-circle mr-2" />
                En mode <b>AGENT</b>, l’agence est imposée par le header <b>x-branch-id</b>.
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
