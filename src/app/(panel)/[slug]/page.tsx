import { notFound } from "next/navigation";
import { appGroups, getGroup } from "@/components/lib/apps";
import { GroupPage } from "@/components/GroupPage";

export function generateStaticParams() {
  return appGroups.map((group) => ({ slug: group.slug }));
}

export default async function GroupRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = getGroup(slug);

  if (!group) {
    notFound();
  }

  return <GroupPage groupSlug={group.slug} />;
}
