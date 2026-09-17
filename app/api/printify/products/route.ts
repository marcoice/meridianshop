import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getFirstShopId, getProducts } from "@/lib/printify";

export async function GET(request: NextRequest) {
  try {
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10))
    );

    const shopId = await getFirstShopId();
    const data = await getProducts(shopId, page, limit);

    // Filter to show only published products (visible: true)
    const publishedProducts = data.data.filter((product) => product.visible);

    return NextResponse.json({
      ...data,
      data: publishedProducts,
    });
  } catch (err) {
    console.error("[/api/printify/products]", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
