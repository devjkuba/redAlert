import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface PaymentQRCodeProps {
  readonly organizationId: number;
  readonly organizationName: string;
  readonly priceCzk: number;
}

export default function PaymentQRCode({
  organizationId,
  organizationName,
  priceCzk,
}: PaymentQRCodeProps) {
  // Vygenerujeme platební data pro QR kód ve formátu CZQR (pro bankovní platbu)
  // Příklad bankovního účtu - uprav podle skutečného:
  const accountNumber = "CZ1855000000007450466002";
  const currentYear = new Date().getFullYear();

  const qrValue = `SPD*1.0*ACC:${accountNumber}*AM:${priceCzk}.00*CC:CZK*MSG:Platba ročního předplatného pro organizaci ${organizationName}*X-VS:${organizationId}${currentYear}`;

  const paymentInfo = `
Platba aplikace
Částka: ${priceCzk} Kč
Variabilní symbol: ${organizationId}${currentYear}
Zpráva: Platba ročního předplatného pro organizaci ${organizationName}
`;

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg shadow-md bg-white max-w-xs mx-auto">
      <QRCodeSVG value={qrValue} size={180} />
      <pre className="text-xs whitespace-pre-wrap bg-gray-100 p-2 rounded w-full overflow-x-auto text-center">
        {paymentInfo}
      </pre>
    </div>
  );
}
