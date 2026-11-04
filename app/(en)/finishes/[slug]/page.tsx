import { notFound } from "next/navigation";
import { FinishPage } from "@/components/Studio";
import { finishMetadata, finishParams, isFinish } from "@/lib/finish-route";

export const generateStaticParams = finishParams;
export const generateMetadata = ({ params }: PageProps<"/finishes/[slug]">) => finishMetadata("en", params);

export default async function Page({ params }: PageProps<"/finishes/[slug]">) {
  const { slug } = await params;
  if (!isFinish(slug)) notFound();
  return <FinishPage slug={slug} />;
}
