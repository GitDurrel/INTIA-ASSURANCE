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

export default function ClientsPage() {
  const toast = useRef<Toast>(null);

  const [items, setItems] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ici on lit le rôle depuis api.ts (headers)
  const role = (api.defaults.headers as any)?.["x-role"] as string | undefined;
  const isDG = role === "DG_ADMIN";

  const [form, setForm] = useState<any>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    cni: "",
    // branchId seulement utile côté DG (sinon forcé par header)
    branchId: null,
  });

  const branchOptions = useMemo(
    () =>
      branches.map((b: any) => ({
        label: b.name,
        value: b.id,
      })),
    [branches]
  );

  const load = async () => {
    setLoading(true);
    try {
      const [c, b] = await Promise.all([api.get("/clients"), api.get("/branches")]);
      setItems(c.data.items ?? []);
      setBranches(b.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      cni: "",
      branchId: null,
    });
  };

  const save = async () => {
    try {
      // Si DG: branchId obligatoire
      if (isDG && !form.branchId) {
        toast.current?.show({
          severity: "warn",
          summary: "Agence requise",
          detail: "Sélectionnez une agence pour ce client.",
        });
        return;
      }

      const payload = isDG
        ? form
        : {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            email: form.email,
            cni: form.cni || undefined,
            // branchId sera forcé par le service via x-branch-id
          };

      await api.post("/clients", payload);

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Client créé",
      });

      setOpen(false);
      resetForm();
      await load();
    } catch (e: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: e?.response?.data?.message ?? "Erreur serveur",
      });
    }
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-3">
        <div>
          <div className="text-xl font-semibold">Clients</div>
          <div className="text-500">
            Rôle courant :{" "}
            <Tag value={isDG ? "DG_ADMIN" : "AGENT"} severity={isDG ? "success" : "info"} />
          </div>
        </div>

        <Button
          label="Nouveau client"
          icon="pi pi-user-plus"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        />
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
        <Column
          header="Client"
          body={(c: any) => `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "-"}
        />
        <Column field="phone" header="Téléphone" />
        <Column field="email" header="Email" />
        <Column field="cni" header="CNI" />
        <Column header="Agence" body={(c: any) => c.branch?.name ?? "-"} />
      </DataTable>

      <Dialog
        header="Créer un client"
        visible={open}
        style={{ width: "36rem" }}
        onHide={() => setOpen(false)}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Annuler" className="p-button-text" onClick={() => setOpen(false)} />
            <Button label="Créer" icon="pi pi-check" onClick={save} />
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
