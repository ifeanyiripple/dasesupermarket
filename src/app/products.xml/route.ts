import { db } from "@/lib/db"

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://dasesupermarket.com"

function escapeXML(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function parseKeyFeatures(value: unknown): string[] {
  if (Array.isArray(value))
    return value.filter((v): v is string => typeof v === "string" && v.trim() !== "")
  return []
}

export async function GET() {
  const products = await db.product.findMany({
    include: {
      images: {
        take: 10,
        orderBy: { id: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>DASE Supermarket Products</title>
<link>${escapeXML(BASE_URL)}</link>
<description>Complete product catalog from DASE Supermarket</description>

${products
  .map((product) => {
    const productUrl = escapeXML(`${BASE_URL}/product/${product.id}`)
    const images = product.images.map((img) => img.image)
    const primaryImage = escapeXML(images[0] || `${BASE_URL}/placeholder.jpg`)
    const additionalImages = images.slice(1, 10) // Google supports up to 10

    const keyFeatures = parseKeyFeatures(product.keyFeatures)

    // Build product details for specs (netContent, containerType, etc.)
    const specEntries: { section: string; attribute: string; value: string | null }[] = [
      { section: "General",  attribute: "Net Content",       value: (product as any).netContent      ?? null },
      { section: "General",  attribute: "Container Type",    value: (product as any).containerType   ?? null },
      { section: "General",  attribute: "Origin",            value: (product as any).countryOfOrigin ?? null },
      { section: "Storage",  attribute: "Storage Info",      value: (product as any).storageInfo     ?? null },
    ]
    const validSpecs = specEntries.filter((s) => s.value)

    // If product has a sale (originalPrice > price), surface both
    const originalPrice: number | null = (product as any).originalPrice ?? null
    const hasSale = originalPrice !== null && originalPrice > product.price

    return `<item>
<g:id>${escapeXML(product.id)}</g:id>
<title>${escapeXML(product.name)}${product.brand ? ` by ${escapeXML(product.brand)}` : ""}</title>
<description>${escapeXML(product.description)}${keyFeatures.length > 0 ? ` | Features: ${escapeXML(keyFeatures.join(", "))}` : ""}</description>
<link>${productUrl}</link>
<g:image_link>${primaryImage}</g:image_link>
${additionalImages.map((img) => `<g:additional_image_link>${escapeXML(img)}</g:additional_image_link>`).join("\n")}
<g:availability>${product.inStock ? "in stock" : "out of stock"}</g:availability>
${hasSale
  ? `<g:price>${originalPrice!.toFixed(2)} NGN</g:price>\n<g:sale_price>${product.price.toFixed(2)} NGN</g:sale_price>`
  : `<g:price>${product.price.toFixed(2)} NGN</g:price>`
}
<g:condition>new</g:condition>
<g:brand>${escapeXML(product.brand ?? "DASE Supermarket")}</g:brand>
<g:product_type>${escapeXML(product.category)}</g:product_type>
<g:mpn>${escapeXML(product.id)}</g:mpn>
${keyFeatures.map((f) => `<g:feature_description>${escapeXML(f)}</g:feature_description>`).join("\n")}
${validSpecs.map((s) => `<g:product_detail>
  <g:section_name>${escapeXML(s.section)}</g:section_name>
  <g:attribute_name>${escapeXML(s.attribute)}</g:attribute_name>
  <g:attribute_value>${escapeXML(s.value!)}</g:attribute_value>
</g:product_detail>`).join("\n")}
</item>`
  })
  .join("\n\n")}

</channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
    },
  })
}