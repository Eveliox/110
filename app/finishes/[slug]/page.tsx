import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinishPage } from "@/components/Studio";
import { finishes } from "@/lib/design";
export function generateStaticParams() { return finishes.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: {
    params: Promise<{
        slug: string;
    }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const finish = finishes.find((item) => item.slug === slug);
    return { title: `${finish?.name ?? "Finish not found"} | 110% Coatings`, description: finish?.description };
}
export default async function Page({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) {
    const { slug } = await params;
    const finish = finishes.find((item) => item.slug === slug);
    if (!finish)
        notFound();
    return <FinishPage finish={finish}/>;
}
