/* THIS FILE IS PART OF PAYLOAD'S ADMIN MOUNT. It renders its own <html>/<body>,
   which is why the site lives in the (frontend) route group with a layout of
   its own — the two never share a shell, and the admin's CSS and JS never reach
   a public page. */
import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
// Payload's base stylesheet: theme variables, resets, layer order. Without it
// the component styles below have no custom properties to read and the whole
// admin renders unstyled.
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import { importMap } from "./admin/importMap.js";
import "./custom.scss";

type Args = { children: React.ReactNode };

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default async function Layout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
