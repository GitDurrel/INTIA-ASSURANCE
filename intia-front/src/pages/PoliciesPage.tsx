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

export default function PoliciesPage() {
  const toast = useRef<Toast>(null);

  const [policies, setPolicies] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<any>({
    policyNo: "",
    type: "AUTO",
    status: "ACTIVE",
    startDate: null,
    endDate: null,
    premium: 0,
    clientId: null,
    branchId: null,
  });

  const load = async () => {
    const [p, c, b] = await Promise.all([
      api.get("/policies"),
      api.get("/clients"),
      api.get("/branches"),
    ]);

    setPolicies(p.data);
    setClients(
      c.data.items.map((x: any) => ({
        label: `${x.firstName} ${x.lastName}`,
        value: x.id,
      }))
    );
    setBranches(
      b.data.map((x: any) => ({
        label: x.name,
        value: x.id,
      }))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      await api.post("/policies", {
        ...form,
        startDate: form.startDate?.toISOString(),
        endDate: form.endDate?.toISOString(),
      });
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: "Contrat créé avec succès",
      });
      setOpen(false);
      load();
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
        <h2>Gestion des contrats</h2>
        <Button
          label="Nouveau contrat"
          icon="pi pi-plus"
          onClick={() => setOpen(true)}
        />
      </div>

      <DataTable
        value={policies}
        paginator
        rows={10}
        stripedRows
        showGridlines
      >
        <Column field="policyNo" header="Police" />
        <Column field="type" header="Type" />
        <Column field="status" header="Statut" />
        <Column
          header="Client"
          body={(p) =>
            p.client ? `${p.client.firstName} ${p.client.lastName}` : "-"
          }
        />
        <Column
          header="Fin"
          body={(p) => new Date(p.endDate).toLocaleDateString()}
        />
        <Column
          header="Prime"
          body={(p) =>
            p.premium.toLocaleString("fr-FR", {
              style: "currency",
              currency: "XAF",
            })
          }
        />
      </DataTable>

      <Dialog
        header="Création d’un contrat"
        visible={open}
        style={{ width: "40rem" }}
        onHide={() => setOpen(false)}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Annuler" className="p-button-text" />
            <Button label="Enregistrer" icon="pi pi-check" onClick={save} />
          </div>
        }
      >
        <div className="grid">
          <div className="col-12">
            <label>Numéro de police</label>
            <InputText
              className="w-full"
              value={form.policyNo}
              onChange={(e) =>
                setForm({ ...form, policyNo: e.target.value })
              }
            />
          </div>

          <div className="col-6">
            <label>Type de contrat</label>
            <Dropdown
              className="w-full"
              options={typeOptions}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.value })}
            />
          </div>

          <div className="col-6">
            <label>Statut</label>
            <Dropdown
              className="w-full"
              options={statusOptions}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.value })}
            />
          </div>

          <div className="col-6">
            <label>Date de début</label>
            <Calendar
              className="w-full"
              value={form.startDate}
              onChange={(e) =>
                setForm({ ...form, startDate: e.value })
              }
              showIcon
            />
          </div>

          <div className="col-6">
            <label>Date de fin</label>
            <Calendar
              className="w-full"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.value })}
              showIcon
            />
          </div>

          <div className="col-6">
            <label>Prime</label>
            <InputNumber
              className="w-full"
              value={form.premium}
              onValueChange={(e) =>
                setForm({ ...form, premium: e.value })
              }
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
              onChange={(e) =>
                setForm({ ...form, clientId: e.value })
              }
            />
          </div>

          <div className="col-12">
            <label>Agence</label>
            <Dropdown
              className="w-full"
              options={branches}
              value={form.branchId}
              placeholder="Sélectionner une agence"
              onChange={(e) =>
                setForm({ ...form, branchId: e.value })
              }
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
