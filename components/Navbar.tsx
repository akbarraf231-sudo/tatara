import { getSettings } from "@/lib/settings";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const settings = await getSettings();
  return <NavbarClient businessName={settings.business_name} />;
}
