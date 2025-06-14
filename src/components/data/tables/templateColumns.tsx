"use client";
import Link from "next/link";
import { ROUTES } from "@/src/constants/routes";

export const templateColumns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: any) => (
      <Link href={`${ROUTES.TEMPLATES}/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: any) => <div className="capitalize">{row.original.category}</div>,
  },
  {
    accessorKey: "variables",
    header: "Variables",
  },
  {
    accessorKey: "isPublic",
    header: "Visibility",
    cell: ({ row }: any) => <div>{row.original.isPublic ? "Public" : "Private"}</div>,
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }: any) => <div>{new Date(row.original.updatedAt).toLocaleDateString()}</div>,
  },
];
