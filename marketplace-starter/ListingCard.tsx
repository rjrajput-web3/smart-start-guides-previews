"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Heart, Star } from "lucide-react";
import type { Listing } from "@/types";
import { formatPrice } from "@/types";
import { useMarketplaceStore } from "@/lib/store";

export default function ListingCard({ listing }: { listing: Listing }) {
  const toggleSaved = useMarketplaceStore((s) => s.toggleSaved);
  const isSaved = useMarketplaceStore((s) => s.isSaved(listing.id));

  return (
    <article className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/listings/${listing.slug}`} className="block">
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <Image
            src={listing.coverImage}
            alt={listing.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {listing.category}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/listings/${listing.slug}`}>
            <h3 className="font-semibold leading-snug text-slate-900 hover:text-brand-600">
              {listing.title}
            </h3>
          </Link>
          <button
            onClick={() => toggleSaved(listing)}
            aria-label={isSaved ? "Remove from saved" : "Save this service"}
            aria-pressed={isSaved}
            className="shrink-0 rounded-full p-1.5 hover:bg-slate-100"
          >
            <Heart className={`h-5 w-5 ${isSaved ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {listing.seller.name} · {listing.seller.location}
        </p>
        <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
          <span className="flex items-center gap-1 font-medium text-slate-900">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {listing.rating.toFixed(1)} ({listing.reviewCount})
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {listing.deliveryDays} days
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <span className="text-sm text-slate-500">
            From <span className="text-lg font-bold text-slate-900">{formatPrice(listing.priceCents)}</span>
          </span>
          <span className="text-xs text-slate-500">{listing.ordersCompleted} orders done</span>
        </div>
      </div>
    </article>
  );
}
