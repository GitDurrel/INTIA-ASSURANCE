import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    // Fake-auth: DG voit tout. Change en AGENT + x-branch-id si tu veux simuler agence
    "x-role": "DG_ADMIN",
    // "x-role": "AGENT",
    // "x-branch-id": "1",
  },
});

