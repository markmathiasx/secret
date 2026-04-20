import { redirect } from "next/navigation";

type ConfirmPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function PasswordRecoveryConfirmPage({ searchParams }: ConfirmPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = typeof resolvedSearchParams?.token === "string" ? resolvedSearchParams.token : "";

  if (!token) {
    redirect("/recuperar-senha");
  }

  redirect(`/recuperar-senha?token=${encodeURIComponent(token)}`);
}
