import { createFileRoute } from "@tanstack/react-router";
import { RepublicOS } from "@/components/republic/RepublicOS";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "REPUBLIC/OS v4 — West Delhi Command Center" },
      { name: "description", content: "Real-time civic operations dashboard for West Delhi sectors. Live AQI, weather, traffic, and mission control." },
    ],
  }),
});

function Index() {
  return <RepublicOS />;
}
