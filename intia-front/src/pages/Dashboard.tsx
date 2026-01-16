import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { ProgressSpinner } from "primereact/progressspinner";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/admin-stats/overview").then((r) => setData(r.data));
  }, []);

  if (!data) return <ProgressSpinner />;

  const t = data.totals;

  return (
    <div className="grid">
      <div className="col-12 md:col-3">
        <div className="p-3 border-round surface-card shadow-1">
          <div className="text-500">Clients</div>
          <div className="text-2xl font-bold">{t.clients}</div>
        </div>
      </div>
      <div className="col-12 md:col-3">
        <div className="p-3 border-round surface-card shadow-1">
          <div className="text-500">Contrats</div>
          <div className="text-2xl font-bold">{t.policies}</div>
        </div>
      </div>
      <div className="col-12 md:col-3">
        <div className="p-3 border-round surface-card shadow-1">
          <div className="text-500">Actifs</div>
          <div className="text-2xl font-bold">{t.policiesActive}</div>
        </div>
      </div>
      <div className="col-12 md:col-3">
        <div className="p-3 border-round surface-card shadow-1">
          <div className="text-500">Résiliés</div>
          <div className="text-2xl font-bold">{t.policiesCanceled}</div>
        </div>
      </div>

      <div className="col-12">
        <div className="mt-3">
          <div className="text-xl font-semibold mb-2">Contrats expirant bientôt</div>
          <ul className="m-0 pl-3">
            {data.expiringSoon?.map((p: any) => (
              <li key={p.id}>
                <b>{p.policyNo}</b> — {p.client?.firstName} {p.client?.lastName} — fin:{" "}
                {new Date(p.endDate).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
