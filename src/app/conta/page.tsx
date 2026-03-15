import type { Metadata } from "next";
import { AccountOptionalPage } from "@/components/account-optional-page";

export const metadata: Metadata = {
  title: "Conta",
  robots: {
    index: false,
    follow: false
  }
};

export default function AccountPage() {
  return <AccountOptionalPage />;
}
