import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export default function BranchesPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get("/branches").then(r => setRows(r.data)); }, []);

  return (
    <div>
      <div className="text-xl font-semibold mb-3">Agences</div>
      <DataTable value={rows} paginator rows={10} responsiveLayout="scroll">
        <Column field="id" header="ID" style={{ width: 70 }} />
        <Column field="code" header="Code" />
        <Column field="name" header="Nom" />
      </DataTable>
    </div>
  );
}
