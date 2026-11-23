import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/la-diada")({ beforeLoad: () => { throw redirect({ to: "/colaboracio", statusCode: 301 }); } });
