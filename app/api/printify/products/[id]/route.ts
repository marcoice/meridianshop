import { NextResponse } from "next/server";
import { getFirstShopId, getProduct } from "@/lib/printify";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const shopId = await getFirstShopId();
    const product = await getProduct(shopId, id);

    return NextResponse.json(product);
  } catch (err) {
    console.error("[/api/printify/products/[id]]", err);
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }
}
