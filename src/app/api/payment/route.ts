import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { acquireDatabase, databaseUnavailable } from "@/server/database/access";
import { payments, users } from "@/db/schema";
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
      // Kullanıcı bilgilerini veritabanından çek
      const userList = await d.db.select({
        name: users.name,
        emailOrPhone: users.emailOrPhone,
      }).from(users).where(eq(users.id, session.id)).limit(1);
      const dbUser = userList[0];

      const userName = dbUser?.name || session.name || "Kullanıcı";
      const nameParts = userName.split(" ");
      const firstName = nameParts[0] || "Kullanıcı";
      const lastName = nameParts.slice(1).join(" ") || "Soyad";
      const userEmail = dbUser?.emailOrPhone || "kullanici@siteyonetim.app";
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail);

      const paymentRequest: IyzicoPaymentRequest = {
        price: amount,
        paidPrice: amount,
        currency: "TRY",
        basketId: `basket_${Date.now()}`,
        paymentCard: {
          cardHolderName: cardHolderName || firstName,
          cardNumber: cardNumber.replace(/\s/g, ""),
          expireMonth,
          expireYear,
          cvc,
          registerCard: 0,
        },
        buyer: {
          id: session.id,
          name: firstName,
          surname: lastName,
          gsmNumber: isEmail ? "" : userEmail.replace(/[^0-9+]/g, ""),
          email: isEmail ? userEmail : `${session.id}@siteyonetim.app`,
          identityNumber: "11111111111",
          lastLoginDate: new Date().toISOString(),
          registrationDate: new Date().toISOString(),
          registrationAddress: "Türkiye",
          ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0",
          city: "İstanbul",
          country: "Turkey",
          zipCode: "34000",
        },
        shippingAddress: {
          contactName: userName,
          city: "İstanbul",
          country: "Turkey",
          address: "Türkiye",
          zipCode: "34000",
        },
        billingAddress: {
          contactName: userName,
          city: "İstanbul",
          country: "Turkey",
          address: "Türkiye",
          zipCode: "34000",
        },
        basketItems: [
          {
            id: `aidat_${Date.now()}`,
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
          const errorMsg = result.errorMessage || result.resultMessage || "Ödeme başarısız oldu.";
          console.error(`[api/payment POST] Iyzico başarısız: ${result.resultCode} - ${errorMsg}`);
          return NextResponse.json({
            ok: false,
            status: "failed",
            error: errorMsg,
            resultCode: result.resultCode,
          }, { status: 400 });
        }
      } catch (paymentError) {
        console.error("[api/payment POST] Iyzico hatası:", paymentError);
        return NextResponse.json({
          ok: false,
          status: "error",
          error: "Ödeme ağ hatası. Lütfen tekrar deneyin.",
        }, { status: 500 });
      }
    } else {
      // Iyzico yapılandırılmamış — test modu
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
        paymentId: `test_${conversationId}`,
        message: "Ödeme test modunda kaydedildi. Gerçek ödeme için Iyzico yapılandırılmalıdır.",
        testMode: true,
      });
    }
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("[api/payment POST]", detail);
    return NextResponse.json({ error: "Ödeme işlenemedi." }, { status: 500 });
  }
}
