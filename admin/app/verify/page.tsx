import { VerifyView } from "./_components/VerifyView";

export default async function VerifyPage({
  searchParams,
}: PageProps<"/verify">) {
  const { token } = await searchParams;
  const verificationToken = typeof token === "string" ? token : "";

  return <VerifyView token={verificationToken} />;
}
