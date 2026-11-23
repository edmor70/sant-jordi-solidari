import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/qui-som")({ beforeLoad: () => { throw redirect({ to: "/contacte", statusCode: 301 }); } });
