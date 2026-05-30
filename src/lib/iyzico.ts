import crypto from "crypto";

const IYZICO_API_URL = "https://sandbox-api.iyzipay.com";
const IYZICO_API_KEY = process.env.IYZICO_API_KEY || "";
const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY || "";

export type IyzicoPaymentRequest = {
  price: number;
  paidPrice: number;
  currency: string;
  basketId: string;
  paymentCard: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
    registerCard?: number;
  };
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    lastLoginDate: string;
    registrationDate: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
    zipCode: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  basketItems: {
    id: string;
    name: string;
    category1: string;
    category2: string;
    itemType: string;
    price: number;
  }[];
};

export type IyzicoPaymentResult = {
  status: string;
  locale: string;
  systemTime: number;
  conversationId: string;
  price: number;
  paidPrice: number;
  currency: string;
  paymentId: string;
  fraudStatus: number;
  resultCode: string;
  merchantCommissionRate: number;
  merchantCommissionRateAmount: number;
  paidWithStoredCard: boolean;
  cardUserKey: string;
  cardToken: string;
  cardAssociation: string;
  cardFamilyName: string;
  binNumber: number;
  lastFourDigits: string;
  cardType: string;
  installment: number;
  paymentGroupId: number;
};

function generateAuthString(path: string, body: string): string {
  const date = new Date().toUTCString();
  const toEncrypt = `${IYZICO_API_KEY}${date}${path}${body}`;
  const hmac = crypto.createHmac("sha256", IYZICO_SECRET_KEY);
  hmac.update(toEncrypt);
  const signature = hmac.digest("base64");
  return `apiKey:${IYZICO_API_KEY}&date:${date}&signature:${signature}`;
}

export async function createIyzicoPayment(
  request: IyzicoPaymentRequest
): Promise<IyzicoPaymentResult> {
  const path = "/payment/auth";
  const body = JSON.stringify(request);
  const authorization = generateAuthString(path, body);

  const response = await fetch(`${IYZICO_API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body,
  });

  return response.json() as Promise<IyzicoPaymentResult>;
}

export async function retrieveIyzicoPayment(
  paymentId: string,
  conversationId: string
): Promise<IyzicoPaymentResult> {
  const path = "/payment/detail";
  const body = JSON.stringify({ paymentId, conversationId });
  const authorization = generateAuthString(path, body);

  const response = await fetch(`${IYZICO_API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body,
  });

  return response.json() as Promise<IyzicoPaymentResult>;
}

export function isIyzicoConfigured(): boolean {
  return IYZICO_API_KEY.length > 0 && IYZICO_SECRET_KEY.length > 0;
}
