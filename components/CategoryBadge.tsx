import Link from "next/link";
import { CATEGORY_COLORS, CATEGORY_TO_SLUG } from "@/types";
import type { Category } from "@/types";

interface Props {
  category: Category;
  asLink?: boolean;
}

export default function CategoryBadge({ category, asLink = false }: Props) {
  const colors = CATEGORY_COLORS[category] ?? {
    bg: "bg-gray-100",
    text: "text-gray-700",
  };
  const slug = CATEGORY_TO_SLUG[category];

  const badge = (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${colors.bg} ${colors.text}`}
    >
      {category}
    </span>
  );

  if (asLink && slug) {
    return (
      <Link href={`/category/${slug}`} className="hover:opacity-80 transition-opacity">
        {badge}
      </Link>
    );
  }

  return badge;
}
