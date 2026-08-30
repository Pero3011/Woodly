import { ShoppingCart } from "lucide-react";

interface DetailsProps {
  Category: string;
  Title: string;
  Price: number;
  Description: string;
  Badge?: string;
  OriginalPrice?: number;
  Dimensions?: string;
  Weight?: string;
  LeadTime?: string;
  Origin?: string;
}

export default function Details({
  Category,
  Title,
  Price,
  Description,
  Badge,
  OriginalPrice,
  Dimensions,
  Weight,
  LeadTime,
  Origin,
}: DetailsProps) {
  return (
    <div className="max-w-md mx-auto px-6 py-8">
      {/* Badge */}
      {Badge && (
        <span className="inline-block bg-[#3A2E22] text-[#F5EFE4] text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
          {Badge}
        </span>
      )}

      {/* Title */}
      <h1 className="font-serif text-4xl leading-tight text-[#2A1E17] mb-3">
        {Title}
      </h1>

      {/* Category */}
      <span className="block uppercase text-xs font-semibold tracking-widest text-[#8A7A68] mb-4">
        Category: {Category}
      </span>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-2xl font-semibold text-[#D98A3D]">
          ${Price.toLocaleString()}
        </span>
        {OriginalPrice && (
          <span className="text-base text-[#B5A794] line-through">
            ${OriginalPrice.toLocaleString()}
          </span>
        )}
      </div>

      <hr className="border-[#E5D9C7] mb-6" />

      {/* Material & Build */}
      <h2 className="uppercase text-xs font-semibold tracking-widest text-[#6D5A4D] mb-3">
        Material &amp; Build
      </h2>
      <p className="text-sm leading-relaxed text-[#5A4C3F] mb-6">
        {Description}
      </p>

      <hr className="border-[#E5D9C7] mb-6" />

      {/* Spec grid */}
      {(Dimensions || Weight || LeadTime || Origin) && (
        <>
          <div className="grid grid-cols-2 gap-y-5 mb-6">
            {Dimensions && (
              <div>
                <span className="block uppercase text-[10px] font-semibold tracking-widest text-[#8A7A68] mb-1">
                  Dimensions
                </span>
                <span className="text-sm font-medium text-[#2A1E17]">
                  {Dimensions}
                </span>
              </div>
            )}
            {Weight && (
              <div>
                <span className="block uppercase text-[10px] font-semibold tracking-widest text-[#8A7A68] mb-1">
                  Weight
                </span>
                <span className="text-sm font-medium text-[#2A1E17]">
                  {Weight}
                </span>
              </div>
            )}
            {LeadTime && (
              <div>
                <span className="block uppercase text-[10px] font-semibold tracking-widest text-[#8A7A68] mb-1">
                  Lead Time
                </span>
                <span className="text-sm font-medium text-[#2A1E17]">
                  {LeadTime}
                </span>
              </div>
            )}
            {Origin && (
              <div>
                <span className="block uppercase text-[10px] font-semibold tracking-widest text-[#8A7A68] mb-1">
                  Origin
                </span>
                <span className="text-sm font-medium text-[#2A1E17]">
                  {Origin}
                </span>
              </div>
            )}
          </div>
          <hr className="border-[#E5D9C7] mb-6" />
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <button className="flex-1 flex items-center justify-center gap-2 bg-[#5C4530] hover:bg-[#4A3826] transition-colors text-[#F5EFE4] text-xs font-semibold uppercase tracking-wider py-3.5 rounded-lg">
          <ShoppingCart size={16} />
          Add to Cart
        </button>
        <button className="flex-1 bg-[#D98A3D] hover:bg-[#C97A2D] transition-colors text-white text-xs font-semibold uppercase tracking-wider py-3.5 rounded-lg">
          Buy Now
        </button>
      </div>

      <p className="text-center text-[11px] text-[#A99A87]">
        Certificate of Authenticity Included
      </p>
    </div>
  );
}
