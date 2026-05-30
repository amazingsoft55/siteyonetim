import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { payments } from "@/db/schema";
import { createIyzicoPayment, isIyzicoConfigured, type IyzicoPaymentRequest } from "@/lib/iyzico";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const d = await acquireDatabase();
    if (!d.ok) return await databaseUnavailable();

    const body = await req.json() as {
      amount?: number;
      cardHolderName?: string;
      cardNumber?: string;
      expireMonth?: string;
      expireYear?: string;
      cvc?: string;
      period?: string;
    };

    const { amount, cardHolderName, cardNumber, expireMonth, expireYear, cvc, period } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Geçersiz tutar." }, { status: 400 });
    }

    if (!cardNumber || !expireMonth || !expireYear || !cvc) {
      return NextResponse.json({ error: "Kart bilgileri zorunludur." }, { status: 400 });
    }

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (isIyzicoConfigured()) {
      const cardDigits = cardNumber.replace(/\s/g, "").slice(0, 6);
      const cardLastDigits = cardNumber.replace(/\s/g, "").slice(-4);

      const paymentRequest: IyzicoPaymentRequest = {
        price: amount,
        paidPrice: amount,
        currency: "TRY",
        basketId: `basket_${Date.now()}`,
        paymentCard: {
          cardHolderName: cardHolderName || "TEST",
          cardNumber: cardNumber.replace(/\s/g, ""),
          expireMonth,
          expireYear,
          cvc,
          registerCard: 0,
        },
        buyer: {
          id: session.id,
          name: session.name || "Kullanıcı",
          surname: "",
          gsmNumber: "+905000000000",
          email: "test@test.com",
          identityNumber: "11111111111",
          lastLoginDate: new Date().toISOString(),
          registrationDate: new Date().toISOString(),
          registrationAddress: "İstanbul",
          ip: "127.0.0.1",
          city: "İstanbul",
          country: "Turkey",
          zipCode: "34000",
        },
        shippingAddress: {
          contactName: session.name || "Kullanıcı",
          city: "İstanbul",
          country: "Turkey",
          address: "İstanbul",
          zipCode: "34000",
        },
        billingAddress: {
          contactName: session.name || "Kullanıcı",
          city: "İstanbul",
          country: "Turkey",
          address: "İstanbul",
          zipCode: "34000",
        },
        basketItems: [
          {
            id: "aidat_001",
            name: period || "Aidat Ödemesi",
            category1: "Aidat",
            category2: "Site Yönetimi",
            itemType: "VIRTUAL",
            price: amount,
          },
        ],
      };

      try {
        const result = await createIyzicoPayment(paymentRequest);

        if (result.status === "success") {
          await d.db.insert(payments).values({
            id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            userId: session.id,
            amount,
            title: period || "Aidat Ödemesi",
            status: "PAID",
            paidAt: new Date().toISOString(),
          });

          return NextResponse.json({
            ok: true,
            status: "success",
            paymentId: result.paymentId,
            message: "Ödeme başarıyla tamamlandı.",
          });
        } else {
          return NextResponse.json({
            ok: false,
            status: "failed",
            error: result.resultCode || "Ödeme başarısız oldu.",
          }, { status: 400 });
        }
      } catch (paymentError) {
        console.error("[api/payment POST] Iyzico error:", paymentError);
        return NextResponse.json({
          ok: false,
          status: "error",
          error: "Ödeme sırasında bir hata oluştu.",
        }, { status: 500 });
      }
    } else {
      await d.db.insert(payments).values({
        id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId: session.id,
        amount,
        title: period || "Aidat Ödemesi",
        status: "PAID",
        paidAt: new Date().toISOString(),
      });

      return NextResponse.json({
        ok: true,
        status: "success",
        paymentId: `mock_${conversationId}`,
        message: "Ödeme kaydı alındı (test modu).",
        testMode: true,
      });
    }
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/payment POST]", detail);
    return NextResponse.json({ error: "Ödeme işlenemedi." }, { status: 500 });
  }
}
