import { db } from "@/lib/db"

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://dasesupermarket.com"

function escapeXML(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const products = await db.product.findMany({
    include: {
      images: {
        take: 10,
        orderBy: {
          id: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss 
  version="2.0"
  xmlns:g="http://base.google.com/ns/1.0"
>
<channel>

<title>DASE Supermarket Products</title>

<link>${BASE_URL}</link>

<description>
Complete product catalog from DASE Supermarket
</description>

${products
  .map((product) => {
    const productUrl =
      `${BASE_URL}/product/${product.id}`

    const image =
      product.images[0]?.image || 
      `${BASE_URL}/placeholder.jpg`

    return `
<item>

<g:id>
${product.id}
</g:id>

<title>
${escapeXML(product.name)}
</title>

<description>
${escapeXML(product.description)}
</description>

<link>
${productUrl}
</link>

<g:image_link>
${image}
</g:image_link>

<g:availability>
${product.inStock ? "in stock" : "out of stock"}
</g:availability>

<g:price>
${product.price.toFixed(2)} NGN
</g:price>

<g:condition>
new
</g:condition>

<g:brand>
${escapeXML(product.brand ?? "DASE")}
</g:brand>

<g:product_type>
${escapeXML(product.category)}
</g:product_type>

</item>
`
  })
  .join("")}

</channel>
</rss>
`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, s-maxage=86400, stale-while-revalidate",
    },
  })
}