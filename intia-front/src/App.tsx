import { useState } from "react";
import { Menubar } from "primereact/menubar";
import { Card } from "primereact/card";
import Dashboard from "./pages/Dashboard";
import ClientsPage from "./pages/ClientsPage";
import PoliciesPage from "./pages/PoliciesPage";
import BranchesPage from "./pages/BranchesPage";

type Page = "dashboard" | "clients" | "policies" | "branches";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const items = [
    { label: "Dashboard", icon: "pi pi-home", command: () => setPage("dashboard") },
    { label: "Clients", icon: "pi pi-users", command: () => setPage("clients") },
    { label: "Assurances", icon: "pi pi-file", command: () => setPage("policies") },
    { label: "Agences", icon: "pi pi-building", command: () => setPage("branches") },
  ];

  return (
    <div className="min-h-screen surface-ground">
      <Menubar model={items} />
      <div className="p-4">
        <Card className="shadow-1">
          {page === "dashboard" && <Dashboard />}
          {page === "clients" && <ClientsPage />}
          {page === "policies" && <PoliciesPage />}
          {page === "branches" && <BranchesPage />}
        </Card>
      </div>
    </div>
  );
}
