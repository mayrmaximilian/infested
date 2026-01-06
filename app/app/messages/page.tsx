import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function MessagesPage({
  searchParams,
}: {
  searchParams?: { room?: string };
}) {
  const room = searchParams?.room;
  if (room) {
    redirect(`/app/social?room=${room}#messages`);
  }
  redirect("/app/social#messages");
}
