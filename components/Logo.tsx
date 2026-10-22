import Image from "next/image";

export function Logo({ width, size = "md", priority = false }: {
  variant?: "dark" | "light" | "mono-dark" | "mono-light";
  size?: "sm" | "md" | "lg";
  width?: number;
  priority?: boolean;
}) {
  const w = width ?? { sm: 120, md: 160, lg: 220 }[size];
  return (
    <span className="actual-logo" style={{ width: w }} role="img" aria-label="110% Coatings">
      <Image src="/110-coatings-logo.png" alt="" width={2048} height={683} preload={priority} sizes="240px" className="actual-logo-image" />
    </span>
  );
}
