import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { auth } from "~/server/auth";

export default async function Layout({ children }: PropsWithChildren) {
  const session = await auth();

  // if (!session?.user) {
  //   return redirect("/login");
  // }

  return children;
}
