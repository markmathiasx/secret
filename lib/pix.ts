function onlyAscii(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 /.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function emv(id: string, value: string) {
  const size = String(value.length).padStart(2, "0");
  return `${id}${size}${value}`;
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function makePixPayload({ amount, description }: { amount: number; description: string }) {
  const key =
    process.env.PIX_KEY ||
    process.env.NEXT_PUBLIC_PIX_KEY ||
    process.env.NEXT_PUBLIC_DEFAULT_PIX_KEY ||
    "21974137662";
  const receiverName = process.env.PIX_RECEIVER_NAME || "MARK MATHIAS DO SACRAMENTO";
  const receiverCity = process.env.PIX_RECEIVER_CITY || "RIO DE JANEIRO";
  const merchantName = onlyAscii(receiverName).slice(0, 25) || "MDH 3D";
  const merchantCity = onlyAscii(receiverCity).slice(0, 15) || "RIO DE JANEIRO";
  const txid = "MDH3D";
  const gui = emv("00", "BR.GOV.BCB.PIX");
  const pixKey = emv("01", key.trim());
  const desc = description ? emv("02", onlyAscii(description).slice(0, 72)) : "";
  const merchantAccount = emv("26", `${gui}${pixKey}${desc}`);
  const amountTag = Number.isFinite(amount) && amount > 0 ? emv("54", amount.toFixed(2)) : "";
  const additional = emv("62", emv("05", txid));
  const payload = [
    emv("00", "01"),
    emv("01", "12"),
    merchantAccount,
    emv("52", "0000"),
    emv("53", "986"),
    amountTag,
    emv("58", "BR"),
    emv("59", merchantName),
    emv("60", merchantCity),
    additional,
    "6304"
  ].join("");

  return `${payload}${crc16(payload)}`;
}
